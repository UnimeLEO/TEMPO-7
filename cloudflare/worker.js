// TEMPO-7 v0.8.2 — Personal Cloud Sync backend
// Personal Cloud Sync: config snapshot + revision control + R2 audio sync.
// Cloudflare Worker (ES module syntax)
//
// Required bindings/secrets:
//   env.DB       -> D1 database binding
//   env.AUDIO    -> R2 bucket binding
//   env.SYNC_KEY -> Worker Secret
//
// D1 schema: reuse Step 1 schema.sql unchanged.

const SERVICE_NAME = "TEMPO-7 Sync";
const SERVICE_VERSION = "0.8.2";
const CLOUD_SCHEMA_VERSION = 1;
const PROD_ORIGIN = "https://unimeleo.github.io";

const MAX_CONFIG_BYTES = 2 * 1024 * 1024; // 2 MiB serialized JSON
const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MiB per bell file
const MAX_SLOT_LENGTH = 128;
const MAX_DEVICE_ID_LENGTH = 128;
const MAX_FILENAME_LENGTH = 255;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (origin === PROD_ORIGIN) return true;
  return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
}

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = {
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Expose-Headers":
      "ETag, X-TEMPO7-SHA256, X-TEMPO7-Filename-Encoded, X-TEMPO7-Revision",
    "Access-Control-Max-Age": "86400",
  };

  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function jsonResponse(request, body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(request),
      ...extraHeaders,
    },
  });
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function nowIso() {
  return new Date().toISOString();
}

function textBytes(value) {
  return new TextEncoder().encode(value);
}

function constantTimeEqual(a, b) {
  const aa = textBytes(a);
  const bb = textBytes(b);
  const max = Math.max(aa.length, bb.length);
  let diff = aa.length ^ bb.length;

  for (let i = 0; i < max; i += 1) {
    diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }

  return diff === 0;
}

function readBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  return match ? match[1] : null;
}

function isAuthorized(request, env) {
  const token = readBearerToken(request);
  return Boolean(token && env.SYNC_KEY && constantTimeEqual(token, env.SYNC_KEY));
}

function unauthorized(request) {
  return jsonResponse(
    request,
    { ok: false, error: "UNAUTHORIZED" },
    401,
    { "WWW-Authenticate": 'Bearer realm="TEMPO-7 Sync"' }
  );
}

function requireAuth(request, env) {
  return isAuthorized(request, env) ? null : unauthorized(request);
}

function parseJsonText(text, fallback, label) {
  try {
    const value = JSON.parse(text);
    return value ?? fallback;
  } catch (error) {
    throw new Error(`${label} contains invalid JSON: ${errorMessage(error)}`);
  }
}

function normalizeManifest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { slots: {} };
  }

  if (!value.slots || typeof value.slots !== "object" || Array.isArray(value.slots)) {
    return { ...value, slots: {} };
  }

  return value;
}

async function readSyncState(env, includePayload = true) {
  const columns = includePayload
    ? `revision, schema_version, config_json, audio_manifest_json, updated_at, updated_by_device`
    : `revision, schema_version, updated_at, updated_by_device`;

  const row = await env.DB.prepare(
    `SELECT ${columns}\n       FROM sync_state\n      WHERE id = 1`
  ).first();

  if (!row) return null;

  const state = {
    revision: Number(row.revision),
    schemaVersion: Number(row.schema_version),
    updatedAt: row.updated_at,
    updatedByDevice: row.updated_by_device ?? null,
  };

  if (includePayload) {
    state.config = parseJsonText(row.config_json, {}, "config_json");
    state.audioManifest = normalizeManifest(
      parseJsonText(row.audio_manifest_json, { slots: {} }, "audio_manifest_json")
    );
  }

  return state;
}

function cloudMeta(state) {
  return {
    revision: state.revision,
    schemaVersion: state.schemaVersion,
    updatedAt: state.updatedAt,
    updatedByDevice: state.updatedByDevice,
  };
}

function conflictResponse(request, state) {
  return jsonResponse(
    request,
    {
      ok: false,
      error: "REVISION_CONFLICT",
      cloud: cloudMeta(state),
    },
    409
  );
}

function validateDeviceId(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_DEVICE_ID_LENGTH) return null;
  return trimmed;
}

function validateBaseRevision(value) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function validateSlot(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_SLOT_LENGTH) return null;
  if (/[/\\\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

function normalizeFilename(value, fallback) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, MAX_FILENAME_LENGTH);
}

function slotFromPath(pathname) {
  if (!pathname.startsWith("/audio/")) return null;
  const raw = pathname.slice("/audio/".length);
  if (!raw || raw.includes("/")) return null;

  try {
    return validateSlot(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

function objectSafeSlot(slot) {
  return encodeURIComponent(slot).replace(/%/g, "_");
}

function makeObjectKey(slot, revision, sha256) {
  return `slots/${objectSafeSlot(slot)}/r${revision}-${sha256}`;
}

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sameAudioMetadata(a, b) {
  return Boolean(
    a &&
      a.sha256 === b.sha256 &&
      Number(a.size) === Number(b.size) &&
      a.contentType === b.contentType &&
      a.fileName === b.fileName
  );
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function handleHealth(request, env) {
  const missing = [];
  if (!env.DB) missing.push("DB");
  if (!env.AUDIO) missing.push("AUDIO");
  if (!env.SYNC_KEY) missing.push("SYNC_KEY");

  if (missing.length > 0) {
    return jsonResponse(
      request,
      {
        ok: false,
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        step: 2,
        error: "MISSING_BINDINGS",
        missing,
      },
      503
    );
  }

  try {
    const state = await readSyncState(env, false);
    if (!state) {
      return jsonResponse(
        request,
        {
          ok: false,
          service: SERVICE_NAME,
          version: SERVICE_VERSION,
          step: 2,
          error: "DATABASE_NOT_INITIALIZED",
        },
        503
      );
    }

    return jsonResponse(request, {
      ok: true,
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      step: 2,
      database: "ready",
      audioBinding: "ready",
      ...cloudMeta(state),
    });
  } catch (error) {
    return jsonResponse(
      request,
      {
        ok: false,
        service: SERVICE_NAME,
        version: SERVICE_VERSION,
        step: 2,
        error: "DATABASE_ERROR",
        message: errorMessage(error),
      },
      503
    );
  }
}

async function handleAuthTest(request, env) {
  const authFailure = requireAuth(request, env);
  if (authFailure) return authFailure;

  try {
    const state = await readSyncState(env, false);
    if (!state) {
      return jsonResponse(request, { ok: false, error: "DATABASE_NOT_INITIALIZED" }, 503);
    }

    return jsonResponse(request, {
      ok: true,
      authenticated: true,
      ...cloudMeta(state),
    });
  } catch (error) {
    return jsonResponse(
      request,
      { ok: false, error: "DATABASE_ERROR", message: errorMessage(error) },
      503
    );
  }
}

async function handleGetSync(request, env) {
  const authFailure = requireAuth(request, env);
  if (authFailure) return authFailure;

  try {
    const state = await readSyncState(env, true);
    if (!state) {
      return jsonResponse(request, { ok: false, error: "DATABASE_NOT_INITIALIZED" }, 503);
    }

    return jsonResponse(request, {
      ok: true,
      ...cloudMeta(state),
      config: state.config,
      audioManifest: state.audioManifest,
    });
  } catch (error) {
    return jsonResponse(
      request,
      { ok: false, error: "SYNC_READ_FAILED", message: errorMessage(error) },
      500
    );
  }
}

async function handlePutSync(request, env) {
  const authFailure = requireAuth(request, env);
  if (authFailure) return authFailure;

  const body = await parseJsonBody(request);
  if (!body || !isPlainObject(body)) {
    return jsonResponse(request, { ok: false, error: "INVALID_JSON_BODY" }, 400);
  }

  const baseRevision = validateBaseRevision(body.baseRevision);
  const deviceId = validateDeviceId(body.deviceId);
  const schemaVersion = validateBaseRevision(body.schemaVersion);

  if (baseRevision === null) {
    return jsonResponse(request, { ok: false, error: "INVALID_BASE_REVISION" }, 400);
  }
  if (!deviceId) {
    return jsonResponse(request, { ok: false, error: "INVALID_DEVICE_ID" }, 400);
  }
  if (schemaVersion !== CLOUD_SCHEMA_VERSION) {
    return jsonResponse(
      request,
      {
        ok: false,
        error: "UNSUPPORTED_SCHEMA_VERSION",
        supportedSchemaVersion: CLOUD_SCHEMA_VERSION,
      },
      409
    );
  }
  if (!isPlainObject(body.config)) {
    return jsonResponse(request, { ok: false, error: "INVALID_CONFIG" }, 400);
  }

  const configJson = JSON.stringify(body.config);
  const configBytes = textBytes(configJson).byteLength;
  if (configBytes > MAX_CONFIG_BYTES) {
    return jsonResponse(
      request,
      {
        ok: false,
        error: "CONFIG_TOO_LARGE",
        maxBytes: MAX_CONFIG_BYTES,
        receivedBytes: configBytes,
      },
      413
    );
  }

  try {
    const state = await readSyncState(env, true);
    if (!state) {
      return jsonResponse(request, { ok: false, error: "DATABASE_NOT_INITIALIZED" }, 503);
    }

    if (state.revision !== baseRevision) {
      return conflictResponse(request, state);
    }

    const existingJson = JSON.stringify(state.config);
    if (existingJson === configJson && state.schemaVersion === schemaVersion) {
      return jsonResponse(request, {
        ok: true,
        changed: false,
        ...cloudMeta(state),
      });
    }

    const newRevision = baseRevision + 1;
    const updatedAt = nowIso();
    const result = await env.DB.prepare(
      `UPDATE sync_state
          SET revision = ?,
              schema_version = ?,
              config_json = ?,
              updated_at = ?,
              updated_by_device = ?
        WHERE id = 1 AND revision = ?`
    )
      .bind(newRevision, schemaVersion, configJson, updatedAt, deviceId, baseRevision)
      .run();

    if ((result.meta?.changes ?? 0) !== 1) {
      const latest = await readSyncState(env, false);
      return conflictResponse(request, latest ?? state);
    }

    return jsonResponse(request, {
      ok: true,
      changed: true,
      revision: newRevision,
      schemaVersion,
      updatedAt,
      updatedByDevice: deviceId,
    });
  } catch (error) {
    return jsonResponse(
      request,
      { ok: false, error: "SYNC_WRITE_FAILED", message: errorMessage(error) },
      500
    );
  }
}

async function handleGetAudio(request, env, slot, headOnly = false) {
  const authFailure = requireAuth(request, env);
  if (authFailure) return authFailure;

  try {
    const state = await readSyncState(env, true);
    if (!state) {
      return jsonResponse(request, { ok: false, error: "DATABASE_NOT_INITIALIZED" }, 503);
    }

    const entry = state.audioManifest.slots?.[slot];
    if (!entry) {
      return jsonResponse(request, { ok: false, error: "AUDIO_SLOT_NOT_FOUND", slot }, 404);
    }

    const object = headOnly
      ? await env.AUDIO.head(entry.objectKey)
      : await env.AUDIO.get(entry.objectKey);

    if (!object) {
      return jsonResponse(
        request,
        {
          ok: false,
          error: "AUDIO_OBJECT_MISSING",
          slot,
          objectKey: entry.objectKey,
        },
        502
      );
    }

    const headers = new Headers({
      "Content-Type": entry.contentType || "application/octet-stream",
      "Content-Length": String(entry.size ?? object.size ?? 0),
      "Cache-Control": "no-store",
      ETag: `"${entry.sha256}"`,
      "X-TEMPO7-SHA256": entry.sha256,
      "X-TEMPO7-Filename-Encoded": encodeURIComponent(entry.fileName || slot),
      "X-TEMPO7-Revision": String(state.revision),
      ...corsHeaders(request),
    });

    if (headOnly) {
      return new Response(null, { status: 200, headers });
    }

    return new Response(object.body, { status: 200, headers });
  } catch (error) {
    return jsonResponse(
      request,
      { ok: false, error: "AUDIO_READ_FAILED", message: errorMessage(error) },
      500
    );
  }
}

async function handlePutAudio(request, env, url, slot) {
  const authFailure = requireAuth(request, env);
  if (authFailure) return authFailure;

  const baseRevision = validateBaseRevision(url.searchParams.get("baseRevision"));
  const deviceId = validateDeviceId(url.searchParams.get("deviceId"));
  const fileName = normalizeFilename(url.searchParams.get("filename"), `${slot}.audio`);
  const contentType = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();

  if (baseRevision === null) {
    return jsonResponse(request, { ok: false, error: "INVALID_BASE_REVISION" }, 400);
  }
  if (!deviceId) {
    return jsonResponse(request, { ok: false, error: "INVALID_DEVICE_ID" }, 400);
  }
  if (!contentType.startsWith("audio/")) {
    return jsonResponse(
      request,
      { ok: false, error: "INVALID_AUDIO_CONTENT_TYPE", received: contentType || null },
      415
    );
  }

  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_AUDIO_BYTES) {
    return jsonResponse(
      request,
      { ok: false, error: "AUDIO_TOO_LARGE", maxBytes: MAX_AUDIO_BYTES, receivedBytes: declaredLength },
      413
    );
  }

  try {
    const state = await readSyncState(env, true);
    if (!state) {
      return jsonResponse(request, { ok: false, error: "DATABASE_NOT_INITIALIZED" }, 503);
    }

    if (state.revision !== baseRevision) {
      return conflictResponse(request, state);
    }

    const buffer = await request.arrayBuffer();
    if (buffer.byteLength === 0) {
      return jsonResponse(request, { ok: false, error: "EMPTY_AUDIO" }, 400);
    }
    if (buffer.byteLength > MAX_AUDIO_BYTES) {
      return jsonResponse(
        request,
        { ok: false, error: "AUDIO_TOO_LARGE", maxBytes: MAX_AUDIO_BYTES, receivedBytes: buffer.byteLength },
        413
      );
    }

    const sha256 = await sha256Hex(buffer);
    const existing = state.audioManifest.slots?.[slot] ?? null;
    const incomingMetadata = {
      sha256,
      size: buffer.byteLength,
      contentType,
      fileName,
    };

    if (sameAudioMetadata(existing, incomingMetadata)) {
      // Self-heal R2 if metadata exists but the object was manually removed.
      const head = await env.AUDIO.head(existing.objectKey);
      if (!head) {
        await env.AUDIO.put(existing.objectKey, buffer, {
          httpMetadata: { contentType },
          customMetadata: { sha256 },
        });
      }

      return jsonResponse(request, {
        ok: true,
        changed: false,
        slot,
        audio: existing,
        ...cloudMeta(state),
      });
    }

    const newRevision = baseRevision + 1;
    const updatedAt = nowIso();
    let objectKey = existing?.objectKey ?? null;
    const contentChanged = !existing || existing.sha256 !== sha256 || Number(existing.size) !== buffer.byteLength;

    if (contentChanged) {
      objectKey = makeObjectKey(slot, newRevision, sha256);
      await env.AUDIO.put(objectKey, buffer, {
        httpMetadata: { contentType },
        customMetadata: { sha256 },
      });
    } else if (objectKey) {
      const head = await env.AUDIO.head(objectKey);
      if (!head) {
        await env.AUDIO.put(objectKey, buffer, {
          httpMetadata: { contentType },
          customMetadata: { sha256 },
        });
      }
    }

    const nextManifest = structuredClone(state.audioManifest);
    nextManifest.slots[slot] = {
      objectKey,
      sha256,
      size: buffer.byteLength,
      contentType,
      fileName,
      updatedAt,
      updatedByDevice: deviceId,
      revision: newRevision,
    };

    const result = await env.DB.prepare(
      `UPDATE sync_state
          SET revision = ?,
              audio_manifest_json = ?,
              updated_at = ?,
              updated_by_device = ?
        WHERE id = 1 AND revision = ?`
    )
      .bind(newRevision, JSON.stringify(nextManifest), updatedAt, deviceId, baseRevision)
      .run();

    if ((result.meta?.changes ?? 0) !== 1) {
      const latest = await readSyncState(env, false);
      return conflictResponse(request, latest ?? state);
    }

    // Each changed audio body receives a revision-specific R2 key, so the previous
    // key cannot be reused by a later successful revision. It is safe to remove it.
    if (contentChanged && existing?.objectKey && existing.objectKey !== objectKey) {
      try {
        await env.AUDIO.delete(existing.objectKey);
      } catch {
        // Metadata is already authoritative. An orphaned old object is harmless and
        // can be cleaned manually later; do not fail the successful sync operation.
      }
    }

    return jsonResponse(request, {
      ok: true,
      changed: true,
      slot,
      revision: newRevision,
      schemaVersion: state.schemaVersion,
      updatedAt,
      updatedByDevice: deviceId,
      audio: nextManifest.slots[slot],
    });
  } catch (error) {
    return jsonResponse(
      request,
      { ok: false, error: "AUDIO_WRITE_FAILED", message: errorMessage(error) },
      500
    );
  }
}

async function handleDeleteAudio(request, env, url, slot) {
  const authFailure = requireAuth(request, env);
  if (authFailure) return authFailure;

  const baseRevision = validateBaseRevision(url.searchParams.get("baseRevision"));
  const deviceId = validateDeviceId(url.searchParams.get("deviceId"));

  if (baseRevision === null) {
    return jsonResponse(request, { ok: false, error: "INVALID_BASE_REVISION" }, 400);
  }
  if (!deviceId) {
    return jsonResponse(request, { ok: false, error: "INVALID_DEVICE_ID" }, 400);
  }

  try {
    const state = await readSyncState(env, true);
    if (!state) {
      return jsonResponse(request, { ok: false, error: "DATABASE_NOT_INITIALIZED" }, 503);
    }

    if (state.revision !== baseRevision) {
      return conflictResponse(request, state);
    }

    const existing = state.audioManifest.slots?.[slot] ?? null;
    if (!existing) {
      return jsonResponse(request, {
        ok: true,
        changed: false,
        slot,
        ...cloudMeta(state),
      });
    }

    const nextManifest = structuredClone(state.audioManifest);
    delete nextManifest.slots[slot];

    const newRevision = baseRevision + 1;
    const updatedAt = nowIso();
    const result = await env.DB.prepare(
      `UPDATE sync_state
          SET revision = ?,
              audio_manifest_json = ?,
              updated_at = ?,
              updated_by_device = ?
        WHERE id = 1 AND revision = ?`
    )
      .bind(newRevision, JSON.stringify(nextManifest), updatedAt, deviceId, baseRevision)
      .run();

    if ((result.meta?.changes ?? 0) !== 1) {
      const latest = await readSyncState(env, false);
      return conflictResponse(request, latest ?? state);
    }

    let objectDeleted = true;
    try {
      await env.AUDIO.delete(existing.objectKey);
    } catch {
      objectDeleted = false;
    }

    return jsonResponse(request, {
      ok: true,
      changed: true,
      slot,
      deleted: true,
      objectDeleted,
      revision: newRevision,
      schemaVersion: state.schemaVersion,
      updatedAt,
      updatedByDevice: deviceId,
    });
  } catch (error) {
    return jsonResponse(
      request,
      { ok: false, error: "AUDIO_DELETE_FAILED", message: errorMessage(error) },
      500
    );
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin");
      if (!isAllowedOrigin(origin)) {
        return new Response(null, { status: 403, headers: corsHeaders(request) });
      }
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return handleHealth(request, env);
    }

    if (request.method === "GET" && url.pathname === "/auth-test") {
      return handleAuthTest(request, env);
    }

    if (url.pathname === "/sync") {
      if (request.method === "GET") return handleGetSync(request, env);
      if (request.method === "PUT") return handlePutSync(request, env);
      return jsonResponse(request, { ok: false, error: "METHOD_NOT_ALLOWED" }, 405, {
        Allow: "GET, PUT, OPTIONS",
      });
    }

    if (url.pathname.startsWith("/audio/")) {
      const slot = slotFromPath(url.pathname);
      if (!slot) {
        return jsonResponse(request, { ok: false, error: "INVALID_AUDIO_SLOT" }, 400);
      }

      if (request.method === "GET") return handleGetAudio(request, env, slot, false);
      if (request.method === "HEAD") return handleGetAudio(request, env, slot, true);
      if (request.method === "PUT") return handlePutAudio(request, env, url, slot);
      if (request.method === "DELETE") return handleDeleteAudio(request, env, url, slot);

      return jsonResponse(request, { ok: false, error: "METHOD_NOT_ALLOWED" }, 405, {
        Allow: "GET, HEAD, PUT, DELETE, OPTIONS",
      });
    }

    return jsonResponse(request, { ok: false, error: "NOT_FOUND" }, 404);
  },
};

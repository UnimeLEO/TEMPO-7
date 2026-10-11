-- TEMPO-7 v0.8.2 — Step 1
-- D1 bootstrap schema for Personal Cloud Sync.
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS sync_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version >= 1),
  config_json TEXT NOT NULL DEFAULT '{}',
  audio_manifest_json TEXT NOT NULL DEFAULT '{"slots":{}}',
  updated_at TEXT NOT NULL,
  updated_by_device TEXT
);

INSERT OR IGNORE INTO sync_state (
  id,
  revision,
  schema_version,
  config_json,
  audio_manifest_json,
  updated_at,
  updated_by_device
) VALUES (
  1,
  0,
  1,
  '{}',
  '{"slots":{}}',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  NULL
);

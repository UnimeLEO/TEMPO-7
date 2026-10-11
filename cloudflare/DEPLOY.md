# TEMPO-7 v0.8.2 Cloudflare backend

Bindings expected by `worker.js`:

- `DB` → D1 database (`tempo7_db`)
- `AUDIO` → R2 bucket (`tempo7-audio`)
- `SYNC_KEY` → Worker Secret

Endpoint used by the web app:

```text
https://tempo7.njsukleo.workers.dev
```

For a fresh database, run `schema.sql` once in the D1 Console. Existing v0.8.2 Step 1/2 deployments do not need to rerun the schema. Deploying this final `worker.js` is functionally equivalent to the tested Step 2 Worker; it only reports the final service version `0.8.2`.

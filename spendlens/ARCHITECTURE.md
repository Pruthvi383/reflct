# Architecture

```mermaid
flowchart TD
  A["User fills audit form"] --> B["POST /api/audit"]
  B --> C["Zod validation"]
  C --> D["Deterministic audit engine"]
  D --> E["Supabase audits table if configured"]
  D --> F["Return auditId + result"]
  F --> G["Client stores result in localStorage"]
  G --> H["/results/[auditId]"]
  H --> I["POST /api/summary"]
  I --> J["Anthropic API or fallback template"]
  H --> K["POST /api/leads"]
  K --> L["Supabase leads table if configured"]
  K --> M["Resend confirmation if configured"]
```

## Rationale

The audit engine is deliberately separate from the UI and API route so it can be tested without a browser or database. External services are adapters around the core flow rather than requirements for the core math.

The app stores the audit response in localStorage before navigation because serverless memory is not durable. Supabase is the production storage path, while localStorage keeps the deployed demo usable without credentials.

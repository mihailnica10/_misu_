// Supabase a fost înlocuit cu Cloudflare D1 + JWT.
// Funcționalitatea a fost migrată în backend/src/worker.ts cu Hono + Drizzle.
// Vezi backend/src/db/ pentru schema Drizzle și backend/src/worker.ts pentru API.
//
// Context original păstrat pentru referință în istoricul git:
// - backend/src/lib/supabase.ts → șters
// - frontend/src/lib/supabase.ts → șters (înlocuit cu API calls la Worker)
// - frontend/src/lib/auth.ts → șters (JWT în Worker)

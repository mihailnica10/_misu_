# MIȘU — Full Stack Refactor & Deployment Plan

> **Context:** Fork din `willchen96/mike` → `mihailnica10/_misu_`. 
> Asistent juridic AI pentru piața românească.

---

## 📦 INVENTAR COMPLET — 10 Iunie 2026

### Backend (Worker API) — ✅ Deployed & Working
| Component | Status | Detalii |
|-----------|--------|---------|
| Hono Worker (`worker.ts`) | ✅ 2114 linii | Toate rutele implementate |
| Auth (JWT cu `jose`) | ✅ | signup, login, session, logout |
| User profile | ✅ | GET/PATCH `/user/profile` |
| API keys per user | ✅ | GET/PUT `/user/api-keys/:provider` |
| Projects CRUD | ✅ | + people, folders, sub-folders |
| Documents CRUD | ✅ | + versions, upload, download, R2 |
| Chat | ✅ | CRUD + mesaje, streaming |
| Workflows | ✅ | CRUD + shares, hidden |
| Tabular reviews | ✅ | cells, chat, generate |
| CaseLaw | ✅ | CourtListener integration |
| Database | ✅ D1 `misu-db` | 17 tabele (Drizzle ORM) |
| Storage | ✅ R2 `misu-documents` | Bucket creat |
| Endpoint | ✅ | `misu-api.mihailnica10.workers.dev` |
| **Secrets lipsă** | ❌ | Fără ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, COURTLISTENER_API_KEY |

### Frontend (Next.js 16) — 🔶 Code aproape gata
| Component | Status | Detalii |
|-----------|--------|---------|
| AuthContext | ✅ | JWT din localStorage |
| UserProfileContext | 🔶 **RESCRIS** | Acum merge la Worker API, nu Supabase |
| API client (`mikeApi.ts`) | ✅ | 847 linii, toate funcțiile |
| `misuApi.ts` | ✅ | Re-export layer + helpers |
| CaseLawPanel | 🔶 **REPARAT** | Tipuri adăugate, JSX completat |
| ProjectPage | ✅ | `initialTab` prop added |
| Build errors | 🔶 **1 rămas** | `filename` pe `MikeDocumentVersion` |
| BYOK UI (api-keys page) | 🔶 **Parțial** | Exists upstream, need verificare flow |
| Model selection UI | 🔶 **Parțial** | models/page.tsx, need verificare |
| Build local | ❌ | CPU 2012 → SIGBUS la SWC |
| i18n (EN/RO) | ❌ | Neînceput |
| Rebranding Mike→Mișu | ✅ | Complet |

### Infrastructure — 🔶 Parțial
| Component | Status | Detalii |
|-----------|--------|---------|
| Cloudflare Pages project | ✅ | `misu-a5e.pages.dev` (gol) |
| GitHub connection | ❌ | Pages neconectat la repo |
| Build pe CF Pages | ❌ | Configurat dar netestat |
| Domeniu misu.ro | ❌ | Neconfigurat |
| ENV vars production | ❌ | Worker: lipsesc chei AI. Pages: lipsă |
| D1 DB | ✅ | WEUR, tabele create |

---

## 🎯 STRATEGIE — "When in doubt, zoom out"

**Problema fundamentală:** 
Mașina asta (CPU 2012) nu poate face build local. Soluția corectă e să lăsăm **Cloudflare Pages să facă build-ul** pe serverele lor.

**Abordare:** 
1. Fixăm ultimele erori TypeScript
2. Commit + push pe GitHub
3. Conectăm Pages la GitHub → build automat în cloud
4. Adăugăm env vars (chei AI etc.)
5. Configurăm domeniul

**NU facem** pe mașina asta: build local, i18n, feature-uri noi. 
Totul merge în cloud după deploy.

---

## 📋 PLAN PE FAZE

### Faza 0 — Fix build error (1 minut)
**Task 0.1:** Adaugă `filename` la `MikeDocumentVersion`
- Fișier: `frontend/src/app/lib/mikeApi.ts`
- Adaugă `filename?: string | null;` în interfață

**Verificare:** `npm run build` → ✓ Compiled successfully

---

### Faza 1 — Commit + Push (2 minute)
**Task 1.1:** Commit toate modificările
```bash
git add frontend/src/
git commit -m "fix: type errors for Cloudflare Pages build"
git push origin main
```

**Verificare:** `git log --oneline -3` să arate commit-ul nou

---

### Faza 2 — Conectare Cloudflare Pages la GitHub (5 minute)
**Task 2.1:** Prin Cloudflare Dashboard (sau API):
- Mergi la https://dash.cloudflare.com → Workers & Pages → `misu`
- Tab: Settings → Git integration
- Conectează `mihailnica10/_misu_`
- Branch: `main`
- Build command: `cd frontend && npm run deploy`
- Build output: `.open-next`
- Root directory: (lasă gol sau `frontend/`)

**Task 2.2:** Adaugă environment variables în Cloudflare Pages:
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://misu-api.mihailnica10.workers.dev` |

**Verificare:** Primul build pornește automat → Pages deployează site-ul

---

### Faza 3 — Adăugare chei AI în Worker API (3 minute)
**Task 3.1:** Adaugă secrets prin wrangler:
```bash
cd backend
echo "sk-ant-..." | wrangler secret put ANTHROPIC_API_KEY
echo "AI-..." | wrangler secret put GEMINI_API_KEY
echo "sk-..." | wrangler secret put OPENAI_API_KEY
echo "sk-or-..." | wrangler secret put OPENROUTER_API_KEY
echo "..." | wrangler secret put COURTLISTENER_API_KEY
```

**Verificare:** `wrangler secret list` să arate toate cheile

---

### Faza 4 — Domeniu & DNS (5 minute)
**Task 4.1:** Adaugă `misu.ro` ca domain custom în Pages
- Tab: Custom domains → `misu.ro`
- Urmează instrucțiunile pentru DNS (CNAME la `misu-a5e.pages.dev`)

**Task 4.2:** Dacă Worker API vrea subdomeniu: `api.misu.ro`
- Adaugă route în Worker: `api.misu.ro/*`

---

### Faza 5 — Verificare post-deploy (3 minute)
**Task 5.1:** Verifică:
```bash
curl -s https://misu.ro/health    # sau /
curl -s https://misu-api.mihailnica10.workers.dev/health
```

**Task 5.2:** Testează login flow end-to-end:
- Deschide https://misu.ro
- Creează cont
- Verifică că session-ul persistă

---

### Faza 6 — BYOK + Settings UI (10 minute, după deploy)

**Context:** Userul își aduce propriile chei API (BYOK) și alege modelele preferate.

**Flow complet:**
```
Settings → API Keys → adaugă cheie → selectează provider → introdu cheia → salvează
Settings → Models → alege model pentru Chat / Tabular Review / Title Generation
```

**Task 6.1 — Verifică endpoint-urile BYOK în Worker:**
```bash
# Trebuie să meargă:
curl -X GET https://misu-api.../user/api-keys -H "Authorization: Bearer $TOKEN"
curl -X PUT https://misu-api.../user/api-keys/claude -H "..." -d '{"api_key":"sk-ant-..."}'
curl -X PUT https://misu-api.../user/api-keys/claude -H "..." -d '{"api_key":""}'  # DELETE
```

**Task 6.2 — Adaugă DELETE în Worker pentru BYOK:**
- Fișier: `backend/src/worker.ts`
- Adaugă: `users.delete('/api-keys/:provider', requireAuth, async (c) => { ... })`
- Ideal ca userul să poată șterge o cheie din UI

**Task 6.3 — Fixează `api-keys/page.tsx`:**
- Fișier: `frontend/src/app/(pages)/account/api-keys/page.tsx`
- Verifică că formularul funcționează: adaugă o cheie și vezi că statusul se actualizează
- Asigură-te că butonul de remove/delete cheie merge
- Lista de provideri: Claude, Gemini, OpenAI, OpenRouter, CourtListener
- UX: input de parolă cu toggle 👁, status vizual (configurat/neconfigurat), badge "env" dacă e setat în server

**Task 6.4 — Curăță `models/page.tsx`:**
- Fișier: `frontend/src/app/(pages)/account/models/page.tsx`
- Verifică că dropdown-ul de modele afișează doar providerii pentru care userul are cheie
- Flow: user alege provider → vezi modele disponibile → selectează model default
- Categorii de modele: Chat (general), Tabular Review, Title Generation (automat)

**Task 6.5 — Verify full BYOK cycle:**
```
1. Login → Settings → API Keys
2. Adaugă cheie Claude (sk-ant-...)
3. Salvează → vezi badge "Configurat"
4. Mergi la Models → vezi modele Claude disponibile
5. Selectează model pentru Tabular Review
6. Deschide un chat → vezi că opțiunile de model reflectă alegerea
7. Mergi înapoi la API Keys → șterge cheia
8. Verifică că badge-ul dispare și modelele Claude nu mai sunt disponibile
```

---

### Faza 7 — i18n EN/RO (fază separată, după deploy)
**Notă:** i18n se face DUPĂ deploy și BYOK. Lucrăm pe codul live.
- next-intl (deja în stack)
- 2 locale: en, ro
- Director: `frontend/src/messages/`
- Fără diacritice în URL-uri

---

## 📊 RISCURI & DECIZII

| Risc | Impact | Mitigare |
|------|--------|----------|
| Build fail pe CF Pages | Mediu | Testăm cu un deploy înainte de a configura domeniul |
| Chei AI lipsă | Funcțional | BYOK rezolvă: userul își adaugă propriile chei |
| BYOK delete endpoint lipsă | Mediu | Adăugăm DELETE în Worker API |
| UI settings buggy | Mic | Testăm end-to-end BYOK cycle |
| D1 + Pages binding | Mediu | Frontend-ul în Pages nu are acces direct la D1 (e prin Worker API) |
| i18n complex | Scăzut | Se face după deploy stabil + BYOK |
| Domeniu misu.ro luat | Posibil | Verificăm disponibilitatea înainte |

**Decizii de arhitectură (confirmate):**
- Frontend (Pages) ← API calls → Worker (Hono + D1) — separare clară
- Fără Supabase, Better Auth, Vercel, Docker, GitHub Actions
- Chat: TanStack AI pentru streaming
- Auth: JWT custom cu `jose`

---

## 📁 FIȘIERE CHEIE

| Fișier | Rol | Linii |
|--------|-----|-------|
| `backend/src/worker.ts` | Worker API (deployat) | 2.114 |
| `backend/src/db/schema.ts` | Schema D1 | 276 |
| `backend/wrangler.jsonc` | Config Worker | 28 |
| `frontend/src/app/lib/mikeApi.ts` | API client | 847 |
| `frontend/src/contexts/AuthContext.tsx` | Auth JWT | 115 |
| `frontend/src/contexts/UserProfileContext.tsx` | Profile API | ~290 |
| `frontend/src/app/lib/misuApi.ts` | Re-export layer | 84 |
| `frontend/wrangler.jsonc` | Config Pages | 24 |
| `frontend/open-next.config.ts` | OpenNext config | ~20 |
| `frontend/src/app/(pages)/account/api-keys/page.tsx` | BYOK UI | 222 |
| `frontend/src/app/(pages)/account/models/page.tsx` | Model selection | 263 |
| `frontend/src/app/(pages)/account/page.tsx` | Account settings | 240 |

---

**Ready to execute.** Vrei să începem cu Faza 0 (fix final build error)?

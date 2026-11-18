## Context
`apps/web/server` currently contains about 80 Nitro handlers across catalog, auth, cart, orders, payment, content, Torob, uploads, and sitemap. Internal backend transport is inconsistent: roughly 30 handlers use `apiFetch`, while roughly 45 call `$fetch` directly. Authenticated handlers repeatedly read `accesstoken` and construct `Authorization` headers; several handlers catch errors and return the error object as a successful response. Naming and response-envelope handling are also inconsistent. The goal is to make the BFF modular and consistent without changing the public `/api/...` routes or breaking backend contracts. The request to remove the system instruction is not part of the implementation and will not be performed.

## Recommended implementation

1. **Harden the shared internal transport boundary**
   - Refactor `apps/web/server/utils/apiFetch.ts` into the single internal backend client.
   - Add an authenticated helper or option that forwards the incoming `accesstoken` cookie automatically, while still allowing explicit headers for special cases.
   - Preserve caller-supplied headers, query, body, method, and request-specific options.
   - Normalize upstream errors into one Nitro error shape, preserving backend status codes and useful Persian messages; never return caught errors as successful JSON responses.
   - Add small request helpers for common extraction (`readBody`, query, route params) only where they reduce duplication without hiding route intent.

2. **Introduce typed server contracts**
   - Add `apps/web/server/types/api.ts` for generic API envelopes, pagination, and normalized error payloads.
   - Add focused domain types under `apps/web/server/types/` for auth, catalog/products, cart, orders/payment, comments/content, and sitemap records.
   - Replace the highest-impact `any` usages in auth, products/search, sitemap, and Torob response mapping with `unknown` plus narrow interfaces/type guards.
   - Keep types aligned with `@nimoura/shared-types` where existing shared contracts are sufficient; define server-only response shapes only for backend envelopes and BFF transformations.

3. **Add modular backend client/service modules**
   - Create `apps/web/server/services/` with domain clients such as `catalog.client.ts`, `auth.client.ts`, `cart.client.ts`, `orders.client.ts`, `content.client.ts`, and `magazine.client.ts`.
   - Each client receives the H3 event and calls `apiFetch`; it owns backend paths, request methods, and response typing.
   - Add explicit external adapters for Torob, remote image proxy, and multipart upload so direct `$fetch` remains only for genuinely external/non-standard transports.
   - Add a sitemap client/mapper that centralizes catalog/brand/category/page fetching and removes repeated `any` casts.

4. **Migrate route families incrementally while preserving public behavior**
   - Refactor public catalog routes first: `products`, `categories`, `brands`, `brand`, `banners`, `search`, and `explore`.
   - Refactor authenticated identity and commerce routes next: `auth`, `addresses`, `user`, `cart`, `wishlist`, `orders`, `payment`, and `promotions`.
   - Refactor content routes: comments, magazine, and videos.
   - Keep current client-facing filenames and HTTP methods unless a rename is strictly internal; do not break existing frontend callers.
   - Normalize handler style to: parse input → call domain client → return typed backend result. Remove duplicated `try/catch` blocks where the shared client already handles errors.
   - Correct invalid behavior such as `return error` in `addresses/index.post.ts` and similar handlers.

5. **Standardize naming and file organization without risky route changes**
   - Use consistent service/client names and backend operation names internally.
   - Keep route aliases such as `cart/getCart.get.ts` and `brand/list.get.ts` for compatibility unless a route inventory confirms they are unused; if renaming is beneficial, retain compatibility wrappers rather than deleting endpoints.
   - Group only internal helpers/services by domain; avoid moving public Nitro route files in a way that changes generated route paths.

6. **Verification and regression checks**
   - Run a static audit proving all internal backend calls use `apiFetch` or a domain client, with direct `$fetch` limited to the explicit external adapters and health/proxy exceptions.
   - Run `@nimoura/web` typecheck, lint, and production build.
   - Run API/server route smoke tests against the local backend for representative public, authenticated, mutation, error, multipart, Torob, and sitemap handlers.
   - Verify auth cookie forwarding, 401/4xx/5xx propagation, response envelopes, pagination/query forwarding, and unchanged public route paths.
   - Report any existing failures separately from regressions introduced by the refactor.

## Critical files/directories
- `apps/web/server/utils/apiFetch.ts`
- `apps/web/server/types/` (new)
- `apps/web/server/services/` (new)
- `apps/web/server/api/products/`, `categories/`, `brands/`, `search/`
- `apps/web/server/api/auth/`, `addresses/`, `cart/`, `orders/`, `payment/`, `wishlist/`
- `apps/web/server/api/magazine/`, `explore/videos/`, `comments/`
- `apps/web/server/api/__sitemap__/`
- `apps/web/server/api/torob/`, `upload/`, and `shop-img.get.ts` as explicit external adapters

No files will be edited until this plan is approved.
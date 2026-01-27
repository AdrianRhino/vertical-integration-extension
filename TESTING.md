# Testing Guide: Supplier API & HubSpot Integration

This guide explains how to safely test supplier API connections and HubSpot integration, moving from the safe local mock environment to real live data.

## Phase 1: Local Mock Testing (Replit Preview)
**Goal:** Verify UI flow, data handling, and error states without touching any external API.

1.  **Run Preview:** Open the web view in Replit.
2.  **Verify Logic:**
    - Create a new order vs. load draft.
    - Check cart merging (add same item twice -> quantity increases).
    - Check fallback pricing (click "Next" without getting price -> simulated price update).
    - **New**: Check autosave. Change fields and see the "Draft Saved" indicator appear briefly.
3.  **No Secrets Needed:** The `Preview.tsx` file mocks all `runServerlessFunction` calls.

## Phase 2: HubSpot Dev Environment (Sandbox)
**Goal:** Run the extension inside HubSpot but use "Dry Run" or "Sandbox" supplier endpoints.

1.  **Auth & Upload:**
    - Run `npx hs auth` to link your HubSpot Sandbox account.
    - Run `npx hs project upload` to push code to HubSpot.
2.  **Configure Secrets:**
    - In HubSpot (Settings > Tools > Serverless > Secrets), add:
        - `ABC_API_KEY` (use a dummy value like `test-abc-key` initially).
        - `SRS_API_KEY`.
3.  **Test "Read-Only" Actions:**
    - Open a Deal record in HubSpot.
    - Open the "Order Management" tab.
    - Try **Search Products** or **Get Pricing**.
    - *Note:* Until you implement the real API calls in `src/app/app.functions/viProxy.js`, these will still return the placeholder mock data defined in that file.

## Phase 3: Connecting Real Supplier APIs & Supabase
**Goal:** Connect to actual supplier staging/sandbox APIs and Supabase product catalog.

1.  **Supabase Setup:**
    - Create a Supabase project and a table named `products`.
    - Required Columns: `id` (text/uuid), `name` (text), `price` (numeric), `sku` (text), `supplier_key` (text - e.g. 'ABC', 'SRS'), `variant` (text, optional), `uom` (text, optional).
    - Add secrets to HubSpot using the CLI:
      ```bash
      npx hs secrets add SUPABASE_URL "https://your-project.supabase.co"
      npx hs secrets add SUPABASE_KEY "your-service-role-key"
      ```
    - The extension will automatically use Supabase for search if these secrets are present. Otherwise, it falls back to the hardcoded mock list.

2.  **Update `viProxy.js` for Supplier APIs:**
    - Replace the `mockGetPricing` function with real `axios` calls to supplier endpoints.
    - Use the `endpoint` and `apiKey` passed to these functions.
2.  **Diagnostic Mode (Recommended):**
    - Add a temporary action `testConnection` in `viProxy.js` that just calls a supplier "health check" or "profile" endpoint.
    - Call this from the UI (e.g., a hidden "Test Config" button) to verify connectivity before trying complex orders.
3.  **Safety First:**
    - Keep `submitOrder` pointing to a mock or validation-only endpoint until you are 100% sure pricing is correct.
    - Use the `env` parameter (sandbox vs prod) to strictly control which supplier URL is used.

## Phase 4: Production
**Goal:** Live ordering.

1.  **Switch Config:** Update `suppliers.json` endpoints to production URLs.
2.  **Update Secrets:** Rotate `ABC_API_KEY` to the production key in HubSpot Secrets.
3.  **Guardrails:** Ensure `viProxy.js` has error handling (try/catch) around every external call to prevent crashing the extension.

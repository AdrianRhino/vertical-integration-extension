# GUARDRAILS

This file acts as the source of truth for all rules, invariants, and constraints for the Order Management UI Extension.
Reference this file before making architectural changes.

## 1. Architecture Constraints
- **One Door for Suppliers**: All UI communication with suppliers MUST go through `src/app/app.functions/viProxy.js`. No direct API calls from the UI.
- **Config-First**: Supplier details (endpoints, keys, capabilities) and business logic (rules, UOMs) must be defined in `src/app/extensions/config/`. Do not hardcode these in JS.
- **Serverless Env**: The backend is HubSpot Serverless (Node.js 18). Secrets must be accessed via `context.secrets`.
- **Stateless Server**: Serverless functions are stateless. Pass all necessary context in the payload.

## 2. UI/UX Invariants
- **6-Step Wizard**: The order flow MUST follow exactly these 6 steps in order:
  1. `00-orderStart`
  2. `01-pickupSetup`
  3. `02-pricingTable`
  4. `03-deliveryForm`
  5. `04-reviewSubmit`
  6. `05-successPage`
- **Props Contract**: All wizard pages must accept and utilize:
  - `context`: HubSpot context object.
  - `actions`: UI action wrappers (alerts, etc.).
  - `runServerlessFunction`: Bridge to backend.
  - `order`: Current order state object.
  - `setOrder`: State updater.
  - `setCurrentPage`: Navigation control.
  - `setCanGoNext`: Validation signal.

## 3. Data & Limits
- **Quota Awareness**: Respect HubSpot API rate limits. Cache pricing where possible (though not implemented yet, design for it).
- **String Limits**: CRM card payloads have size limits. Keep mock data and state concise.
- **Secrets**: NEVER check in API keys. Use `serverless.json` secrets mapping and Replit Secrets/HubSpot Secrets.

## 4. Replit vs. HubSpot
- **Preview**: UI Extension preview in Replit is a MOCK. Real behavior requires `hs project upload` and viewing in a HubSpot portal.
- **Hot Reload**: `hs project dev` hot reload does not work natively inside Replit. Use manual upload or watch scripts.

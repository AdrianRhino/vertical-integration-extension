# Order Management UI Extension

## Overview

This is a HubSpot CRM UI Extension for order management with supplier integration. The application provides a 6-step wizard flow for creating and managing orders within HubSpot's CRM interface. It connects to external supplier APIs (ABC Supply, SRS) for product search, pricing, and order submission.

The project has a dual architecture: a React-based preview environment running in Replit for development/testing, and the actual HubSpot serverless extension code that gets deployed to HubSpot portals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Preview Environment**: Vite + React + TypeScript application in `client/` directory for local development and testing
- **HubSpot Extension**: JSX components in `src/app/extensions/` using HubSpot's UI Extensions React components
- **UI Components**: shadcn/ui component library with Tailwind CSS for the preview environment
- **Mirror Pattern**: `client/src/extensions-mirror/` contains React versions of HubSpot extension components for browser-based testing

### 6-Step Wizard Flow (Invariant)
The order flow follows exactly these steps in order:
1. `00-orderStart` - Template selection and order initialization
2. `01-pickupSetup` - Pickup configuration
3. `02-pricingTable` - Product selection and pricing
4. `03-deliveryForm` - Delivery details
5. `04-reviewSubmit` - Order review and submission
6. `05-successPage` - Confirmation

### Backend Architecture
- **Single Entry Point**: All supplier API communication goes through `src/app/app.functions/viProxy.js` - no direct API calls from UI
- **Supplier Adapters**: `server/suppliers/` contains adapter classes (e.g., `ABCAdapter`) that handle supplier-specific API transformations
- **Token Service**: `server/suppliers/token-service.ts` manages OAuth token caching for supplier APIs
- **HubSpot Serverless**: Node.js 18 runtime for the actual deployed functions

### Configuration-First Design
- **Supplier Config**: `client/src/extensions-mirror/config/suppliers.json` defines supplier endpoints, capabilities, and defaults
- **No Hardcoding**: Business logic, UOMs, and supplier details must be defined in config files, not in JavaScript

### State Management
- **Stateless Server**: HubSpot serverless functions are stateless; all context must be passed in payloads
- **Props Contract**: All wizard pages accept `context`, `actions`, `runServerlessFunction`, `order`, `setOrder`, `setCurrentPage`, and `setCanGoNext`

## External Dependencies

### Supplier APIs (Multi-Supplier Architecture)
All suppliers use a modular adapter pattern in `server/suppliers/`:

- **ABC Supply** (`abc-adapter.ts`): 
  - Auth: OAuth2 client_credentials with Basic auth header
  - Endpoints: api.abcsupply.com (prod), api-sandbox.abcsupply.com (sandbox)
  - Status: ⚠️ Blocked by IP firewall - requires ABC to whitelist server IP
  - Required fields: branchNumber, shipToNumber

- **SRS Distribution** (`srs-adapter.ts`):
  - Auth: OAuth2 with URLSearchParams body (client_id, client_secret, grant_type, scope=ALL)
  - Endpoints: services.roofhub.pro (prod), services-qa.roofhub.pro (sandbox)
  - Status: ⚠️ Credentials returning 400 - may need activation by SRS support
  - Required fields: customerCode, branchCode, sourceSystem, transactionId

- **QXO/Beacon** (`beacon-adapter.ts`):
  - Auth: Session-based login (username, password, siteId, userAgent, apiSiteId)
  - Endpoints: qxo.digital (prod), uat.qxo.digital (sandbox)
  - Status: ✅ Working - login and pricing API functional
  - Required fields: accountId (optional), jobNumber (optional)

### Database
- **Supabase**: Optional product catalog storage with `products` table (id, name, price, sku, supplier_key, variant, uom)
- **PostgreSQL**: Drizzle ORM configured for potential future database needs (users table defined in `shared/schema.ts`)

### HubSpot Integration
- **CRM Record Tab**: Extension appears on Deal records in HubSpot CRM
- **Serverless Functions**: Runtime environment with secrets management via `context.secrets`
- **Properties Access**: Reads `dealname`, `amount`, `dealstage` from CRM records

### Secrets Required
- `ABC_CLIENT_ID` / `ABC_CLIENT_SECRET`: ABC Supply OAuth credentials
- `SRS_CLIENT_ID` / `SRS_CLIENT_SECRET`: SRS Distribution OAuth credentials
- `BEACON_USERNAME` / `BEACON_PASSWORD`: QXO/Beacon login credentials
- `BEACON_API_SITE_ID`: Optional QXO site identifier (defaults to 'UAT')
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY`: Product catalog connection
- `HUBSPOT_ACCOUNT_ID` / `HUBSPOT_PERSONAL_ACCESS_KEY`: For CLI deployment

### Development Tools
- **HubSpot CLI**: Required for `hs project upload` and deployment to portals
- **Vite**: Development server for preview environment
- **TanStack Query**: Data fetching and caching for the preview app

### HubSpot UI Component Mapping
The project includes mock HubSpot UI components (`client/src/hubspot-mock/ui-extensions-react.tsx`) that mirror official HubSpot UI Extensions React components:
- **Toggle**: Environment switch (sandbox/prod) - maps to HubSpot `@hubspot/ui-extensions` Toggle
- **Alert**: Warning messages - maps to HubSpot Alert component
- **Panel/PanelSection**: Card-like containers - maps to HubSpot Tile/Box components
- **StatusTag**: Connection status indicators - maps to HubSpot StatusTag
- **Select**: Dropdown menus - maps to HubSpot Select with options array

The `SettingsPanel.jsx` in extensions-mirror uses HubSpot-compatible components and can be translated to actual HubSpot extension code.

### Settings System
- **File Storage**: `supplier-settings.json` persists environment preferences
- **API Endpoints**: GET/POST/PATCH `/api/settings` for reading and updating
- **Per-Action Control**: Each supplier action (getPricing, submitOrder) can use sandbox or prod independently
- **Settings UI**: Both shadcn version (`/settings` route) and HubSpot version (`SettingsPanel.jsx`)
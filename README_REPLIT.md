# Replit Development Guide for HubSpot UI Extension

This project is set up for developing a HubSpot CRM UI Extension within Replit.

## ⚠️ Important Nuances

1.  **Preview Environment**: 
    - You cannot see the *actual* HubSpot CRM interface inside Replit.
    - We have provided a **Mock Preview** at the root URL of this Replit (click "Run") that simulates the Wizard UI.
    - **Real Testing**: Must be done in your HubSpot Portal.

2.  **Deployment**:
    - To deploy to HubSpot, you need the HubSpot CLI (`@hubspot/cli`).
    - You must authenticate using your HubSpot Personal Access Key.

## Setup

1.  **Secrets**: Add the following to your Replit Secrets (Tools > Secrets):
    - `HUBSPOT_ACCOUNT_ID`: Your Target Portal ID.
    - `HUBSPOT_PERSONAL_ACCESS_KEY`: Your Personal Access Key.

2.  **Scripts**:
    - `npm run dev:client`: Runs the Replit Mock Preview (default).
    - `npm run hs:init`: Initialize auth (run manually in shell: `npx hs auth`).
    - `npm run hs:upload`: Uploads files to HubSpot.
    - `npm run hs:watch`: Watches for changes and uploads automatically.

## Project Structure

- `src/app/extensions/`: Frontend UI code (React).
- `src/app/app.functions/`: Serverless backend code (Node.js).
- `src/app/extensions/config/`: Configuration files (Suppliers, Templates).
- `client/`: The Replit-specific mock preview app.

## Workflow

1.  Edit code in `src/app`.
2.  Check the **Mock Preview** in the web view to verify UI logic and flow.
3.  Run `npm run hs:upload` (or use the Shell) to push to HubSpot.
4.  Refresh your HubSpot CRM record to see the real extension.

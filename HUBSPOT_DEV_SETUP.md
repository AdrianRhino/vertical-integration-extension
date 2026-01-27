# HubSpot Extension Dev Server Setup Guide

## Fixing "Local Network Access Permission" Error

This error occurs because your browser needs permission to access localhost for the HubSpot dev server.

### For Chrome/Edge (Windows):

1. **Open Chrome/Edge Settings**
   - Go to `chrome://settings/` or `edge://settings/`
   - Or click the three dots menu → Settings

2. **Navigate to Privacy and Security**
   - Click "Privacy and security" in the left sidebar
   - Click "Site settings"

3. **Enable Local Network Access**
   - Scroll down to "Additional permissions"
   - Click "Insecure content" or search for "Local network access"
   - Enable "Allow sites to access local network resources"
   - Alternatively, add `http://localhost:*` to allowed sites

4. **Alternative: Use Chrome Flags (if above doesn't work)**
   - Go to `chrome://flags/` or `edge://flags/`
   - Search for "Insecure origins treated as secure"
   - Add `http://localhost:5000` (or your dev server port)
   - Restart browser

### For Firefox:

1. Go to `about:config`
2. Search for `network.dns.localDomains`
3. Add `localhost` if not present
4. Search for `security.tls.insecure_fallback_hosts`
5. Add `localhost` to the list

## Fixing "Unable to determine entry point" Error

### 1. Ensure Dev Server is Running

Make sure you're running the HubSpot dev server:
```bash
# From the project root
hs project dev
```

Or if using npm scripts:
```bash
npm run dev:client
```

### 2. Verify Entry Point File

The entry point file (`src/app/extensions/index.jsx`) must:
- ✅ Import `hubspot` from `@hubspot/ui-extensions`
- ✅ Call `hubspot.extend()` at the module level (top-level, not inside a function)
- ✅ Be referenced correctly in `crm-record-tab.json`

### 3. Check File Paths

Verify that `crm-record-tab.json` references the correct file:
```json
{
  "module": {
    "file": "index.jsx"  // Relative to extensions folder
  }
}
```

### 4. Port Configuration

Ensure your dev server is running on the expected port (typically 5000 for HubSpot extensions). Check your `package.json` scripts:
```json
{
  "scripts": {
    "dev:client": "vite dev --port 5000"
  }
}
```

### 5. Clear Cache and Restart

1. Stop the dev server (Ctrl+C)
2. Clear browser cache or use Incognito/Private mode
3. Restart the dev server
4. Reload the HubSpot page

## Troubleshooting Steps

1. **Check Dev Server Logs**
   - Look for any compilation errors
   - Verify the server is listening on the correct port

2. **Verify HubSpot CLI Version**
   ```bash
   hs --version
   ```
   Should be compatible with 2025.1 extensions

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for network errors or CORS issues
   - Check for JavaScript errors

4. **Verify Extension Registration**
   - In HubSpot, go to Settings → Integrations → Private Apps
   - Ensure your extension is properly registered
   - Check that the dev server URL is whitelisted

## Quick Fix Checklist

- [ ] Browser local network access enabled
- [ ] Dev server running (`hs project dev` or `npm run dev:client`)
- [ ] Dev server accessible at `http://localhost:5000` (or configured port)
- [ ] `index.jsx` has `hubspot.extend()` at module level
- [ ] `crm-record-tab.json` correctly references `index.jsx`
- [ ] Browser cache cleared or using Incognito mode
- [ ] HubSpot page reloaded after starting dev server

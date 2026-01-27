import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSupplierAdapter, getSupplierDefaults } from "./suppliers";
import * as fs from "fs";
import * as path from "path";

const SETTINGS_FILE = path.join(process.cwd(), 'supplier-settings.json');

interface SupplierSettings {
  [supplier: string]: {
    [action: string]: 'sandbox' | 'prod';
  };
}

function loadSettings(): SupplierSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return {
    ABC: { getPricing: 'sandbox', submitOrder: 'sandbox' },
    SRS: { getPricing: 'sandbox', submitOrder: 'sandbox' },
    BEACON: { getPricing: 'sandbox', submitOrder: 'sandbox' },
  };
}

function saveSettings(settings: SupplierSettings): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

function getEffectiveEnv(supplier: string, action: string): string {
  const settings = loadSettings();
  return settings[supplier]?.[action] || 'sandbox';
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/pricing", async (req, res) => {
    try {
      const { supplier, items, branchNumber, shipToNumber, customerCode, branchCode } = req.body;

      if (!supplier) {
        return res.status(400).json({ error: 'Supplier is required' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      const env = getEffectiveEnv(supplier, 'getPricing');
      const adapter = getSupplierAdapter(supplier, env, 'getPricing');
      const defaults = getSupplierDefaults(supplier);

      if (supplier === 'ABC') {
        const effectiveBranchNumber = branchNumber || defaults.branchNumber;
        const effectiveShipToNumber = shipToNumber || defaults.shipToNumber;

        if (!effectiveBranchNumber || !effectiveShipToNumber) {
          return res.status(400).json({ 
            error: 'branchNumber and shipToNumber are required for ABC Supply' 
          });
        }

        const result = await adapter.getPricing({
          items,
          branchNumber: effectiveBranchNumber,
          shipToNumber: effectiveShipToNumber,
        });

        return res.json(result);
      }

      if (supplier === 'SRS') {
        const effectiveCustomerCode = customerCode || defaults.customerCode;
        const effectiveBranchCode = branchCode || defaults.branchCode;

        if (!effectiveCustomerCode || !effectiveBranchCode) {
          return res.status(400).json({ 
            error: 'customerCode and branchCode are required for SRS Distribution' 
          });
        }

        const result = await adapter.getPricing({
          items,
          customerCode: effectiveCustomerCode,
          branchCode: effectiveBranchCode,
        });

        return res.json(result);
      }

      if (supplier === 'BEACON') {
        const { accountId, jobNumber } = req.body;
        const effectiveAccountId = accountId || defaults.accountId;
        const effectiveJobNumber = jobNumber || defaults.jobNumber;

        const result = await adapter.getPricing({
          items,
          accountId: effectiveAccountId,
          jobNumber: effectiveJobNumber,
        });

        return res.json(result);
      }

      return res.status(400).json({ error: `Supplier ${supplier} not yet supported` });
    } catch (error: any) {
      console.error('Pricing API error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch pricing' });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { search, supplier } = req.query;

      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ 
          error: 'Product catalog not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_KEY' 
        });
      }

      let query = `${supabaseUrl}/rest/v1/products?select=*`;

      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        
        if (supplier === 'ABC') {
          query += `&itemdescription=ilike.*${searchLower}*`;
        } else if (supplier === 'SRS') {
          query += `&marketingdescription=ilike.*${searchLower}*`;
        } else if (supplier === 'BEACON') {
          query += `&familyname=ilike.*${searchLower}*`;
        } else {
          query += `&or=(itemdescription.ilike.*${searchLower}*,marketingdescription.ilike.*${searchLower}*,familyname.ilike.*${searchLower}*)`;
        }
      }

      query += `&limit=50`;

      const response = await fetch(query, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.status}`);
      }

      const products = await response.json();
      res.json(products);
    } catch (error: any) {
      console.error('Products API error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch products' });
    }
  });

  app.get("/api/suppliers/defaults/:supplier", async (req, res) => {
    try {
      const { supplier } = req.params;
      const defaults = getSupplierDefaults(supplier.toUpperCase());
      res.json(defaults);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/order", async (req, res) => {
    try {
      const { supplier, items, ...orderDetails } = req.body;

      if (!supplier) {
        return res.status(400).json({ error: 'Supplier is required' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      const env = getEffectiveEnv(supplier, 'submitOrder');
      const adapter = getSupplierAdapter(supplier, env, 'submitOrder');
      const defaults = getSupplierDefaults(supplier);

      if (supplier === 'ABC') {
        const { branchNumber, shipToNumber, shipTo, poNumber, deliveryDate, notes } = orderDetails;
        const effectiveBranchNumber = branchNumber || defaults.branchNumber;
        const effectiveShipToNumber = shipToNumber || defaults.shipToNumber;

        if (!effectiveBranchNumber || !effectiveShipToNumber) {
          return res.status(400).json({ error: 'branchNumber and shipToNumber are required' });
        }

        if (!shipTo || !poNumber || !deliveryDate) {
          return res.status(400).json({ error: 'shipTo, poNumber, and deliveryDate are required' });
        }

        const result = await adapter.submitOrder({
          items,
          branchNumber: effectiveBranchNumber,
          shipToNumber: effectiveShipToNumber,
          shipTo,
          poNumber,
          deliveryDate,
          notes,
        });

        return res.json(result);
      }

      if (supplier === 'SRS') {
        const { customerCode, branchCode, shipTo, poNumber, deliveryDate, deliveryTime, contactName, contactPhone, contactEmail, notes } = orderDetails;
        const effectiveCustomerCode = customerCode || defaults.customerCode;
        const effectiveBranchCode = branchCode || defaults.branchCode;

        if (!effectiveCustomerCode || !effectiveBranchCode) {
          return res.status(400).json({ error: 'customerCode and branchCode are required' });
        }

        if (!shipTo || !poNumber || !deliveryDate || !contactName || !contactPhone || !contactEmail) {
          return res.status(400).json({ error: 'shipTo, poNumber, deliveryDate, and contact info are required' });
        }

        const result = await adapter.submitOrder({
          items,
          customerCode: effectiveCustomerCode,
          branchCode: effectiveBranchCode,
          shipTo,
          poNumber,
          deliveryDate,
          deliveryTime,
          contactName,
          contactPhone,
          contactEmail,
          notes,
        });

        return res.json(result);
      }

      if (supplier === 'BEACON') {
        const { accountId, jobNumber, poNumber, deliveryDate, deliveryInstructions } = orderDetails;
        const effectiveAccountId = accountId || defaults.accountId;
        const effectiveJobNumber = jobNumber || defaults.jobNumber;

        if (!poNumber || !deliveryDate) {
          return res.status(400).json({ error: 'poNumber and deliveryDate are required' });
        }

        const result = await adapter.submitOrder({
          items,
          accountId: effectiveAccountId,
          jobNumber: effectiveJobNumber,
          poNumber,
          deliveryDate,
          deliveryInstructions,
        });

        return res.json(result);
      }

      return res.status(400).json({ error: `Supplier ${supplier} not yet supported` });
    } catch (error: any) {
      console.error('Order API error:', error);
      res.status(500).json({ error: error.message || 'Failed to submit order' });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      const settings = loadSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const settings = req.body as SupplierSettings;
      saveSettings(settings);
      res.json({ success: true, settings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/settings/:supplier/:action", async (req, res) => {
    try {
      const { supplier, action } = req.params;
      const { env } = req.body;

      if (!['sandbox', 'prod'].includes(env)) {
        return res.status(400).json({ error: 'env must be "sandbox" or "prod"' });
      }

      const settings = loadSettings();
      if (!settings[supplier.toUpperCase()]) {
        settings[supplier.toUpperCase()] = {};
      }
      settings[supplier.toUpperCase()][action] = env;
      saveSettings(settings);

      res.json({ success: true, settings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

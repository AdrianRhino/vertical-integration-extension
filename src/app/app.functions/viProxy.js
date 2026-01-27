// viProxy.js - Single entry point for supplier interactions
const axios = require('axios');
const suppliersConfig = require('../extensions/config/suppliers.js');

// Simple settings storage (in HubSpot, use HubDB or CRM custom objects)
let settings = {
  ABC: { getPricing: 'sandbox', submitOrder: 'sandbox' },
  SRS: { getPricing: 'sandbox', submitOrder: 'sandbox' },
  BEACON: { getPricing: 'sandbox', submitOrder: 'sandbox' },
};

exports.main = async (context = {}) => {
  const { supplierKey, action, payload } = context.parameters || {};

  try {
    if (!action) {
      return {
        statusCode: 400,
        body: { ok: false, error: { message: 'Missing action', code: 'MISSING_ACTION' } }
      };
    }

    // Load supplier config if needed
    let supplier = supplierKey ? suppliersConfig.suppliers.find(s => s.key === supplierKey) : null;
    
    // Get environment from settings
    const env = supplier ? (settings[supplierKey]?.[action] || 'sandbox') : 'sandbox';
    const endpoints = supplier?.endpoints?.[env];

    // Route to handler
    let responseData;
    switch (action) {
      case 'searchProducts':
        responseData = await searchProducts(supplier, endpoints, context.secrets, payload);
        break;
      case 'getPricing':
        responseData = await getPricing(supplier, endpoints, context.secrets, payload);
        break;
      case 'submitOrder':
        responseData = await submitOrder(supplier, endpoints, context.secrets, payload);
        break;
      case 'getSettings':
        responseData = settings;
        break;
      case 'updateSetting':
        settings[payload.supplier] = settings[payload.supplier] || {};
        settings[payload.supplier][payload.actionKey] = payload.env;
        responseData = { success: true, settings };
        break;
      case 'saveDraft':
        responseData = { savedAt: new Date().toISOString() };
        break;
      case 'getDraftOrders':
      case 'getSubmittedOrders':
      case 'getAssociatedTickets':
      case 'getTeamMembers':
      case 'getOrder':
        responseData = { items: [] };
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return {
      statusCode: 200,
      body: { ok: true, data: responseData }
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: {
        ok: false,
        error: { message: error.message, code: error.code || 'ERROR' }
      }
    };
  }
};

// --- Helper: Get OAuth Token ---
async function getToken(type, secrets, authUrl) {
  if (type === 'ABC') {
    const creds = Buffer.from(`${secrets.ABC_CLIENT_ID}:${secrets.ABC_CLIENT_SECRET}`).toString('base64');
    const res = await axios.post(authUrl, 'grant_type=client_credentials', {
      headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data.access_token;
  }
  if (type === 'SRS') {
    const params = new URLSearchParams();
    params.append('client_id', secrets.SRS_CLIENT_ID);
    params.append('client_secret', secrets.SRS_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'ALL');
    const res = await axios.post(authUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return res.data.access_token;
  }
  if (type === 'BEACON') {
    const res = await axios.post(authUrl, {
      username: secrets.BEACON_USERNAME,
      password: secrets.BEACON_PASSWORD,
      siteId: 'UAT',
      userAgent: 'HubSpot-Extension',
      apiSiteId: secrets.BEACON_API_SITE_ID || 'UAT'
    });
    return res.headers['set-cookie']?.join('; ') || '';
  }
  throw new Error('Unknown supplier type');
}

// --- Search Products (uses Supabase or mock) ---
async function searchProducts(supplier, endpoints, secrets, payload) {
  if (secrets.SUPABASE_URL && secrets.SUPABASE_KEY) {
    try {
      const url = `${secrets.SUPABASE_URL}/rest/v1/products?select=*&or=(name.ilike.*${payload.query || ''}*)&limit=20`;
      const res = await axios.get(url, {
        headers: { 'apikey': secrets.SUPABASE_KEY, 'Authorization': `Bearer ${secrets.SUPABASE_KEY}` }
      });
      return { results: res.data };
    } catch (e) { console.log('Supabase failed, using mock'); }
  }
  // Mock fallback
  return {
    results: [
      { id: '101', sku: `${supplier.key}-SH-BLK`, name: 'Shingles - Black', price: 35.00 },
      { id: '102', sku: `${supplier.key}-SH-BRN`, name: 'Shingles - Brown', price: 35.00 }
    ]
  };
}

// --- Get Pricing ---
async function getPricing(supplier, endpoints, secrets, payload) {
  const key = supplier.key;
  
  try {
    const token = await getToken(key, secrets, endpoints.auth || endpoints.login);
    
    if (key === 'ABC') {
      const res = await axios.post(endpoints.pricing, {
        requestId: `REQ-${Date.now()}`,
        shipToNumber: payload.shipToNumber,
        branchNumber: payload.branchNumber,
        purpose: 'ordering',
        lines: payload.items.map((item, i) => ({ id: `line-${i}`, itemNumber: item.sku, quantity: item.quantity, uom: item.uom || 'EA' }))
      }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      return { items: payload.items.map((item, i) => ({ ...item, price: res.data.lines?.[i]?.unitPrice || 0 })) };
    }
    
    if (key === 'SRS') {
      const res = await axios.post(endpoints.pricing, {
        sourceSystem: 'HUBSPOT_EXT',
        customerCode: payload.customerCode,
        branchCode: payload.branchCode,
        transactionId: `TXN-${Date.now()}`,
        jobAccountNumber: 1,
        productList: payload.items.map(item => ({ productName: item.title, productOptions: [item.variant || 'N/A'], quantity: item.quantity, uom: item.uom || 'EA' }))
      }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      return { items: res.data.map((p, i) => ({ ...payload.items[i], price: p.price || 0 })) };
    }
    
    if (key === 'BEACON') {
      const skuIds = payload.items.map(item => item.uom ? `${item.sku}:${item.uom}` : item.sku).join(',');
      const res = await axios.get(`${endpoints.pricing}?skuIds=${skuIds}`, { headers: { 'Cookie': token } });
      return { items: payload.items.map(item => ({ ...item, price: res.data.priceInfo?.[item.sku]?.[item.uom] || 0 })) };
    }
  } catch (e) {
    console.log('Live pricing failed:', e.message);
  }
  
  // Mock fallback
  const items = payload.items.map(item => ({ ...item, price: item.price || 25.00 }));
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { items, totals: { subtotal, tax: subtotal * 0.08, grandTotal: subtotal * 1.08 } };
}

// --- Submit Order ---
async function submitOrder(supplier, endpoints, secrets, payload) {
  const key = supplier.key;
  
  try {
    const token = await getToken(key, secrets, endpoints.auth || endpoints.login);
    
    if (key === 'ABC') {
      const res = await axios.post(endpoints.order, {
        requestId: `ORD-${Date.now()}`,
        shipToNumber: payload.shipToNumber,
        branchNumber: payload.branchNumber,
        poNumber: payload.poNumber,
        requestedDeliveryDate: payload.deliveryDate,
        specialInstructions: payload.notes || '',
        shipTo: { name: payload.shipTo.name, addressLine1: payload.shipTo.address1, city: payload.shipTo.city, state: payload.shipTo.state, postalCode: payload.shipTo.zip },
        lines: payload.items.map((item, i) => ({ id: `line-${i}`, itemNumber: item.sku, quantity: item.quantity, uom: item.uom || 'EA' }))
      }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      return { orderId: res.data.orderId, status: 'submitted', message: 'Order submitted to ABC' };
    }
    
    if (key === 'SRS') {
      const res = await axios.post(endpoints.order, {
        sourceSystem: 'HUBSPOT_EXT',
        customerCode: payload.customerCode,
        branchCode: payload.branchCode,
        accountNumber: payload.customerCode,
        transactionID: `ORD-${Date.now()}`,
        transactionDate: new Date().toISOString(),
        notes: payload.notes || '',
        shipTo: { name: payload.shipTo.name, addressLine1: payload.shipTo.address1, city: payload.shipTo.city, state: payload.shipTo.state, zipCode: payload.shipTo.zip },
        poDetails: { poNumber: payload.poNumber, orderDate: new Date().toISOString().split('T')[0], expectedDeliveryDate: payload.deliveryDate, expectedDeliveryTime: 'Anytime', orderType: 'WHSE', shippingMethod: 'Ground Drop' },
        orderLineItemDetails: payload.items.map(item => ({ productName: item.title, option: item.variant || 'N/A', quantity: item.quantity, price: item.price || 0, customerItem: item.sku, uom: item.uom || 'EA' })),
        customerContactInfo: { customerContactName: payload.contactName, customerContactPhone: payload.contactPhone, customerContactEmail: payload.contactEmail }
      }, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      return { orderId: res.data.orderID, status: 'submitted', message: 'Order submitted to SRS' };
    }
    
    if (key === 'BEACON') {
      const res = await axios.post(endpoints.order, {
        poNumber: payload.poNumber,
        requestedDeliveryDate: payload.deliveryDate,
        deliveryInstructions: payload.deliveryInstructions || '',
        items: payload.items.map(item => ({ skuId: item.sku, quantity: item.quantity, uom: item.uom || 'EA' }))
      }, { headers: { 'Cookie': token, 'Content-Type': 'application/json' } });
      return { orderId: res.data.orderId || `QXO-${Date.now()}`, status: 'submitted', message: 'Order submitted to QXO' };
    }
  } catch (e) {
    console.log('Live order failed:', e.message);
    throw new Error(`Order submission failed: ${e.message}`);
  }
  
  // Mock fallback (only for testing)
  return { orderId: `MOCK-${Date.now()}`, status: 'MOCK', message: 'Mock order (credentials not configured)' };
}

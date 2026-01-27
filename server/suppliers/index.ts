import { ABCAdapter } from './abc-adapter';
import { SRSAdapter } from './srs-adapter';
import { BeaconAdapter } from './beacon-adapter';
import suppliersConfig from '../../client/src/extensions-mirror/config/suppliers.json';

export function getSupplierAdapter(supplierKey: string, env: string = 'sandbox', action?: string) {
  const supplier = suppliersConfig.suppliers.find((s: any) => s.key === supplierKey);
  
  if (!supplier) {
    throw new Error(`Supplier ${supplierKey} not found in config`);
  }

  // env parameter from settings takes precedence over actionEnv in config
  // actionEnv is only used as fallback if no explicit env was provided
  const effectiveEnv = env;

  const endpointsByEnv = supplier.endpoints as unknown as Record<string, Record<string, string>> | undefined;
  const endpoints = endpointsByEnv?.[effectiveEnv];
  if (!endpoints) {
    throw new Error(`Endpoints not configured for ${supplierKey} in ${effectiveEnv} mode`);
  }

  if (supplierKey === 'ABC') {
    const clientId = process.env.ABC_CLIENT_ID;
    const clientSecret = process.env.ABC_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('ABC credentials not configured. Please set ABC_CLIENT_ID and ABC_CLIENT_SECRET');
    }

    return new ABCAdapter({
      clientId,
      clientSecret,
      authUrl: endpoints.auth,
      pricingUrl: endpoints.pricing,
      orderUrl: endpoints.order,
    });
  }

  if (supplierKey === 'SRS') {
    const clientId = process.env.SRS_CLIENT_ID;
    const clientSecret = process.env.SRS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('SRS credentials not configured. Please set SRS_CLIENT_ID and SRS_CLIENT_SECRET');
    }

    return new SRSAdapter({
      clientId,
      clientSecret,
      authUrl: endpoints.auth,
      pricingUrl: endpoints.pricing,
      orderUrl: endpoints.order,
    });
  }

  if (supplierKey === 'BEACON') {
    const username = process.env.BEACON_USERNAME;
    const password = process.env.BEACON_PASSWORD;
    const apiSiteId = process.env.BEACON_API_SITE_ID || '';

    if (!username || !password) {
      throw new Error('Beacon credentials not configured. Please set BEACON_USERNAME and BEACON_PASSWORD');
    }

    return new BeaconAdapter({
      username,
      password,
      loginUrl: endpoints.login,
      pricingUrl: endpoints.pricing,
      orderUrl: endpoints.order,
      apiSiteId,
    });
  }

  throw new Error(`Adapter not implemented for supplier: ${supplierKey}`);
}

export function getSupplierDefaults(supplierKey: string): Record<string, string | undefined> {
  const supplier = suppliersConfig.suppliers.find((s: any) => s.key === supplierKey);
  return supplier?.defaults || {};
}

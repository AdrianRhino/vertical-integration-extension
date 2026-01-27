import { getBeaconSession } from './token-service';

interface BeaconPriceInfo {
  [skuId: string]: {
    [uom: string]: number;
  };
}

interface BeaconPricingResponse {
  message?: string;
  messageCode?: string;
  priceInfo?: BeaconPriceInfo;
}

interface InternalCartLine {
  id?: string;
  sku: string;
  title: string;
  quantity: number;
  uom: string;
  price?: number;
  variant?: string;
}

export class BeaconAdapter {
  private username: string;
  private password: string;
  private loginUrl: string;
  private pricingUrl: string;
  private orderUrl: string;
  private apiSiteId: string;

  constructor(config: {
    username: string;
    password: string;
    loginUrl: string;
    pricingUrl: string;
    orderUrl: string;
    apiSiteId?: string;
  }) {
    this.username = config.username;
    this.password = config.password;
    this.loginUrl = config.loginUrl;
    this.pricingUrl = config.pricingUrl;
    this.orderUrl = config.orderUrl;
    this.apiSiteId = config.apiSiteId || '';
  }

  async getPricing(payload: {
    items: InternalCartLine[];
    accountId?: string;
    jobNumber?: string;
  }): Promise<{ items: InternalCartLine[]; totals: any }> {
    const sessionCookie = await getBeaconSession(
      this.username,
      this.password,
      this.loginUrl,
      this.apiSiteId
    );

    const skuIds = payload.items
      .map((item) => {
        if (item.uom) {
          return `${item.sku}:${item.uom}`;
        }
        return item.sku;
      })
      .join(',');

    const params = new URLSearchParams({ skuIds });
    if (payload.accountId) {
      params.append('accountId', payload.accountId);
    }
    if (payload.jobNumber) {
      params.append('jobNumber', payload.jobNumber);
    }
    if (this.apiSiteId) {
      params.append('apiSiteId', this.apiSiteId);
    }

    try {
      const response = await fetch(`${this.pricingUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cookie': sessionCookie,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Beacon Pricing API failed: ${response.status} ${errorText}`);
      }

      const beaconResponse: BeaconPricingResponse = await response.json();

      if (beaconResponse.messageCode) {
        throw new Error(`Beacon API error: ${beaconResponse.messageCode} - ${beaconResponse.message}`);
      }

      const priceInfo = beaconResponse.priceInfo || {};

      const pricedItems = payload.items.map((item) => {
        const skuPrices = priceInfo[item.sku];

        if (!skuPrices) {
          return {
            ...item,
            price: 0,
            pricingError: 'No pricing data returned',
            pricingFetched: false,
          };
        }

        const uom = item.uom || Object.keys(skuPrices)[0];
        const price = skuPrices[uom] ?? skuPrices['EMPTY_UOM'];

        if (price === undefined || price === null) {
          return {
            ...item,
            price: 0,
            pricingError: 'Price unavailable for UOM',
            pricingFetched: false,
            availableUoms: Object.keys(skuPrices),
          };
        }

        return {
          ...item,
          price,
          pricingFetched: true,
          availableUoms: Object.keys(skuPrices),
        };
      });

      const subtotal = pricedItems.reduce(
        (sum, item) => sum + ((item.price || 0) * item.quantity),
        0
      );
      const tax = subtotal * 0.08;
      const grandTotal = subtotal + tax;

      return {
        items: pricedItems,
        totals: {
          subtotal,
          tax,
          grandTotal,
          currency: 'USD',
        },
      };
    } catch (error: any) {
      throw new Error(`Beacon Pricing request failed: ${error.message}`);
    }
  }

  async submitOrder(payload: {
    items: InternalCartLine[];
    accountId?: string;
    jobNumber?: string;
    poNumber: string;
    deliveryDate: string;
    deliveryInstructions?: string;
  }): Promise<{ orderId: string; status: string; message: string }> {
    const sessionCookie = await getBeaconSession(
      this.username,
      this.password,
      this.loginUrl,
      this.apiSiteId
    );

    const orderRequest = {
      poNumber: payload.poNumber,
      requestedDeliveryDate: payload.deliveryDate,
      deliveryInstructions: payload.deliveryInstructions || '',
      jobNumber: payload.jobNumber || '',
      items: payload.items.map((item) => ({
        skuId: item.sku,
        quantity: item.quantity,
        uom: item.uom || 'EA',
      })),
    };

    const params = new URLSearchParams();
    if (payload.accountId) {
      params.append('accountId', payload.accountId);
    }
    if (this.apiSiteId) {
      params.append('apiSiteId', this.apiSiteId);
    }

    try {
      const url = params.toString() ? `${this.orderUrl}?${params.toString()}` : this.orderUrl;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': sessionCookie,
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Beacon Order API failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();

      if (result.messageCode) {
        throw new Error(`Beacon Order error: ${result.messageCode} - ${result.messageInfo || result.message}`);
      }

      return {
        orderId: result.orderId || result.orderNumber || `QXO-${Date.now()}`,
        status: 'submitted',
        message: result.message || 'Order submitted successfully',
      };
    } catch (error: any) {
      throw new Error(`Beacon Order submission failed: ${error.message}`);
    }
  }
}

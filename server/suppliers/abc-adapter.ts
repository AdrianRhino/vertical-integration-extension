import { getABCToken } from './token-service';

interface ABCPricingLine {
  id: string;
  itemNumber: string;
  quantity: number;
  uom: string;
  length?: number;
}

interface ABCPricingRequest {
  requestId: string;
  shipToNumber: string;
  branchNumber: string;
  purpose: string;
  lines: ABCPricingLine[];
}

interface ABCPricingResponseLine {
  id: string;
  itemNumber: string;
  unitPrice?: number;
  status?: string;
  message?: string;
}

interface ABCPricingResponse {
  requestId: string;
  lines: ABCPricingResponseLine[];
}

interface InternalCartLine {
  id?: string;
  sku: string;
  title: string;
  quantity: number;
  uom: string;
  price?: number;
  variant?: string;
  length?: number;
}

export class ABCAdapter {
  private clientId: string;
  private clientSecret: string;
  private authUrl: string;
  private pricingUrl: string;
  private orderUrl: string;

  constructor(config: {
    clientId: string;
    clientSecret: string;
    authUrl: string;
    pricingUrl: string;
    orderUrl: string;
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.authUrl = config.authUrl;
    this.pricingUrl = config.pricingUrl;
    this.orderUrl = config.orderUrl;
  }

  async getPricing(payload: {
    items: InternalCartLine[];
    branchNumber: string;
    shipToNumber: string;
  }): Promise<{ items: InternalCartLine[]; totals: any }> {
    const token = await getABCToken(this.clientId, this.clientSecret, this.authUrl);

    const abcRequest: ABCPricingRequest = {
      requestId: `REQ-${Date.now()}`,
      shipToNumber: payload.shipToNumber,
      branchNumber: payload.branchNumber,
      purpose: 'ordering',
      lines: payload.items.map((item, index) => ({
        id: item.id || `line-${index}`,
        itemNumber: item.sku,
        quantity: item.quantity,
        uom: item.uom || 'EA',
        ...(item.length ? { length: item.length } : {}),
      })),
    };

    try {
      const response = await fetch(this.pricingUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(abcRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ABC Pricing API failed: ${response.status} ${errorText}`);
      }

      const abcResponse: ABCPricingResponse = await response.json();

      const pricedItems = payload.items.map((item, index) => {
        const lineId = item.id || `line-${index}`;
        const abcLine = abcResponse.lines.find(
          (l) => l.id === lineId || l.itemNumber === item.sku
        );

        if (!abcLine) {
          return {
            ...item,
            price: 0,
            pricingError: 'No pricing data returned',
            pricingFetched: false,
          };
        }

        if (!abcLine.unitPrice || abcLine.unitPrice === 0) {
          return {
            ...item,
            price: 0,
            pricingError: abcLine.message || 'Price unavailable',
            pricingFetched: false,
          };
        }

        return {
          ...item,
          price: abcLine.unitPrice,
          pricingFetched: true,
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
      throw new Error(`ABC Pricing request failed: ${error.message}`);
    }
  }

  async submitOrder(payload: {
    items: InternalCartLine[];
    branchNumber: string;
    shipToNumber: string;
    shipTo: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      zip: string;
    };
    poNumber: string;
    deliveryDate: string;
    notes?: string;
  }): Promise<{ orderId: string; status: string; message: string }> {
    const token = await getABCToken(this.clientId, this.clientSecret, this.authUrl);

    const orderRequest = {
      requestId: `ORD-${Date.now()}`,
      shipToNumber: payload.shipToNumber,
      branchNumber: payload.branchNumber,
      poNumber: payload.poNumber,
      requestedDeliveryDate: payload.deliveryDate,
      specialInstructions: payload.notes || '',
      shipTo: {
        name: payload.shipTo.name,
        addressLine1: payload.shipTo.address1,
        addressLine2: payload.shipTo.address2 || '',
        city: payload.shipTo.city,
        state: payload.shipTo.state,
        postalCode: payload.shipTo.zip,
      },
      lines: payload.items.map((item, index) => ({
        id: item.id || `line-${index}`,
        itemNumber: item.sku,
        quantity: item.quantity,
        uom: item.uom || 'EA',
        ...(item.length ? { length: item.length } : {}),
      })),
    };

    try {
      const response = await fetch(this.orderUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ABC Order API failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return {
        orderId: result.orderId || result.requestId,
        status: result.status || 'submitted',
        message: result.message || 'Order submitted successfully',
      };
    } catch (error: any) {
      throw new Error(`ABC Order submission failed: ${error.message}`);
    }
  }
}

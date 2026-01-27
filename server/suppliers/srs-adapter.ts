import { getSRSToken } from './token-service';

interface SRSProductListItem {
  productId?: number;
  productName: string;
  productOptions: string[];
  quantity: number;
  uom: string;
}

interface SRSPricingRequest {
  sourceSystem: string;
  customerCode: string;
  branchCode: string;
  transactionId: string;
  jobAccountNumber: number;
  productList: SRSProductListItem[];
}

interface SRSPricingResponseItem {
  itemCode?: string;
  productId?: number;
  productName: string;
  productOptions?: string[];
  priceUOM?: string;
  requestedUOM?: string;
  uomConversionFactor?: number;
  price?: number;
  availableStatus?: string;
  transactionId?: string;
  message?: string;
  messageCode?: number;
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

export class SRSAdapter {
  private clientId: string;
  private clientSecret: string;
  private authUrl: string;
  private pricingUrl: string;
  private orderUrl: string;
  private sourceSystem: string;

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
    this.sourceSystem = 'HUBSPOT_EXT';
  }

  async getPricing(payload: {
    items: InternalCartLine[];
    customerCode: string;
    branchCode: string;
  }): Promise<{ items: InternalCartLine[]; totals: any }> {
    const token = await getSRSToken(this.clientId, this.clientSecret, this.authUrl);

    const srsRequest: SRSPricingRequest = {
      sourceSystem: this.sourceSystem,
      customerCode: payload.customerCode,
      branchCode: payload.branchCode,
      transactionId: `TXN-${Date.now()}`,
      jobAccountNumber: 1,
      productList: payload.items.map((item) => ({
        productName: item.title,
        productOptions: item.variant ? [item.variant] : ['N/A'],
        quantity: item.quantity,
        uom: item.uom || 'EA',
      })),
    };

    try {
      const response = await fetch(this.pricingUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(srsRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SRS Pricing API failed: ${response.status} ${errorText}`);
      }

      const srsResponse: SRSPricingResponseItem[] = await response.json();

      const pricedItems = payload.items.map((item, index) => {
        const srsProduct = srsResponse.find(
          (p) => p.productName === item.title
        ) || srsResponse[index];

        if (!srsProduct) {
          return {
            ...item,
            price: 0,
            pricingError: 'No pricing data returned',
            pricingFetched: false,
          };
        }

        if (srsProduct.price === undefined || srsProduct.price === null) {
          return {
            ...item,
            price: 0,
            pricingError: srsProduct.message || 'Price unavailable',
            pricingFetched: false,
          };
        }

        return {
          ...item,
          price: srsProduct.price,
          itemCode: srsProduct.itemCode,
          availableStatus: srsProduct.availableStatus,
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
      throw new Error(`SRS Pricing request failed: ${error.message}`);
    }
  }

  async submitOrder(payload: {
    items: InternalCartLine[];
    customerCode: string;
    branchCode: string;
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
    deliveryTime?: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    notes?: string;
  }): Promise<{ orderId: string; status: string; message: string }> {
    const token = await getSRSToken(this.clientId, this.clientSecret, this.authUrl);

    const orderRequest = {
      sourceSystem: this.sourceSystem,
      customerCode: payload.customerCode,
      jobAccountNumber: 1,
      branchCode: payload.branchCode,
      accountNumber: payload.customerCode,
      transactionID: `ORD-${Date.now()}`,
      transactionDate: new Date().toISOString(),
      notes: payload.notes || '',
      shipTo: {
        name: payload.shipTo.name,
        addressLine1: payload.shipTo.address1,
        addressLine2: payload.shipTo.address2 || '',
        addressLine3: '',
        city: payload.shipTo.city,
        state: payload.shipTo.state,
        zipCode: payload.shipTo.zip,
      },
      poDetails: {
        poNumber: payload.poNumber,
        reference: '',
        jobNumber: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: payload.deliveryDate,
        expectedDeliveryTime: payload.deliveryTime || 'Anytime',
        orderType: 'WHSE',
        shippingMethod: 'Ground Drop',
      },
      orderLineItemDetails: payload.items.map((item) => ({
        productId: 0,
        productName: item.title,
        option: item.variant || 'N/A',
        quantity: item.quantity,
        price: item.price || 0,
        customerItem: item.sku,
        uom: item.uom || 'EA',
      })),
      customerContactInfo: {
        customerContactName: payload.contactName,
        customerContactPhone: payload.contactPhone,
        customerContactEmail: payload.contactEmail,
        customerContactAddress: {
          addressLine1: payload.shipTo.address1,
          city: payload.shipTo.city,
          state: payload.shipTo.state,
          zipCode: payload.shipTo.zip,
        },
        additionalContactEmails: [],
      },
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
        throw new Error(`SRS Order API failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return {
        orderId: result.orderID || result.transactionID,
        status: 'submitted',
        message: result.message || 'Order submitted successfully',
      };
    } catch (error: any) {
      throw new Error(`SRS Order submission failed: ${error.message}`);
    }
  }
}

export default {
  suppliers: [
    {
      key: "ABC",
      name: "ABC Supply",
      enabled: true,
      supportedActions: ["search", "price", "order"],
      endpoints: {
        sandbox: {
          auth: "https://api-sandbox.abcsupply.com/oauth/token",
          pricing: "https://api-sandbox.abcsupply.com/pricing/v1/prices",
          order: "https://api-sandbox.abcsupply.com/orders/v1/orders"
        },
        prod: {
          auth: "https://api.abcsupply.com/oauth/token",
          pricing: "https://api.abcsupply.com/pricing/v1/prices",
          order: "https://api.abcsupply.com/orders/v1/orders"
        }
      },
      actionEnv: {
        getPricing: "prod",
        submitOrder: "sandbox"
      },
      auth: {
        type: "oauth",
        grantType: "client_credentials",
        tokenCacheDuration: 3600
      },
      defaults: {
        branchNumber: "461",
        shipToNumber: "2063975-2"
      }
    },
    {
      key: "SRS",
      name: "SRS Distribution",
      enabled: true,
      supportedActions: ["search", "price", "order"],
      endpoints: {
        sandbox: {
          auth: "https://services-qa.roofhub.pro/Authentication/token",
          pricing: "https://services-qa.roofhub.pro/products/v2/price",
          branches: "https://services-qa.roofhub.pro/branches/v2/branchLocations",
          order: "https://services-qa.roofhub.pro/orders/v2/submit"
        },
        prod: {
          auth: "https://services.roofhub.pro/Authentication/token",
          pricing: "https://services.roofhub.pro/products/v2/price",
          branches: "https://services.roofhub.pro/branches/v2/branchLocations",
          order: "https://services.roofhub.pro/orders/v2/submit"
        }
      },
      actionEnv: {
        getPricing: "prod",
        submitOrder: "sandbox"
      },
      auth: {
        type: "oauth",
        grantType: "client_credentials",
        scope: "ALL",
        tokenCacheDuration: 86400
      },
      defaults: {
        customerCode: "",
        branchCode: ""
      }
    },
    {
      key: "BEACON",
      name: "QXO (formerly Beacon)",
      enabled: true,
      supportedActions: ["search", "price", "order"],
      endpoints: {
        sandbox: {
          login: "https://uat.qxo.digital/v1/rest/com/becn/login",
          pricing: "https://uat.qxo.digital/v1/rest/com/becn/pricing",
          items: "https://uat.qxo.digital/v1/rest/com/becn/items",
          order: "https://uat.qxo.digital/v1/rest/com/becn/submitOrder"
        },
        prod: {
          login: "https://qxo.digital/v1/rest/com/becn/login",
          pricing: "https://qxo.digital/v1/rest/com/becn/pricing",
          items: "https://qxo.digital/v1/rest/com/becn/items",
          order: "https://qxo.digital/v1/rest/com/becn/submitOrder"
        }
      },
      actionEnv: {
        getPricing: "sandbox",
        submitOrder: "sandbox"
      },
      auth: {
        type: "session",
        sessionDuration: 3600
      },
      defaults: {
        accountId: "",
        jobNumber: ""
      }
    }
  ]
};

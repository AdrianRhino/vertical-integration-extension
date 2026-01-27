import React, { useEffect, useState } from "react";
import { Input, Box, Heading, Text, Panel, PanelBody, Select, Flex, Button } from "../hubspot-mock/ui-extensions-react";
import templates from "./config/templates.json";
import suppliersConfig from "./config/suppliers.json";

const PickupSetup = ({ order, setOrder, setCanGoNext, runServerlessFunction }) => {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoadingTickets(true);
      try {
        const res = await runServerlessFunction({ name: 'viProxy', parameters: { action: 'getAssociatedTickets' } });
        if (res.response.ok) {
          setTickets(res.response.data.items);
        }
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, []);

  const handleTemplateSelect = (templateId) => {
    const template = templates.templates.find(t => t.id === templateId);
    if (template && order.supplier) {
      // Create new items from template
      const newItems = template.items.map(item => ({
        sku: item.skuMap[order.supplier] || 'UNKNOWN',
        title: item.title,
        variant: item.variant,
        uom: item.uom,
        quantity: item.quantity,
        skuKey: item.skuKey, // Stable key for merging
        price: 0
      }));

      // Replace or Merge? 
      // "Template selection should populate the cart" -> implies reset or append.
      // Usually selecting a template implies "Start with this". We will replace for simplicity here, 
      // but user can add more items later.
      
      setOrder(prev => ({ 
        ...prev, 
        templateId: templateId,
        items: newItems
      }));
    }
  };

  useEffect(() => {
    // Re-map items if supplier changes and we have a template
    if (order.templateId && order.supplier) {
       handleTemplateSelect(order.templateId);
    }
    
    // Auto-populate ABC defaults
    if (order.supplier === 'ABC' && !order.branchNumber && !order.shipToNumber) {
      setOrder(prev => ({
        ...prev,
        branchNumber: '461',
        shipToNumber: '2063975-2'
      }));
    }
  }, [order.supplier]);

  useEffect(() => {
    let hasSupplierFields = true;
    if (order.supplier === 'ABC') {
      hasSupplierFields = !!(order.branchNumber && order.shipToNumber);
    } else if (order.supplier === 'SRS') {
      hasSupplierFields = !!(order.customerCode && order.branchCode);
    }
    setCanGoNext(!!order.ticketId && !!order.supplier && !!order.templateId && hasSupplierFields);
  }, [order.ticketId, order.supplier, order.templateId, order.branchNumber, order.shipToNumber, order.customerCode, order.branchCode, setCanGoNext]);

  return (
    <Box direction="column" gap="medium">
      <Heading>Setup Order</Heading>
      
      <Panel title="1. Select Ticket">
        <PanelBody>
           <Select
             label="Associated Ticket"
             placeholder={loadingTickets ? "Loading..." : "Select a ticket..."}
             options={tickets.map(t => ({ label: `${t.subject} (${t.created})`, value: t.id }))}
             value={order.ticketId}
             onChange={(val) => setOrder(prev => ({ ...prev, ticketId: val }))}
           />
        </PanelBody>
      </Panel>

      <Panel title="2. Select Supplier">
        <PanelBody>
           <Flex gap="medium">
             {suppliersConfig.suppliers.filter(s => s.enabled).map(s => (
               <Button 
                 key={s.key}
                 variant={order.supplier === s.key ? "primary" : "secondary"}
                 onClick={() => setOrder(prev => ({ ...prev, supplier: s.key }))}
               >
                 {s.name}
               </Button>
             ))}
           </Flex>
        </PanelBody>
      </Panel>

      {order.supplier === 'ABC' && (
        <Panel title="3. ABC Supply Details">
          <PanelBody>
            <Box direction="column" gap="small">
              <Input
                label="Branch Number"
                placeholder="e.g. 461"
                value={order.branchNumber}
                onChange={(val) => setOrder(prev => ({ ...prev, branchNumber: val }))}
                required={true}
              />
              <Input
                label="Ship To Number"
                placeholder="e.g. 2063975-2"
                value={order.shipToNumber}
                onChange={(val) => setOrder(prev => ({ ...prev, shipToNumber: val }))}
                required={true}
              />
              <Text variant="micro">These are required for ABC Supply pricing and orders.</Text>
            </Box>
          </PanelBody>
        </Panel>
      )}

      {order.supplier === 'SRS' && (
        <Panel title="3. SRS Distribution Details">
          <PanelBody>
            <Box direction="column" gap="small">
              <Input
                label="Customer Code"
                placeholder="Your SRS customer code"
                value={order.customerCode || ''}
                onChange={(val) => setOrder(prev => ({ ...prev, customerCode: val }))}
                required={true}
              />
              <Input
                label="Branch Code"
                placeholder="SRS branch code"
                value={order.branchCode || ''}
                onChange={(val) => setOrder(prev => ({ ...prev, branchCode: val }))}
                required={true}
              />
              <Text variant="micro">These are required for SRS pricing and orders.</Text>
            </Box>
          </PanelBody>
        </Panel>
      )}

      <Panel title={(order.supplier === 'ABC' || order.supplier === 'SRS') ? "4. Select Template" : "3. Select Template"}>
         <PanelBody>
            <Select
              label="Order Template"
              placeholder="Choose a template to populate cart..."
              options={templates.templates.map(t => ({ label: t.name, value: t.id }))}
              value={order.templateId}
              onChange={handleTemplateSelect}
              disabled={!order.supplier}
            />
            {!order.supplier && <Text variant="micro">Please select a supplier first.</Text>}
         </PanelBody>
      </Panel>
    </Box>
  );
};

export default PickupSetup;

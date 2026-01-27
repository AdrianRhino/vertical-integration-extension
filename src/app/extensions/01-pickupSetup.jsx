import React, { useEffect, useState } from "react";
import { Input, Box, Heading, Text, Panel, PanelBody, Select, Flex, Button } from "@hubspot/ui-extensions";
import templates from "./config/templates.js";
import suppliersConfig from "./config/suppliers.js";

const PickupSetup = ({ order, setOrder, setCanGoNext, runServerlessFunction }) => {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Safety check: ensure order exists
  if (!order || !setOrder) {
    return (
      <Box>
        <Text>Error: Missing required props</Text>
      </Box>
    );
  }

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
    if (!templates?.templates || !order?.supplier) return;
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
    if (order?.templateId && order?.supplier) {
       handleTemplateSelect(order.templateId);
    }
  }, [order?.supplier]);

  useEffect(() => {
    setCanGoNext(!!order?.ticketId && !!order?.supplier && !!order?.templateId);
  }, [order?.ticketId, order?.supplier, order?.templateId, setCanGoNext]);

  return (
    <Box direction="column" gap="medium">
      <Heading>Setup Order</Heading>
      
      <Panel title="1. Select Ticket">
        <PanelBody>
           <Select
             label="Associated Ticket"
             placeholder={loadingTickets ? "Loading..." : "Select a ticket..."}
             options={tickets.map(t => ({ label: `${t.subject || 'Ticket'} (${t.created || 'N/A'})`, value: t.id }))}
             value={order?.ticketId || null}
             onChange={(val) => setOrder(prev => ({ ...prev, ticketId: val }))}
           />
        </PanelBody>
      </Panel>

      <Panel title="2. Select Supplier">
        <PanelBody>
           <Flex gap="medium">
             {(suppliersConfig?.suppliers || []).filter(s => s.enabled).map(s => (
               <Button 
                 key={s.key}
                 variant={order?.supplier === s.key ? "primary" : "secondary"}
                 onClick={() => setOrder(prev => ({ ...prev, supplier: s.key }))}
               >
                 {s.name}
               </Button>
             ))}
           </Flex>
        </PanelBody>
      </Panel>

      <Panel title="3. Select Template">
         <PanelBody>
            <Select
              label="Order Template"
              placeholder="Choose a template to populate cart..."
              options={(templates?.templates || []).map(t => ({ label: t.name, value: t.id }))}
              value={order?.templateId || null}
              onChange={handleTemplateSelect}
              disabled={!order?.supplier} // Must pick supplier first to know SKUs
            />
            {!order?.supplier && <Text variant="micro">Please select a supplier first.</Text>}
         </PanelBody>
      </Panel>
    </Box>
  );
};

export default PickupSetup;

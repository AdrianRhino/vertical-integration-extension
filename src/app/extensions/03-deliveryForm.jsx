import React, { useEffect, useState } from "react";
import { Input, Box, Heading, Select, Panel, PanelBody, TextArea, DateInput, Flex } from "@hubspot/ui-extensions";

const DeliveryForm = ({ order, setOrder, setCanGoNext }) => {
  
  const updateDelivery = (field, value) => {
    setOrder(prev => ({
      ...prev,
      delivery: { ...prev.delivery, [field]: value }
    }));
  };

  useEffect(() => {
    // Required fields: Date, Service Type, Time Code, Primary Contact
    const d = order.delivery || {};
    const valid = d.date && d.serviceType && d.timeCode && d.primaryContact;
    setCanGoNext(!!valid);
  }, [order.delivery, setCanGoNext]);

  return (
    <Box direction="column" gap="medium">
      <Heading>Delivery Details</Heading>
      
      <Panel title="Schedule & Service">
         <PanelBody>
             <Flex gap="medium" wrap={true}>
                 <Box width="45%">
                    <DateInput
                       label="Delivery Date"
                       name="date"
                       required={true}
                       value={order.delivery?.date}
                       onChange={v => updateDelivery('date', v)}
                    />
                 </Box>
                 <Box width="45%">
                     <Select
                        label="Service Type"
                        required={true}
                        options={[
                            { label: "Rooftop Delivery", value: "rooftop" },
                            { label: "Ground Drop Delivery", value: "ground" }
                        ]}
                        value={order.delivery?.serviceType}
                        onChange={v => updateDelivery('serviceType', v)}
                     />
                 </Box>
                 <Box width="45%">
                     <Select
                        label="Time Code"
                        required={true}
                        options={[
                            { label: "Any Time", value: "any" },
                            { label: "AM", value: "am" },
                            { label: "PM", value: "pm" },
                            { label: "TBD", value: "tbd" }
                        ]}
                        value={order.delivery?.timeCode}
                        onChange={v => updateDelivery('timeCode', v)}
                     />
                 </Box>
                 <Box width="45%">
                     <Select
                        label="Primary Contact"
                        required={true}
                        options={[
                            { label: "Person 1 (Site)", value: "p1" },
                            { label: "Person 2 (Office)", value: "p2" }
                        ]}
                        value={order.delivery?.primaryContact}
                        onChange={v => updateDelivery('primaryContact', v)}
                     />
                 </Box>
             </Flex>
         </PanelBody>
      </Panel>

      <Panel title="Instructions">
          <PanelBody>
              <TextArea
                  label="Delivery Instructions (Optional)"
                  rows={4}
                  value={order.delivery?.instructions}
                  onChange={v => updateDelivery('instructions', v)}
                  placeholder="Gate code, parking instructions, etc."
              />
          </PanelBody>
      </Panel>
    </Box>
  );
};

export default DeliveryForm;

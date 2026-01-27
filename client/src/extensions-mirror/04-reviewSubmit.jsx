import React from "react";
import { Box, Heading, Text, Table, TableRow, TableCell, TableBody, Panel, PanelSection, StatusTag, Divider, Flex, TableHead, TableHeader } from "../hubspot-mock/ui-extensions-react";

const ReviewSubmit = ({ order }) => {
  
  const SummaryField = ({ label, value }) => (
      <Box gap="small" width="45%">
          <Text variant="micro" format="bold">{label}</Text>
          <Text>{value || "TBD"}</Text>
      </Box>
  );

  return (
    <Box direction="column" gap="medium">
      <Heading>Review & Submit</Heading>
      
      <Panel>
        <PanelSection>
            <Flex wrap={true} gap="medium">
                <SummaryField label="Customer Name" value={order.jobName} />
                <SummaryField label="PO Number" value={order.poNumber} />
                <SummaryField label="Selected Ticket" value={order.ticketId} />
                <SummaryField label="Supplier" value={order.supplier} />
                <SummaryField label="Delivery Date" value={order.delivery?.date} />
                <SummaryField label="Primary Contact" value={order.delivery?.primaryContact} />
                <SummaryField label="Service Type" value={order.delivery?.serviceType} />
                <SummaryField label="Time Code" value={order.delivery?.timeCode} />
            </Flex>
            <Divider />
            <Box>
                <Text variant="micro" format="bold">Delivery Instructions</Text>
                <Text>{order.delivery?.instructions || "None"}</Text>
            </Box>
        </PanelSection>
        
        <PanelSection>
          <Text format="bold">Items to be Ordered</Text>
          <Table>
            <TableHead>
                <TableRow>
                  <TableHeader>Qty</TableHeader>
                  <TableHeader>U/M</TableHeader>
                  <TableHeader>SKU</TableHeader>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Line Price</TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>${((item.price||0) * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box alignSelf="end" padding="small">
             <Text format="bold" size="large">Total: ${(order.totals?.grandTotal || 0).toFixed(2)}</Text>
          </Box>
        </PanelSection>
      </Panel>
    </Box>
  );
};

export default ReviewSubmit;

import React from "react";
import { Box, Heading, Text, Button, Panel, PanelBody, Illustration, Flex } from "@hubspot/ui-extensions";

const SuccessPage = ({ order, actions }) => {
  return (
    <Box direction="column" gap="large" alignSelf="center">
      <Panel>
        <PanelBody>
          <Flex direction="column" align="center" gap="medium">
            <Illustration name="success" size="lg" />
            <Heading>Order Submitted!</Heading>
            <Text align="center">Your order has been sent to {order.supplier}.</Text>
            
            {order.confirmation && (
              <Box gap="small" padding="medium" background="bg-gray-50">
                 <Text format="bold">Confirmation #: {order.confirmation.orderId}</Text>
                 {order.confirmation.confirmationUrl && (
                     <Button href={order.confirmation.confirmationUrl} variant="tertiary">View Receipt PDF</Button>
                 )}
              </Box>
            )}

            <Button onClick={() => actions.closeOverlay()} variant="secondary">
              Close Extension
            </Button>
          </Flex>
        </PanelBody>
      </Panel>
    </Box>
  );
};

export default SuccessPage;

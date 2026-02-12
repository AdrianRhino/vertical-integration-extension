import React from "react";
import { Button, Text, Box, Flex, Heading, Tile } from "@hubspot/ui-extensions";

const OrderStart = ({ actions, context }) => {

  const handleOpenIframe = () => {
    const dealId = context.crm.objectId;
    const uri = "https://vertical-integration-replitzip-1.replit.app?dealId=" + dealId + "&userId=" + context.user.id;
    actions.openIframeModal(
      {
        uri: uri,
        height: 1000,
        width: 1000,
        title: "Vertical Integration",
        flush: true,
      },
      () => {
        console.log("Iframe modal closed");
      }
    );
  };
  
  return (
    <Box direction="column" gap="medium" alignSelf="center" width="600px">
      <Flex justify="center" align="center" direction="column" gap="xs">
 <Heading>Order Management</Heading>
      <Text>Click the button below to begin:</Text>
      <Text></Text>
      </Flex>
      
      <Tile padding="medium">
        <Flex direction="column" gap="medium" justify="center">
          
          <Button onClick={handleOpenIframe} variant="primary" width="50%" alignSelf="center">
            Open Iframe Modal
          </Button>
        </Flex>
      </Tile>
    </Box>
  );
};

export default OrderStart;

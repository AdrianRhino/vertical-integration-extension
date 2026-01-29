import React, { useState } from "react";
import { Button, Text, Box, Flex, Heading, Tile, Panel, PanelBody, Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@hubspot/ui-extensions";

const OrderStart = ({ setOrder, setCanGoNext, setCurrentPage, runServerlessFunction, actions }) => {

  const handleOpenIframe = () => {
    actions.openIframeModal(
      {
        uri: "https://vertical-integration-replit.replit.app",
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

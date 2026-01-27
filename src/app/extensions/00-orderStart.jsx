import React, { useState } from "react";
import { Button, Text, Box, Flex, Heading, Tile, Panel, PanelBody, Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@hubspot/ui-extensions";

const OrderStart = ({ setOrder, setCanGoNext, setCurrentPage, runServerlessFunction, actions }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('menu'); // 'menu', 'drafts', 'submitted'
  const [listData, setListData] = useState([]);

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

  const handleNewOrder = () => {
    setOrder({
      items: [],
      supplier: null,
      jobName: "",
      deliveryAddress: {},
      totals: { total: 0 }
    });
    setCanGoNext(true);
    setCurrentPage(1); // Go to Pickup/Setup
  };

  const loadList = async (type) => {
    setLoading(true);
    try {
      const action = type === 'drafts' ? 'getDraftOrders' : 'getSubmittedOrders';
      const result = await runServerlessFunction({ name: 'viProxy', parameters: { action } });
      // Handle different response structures
      const isOk = result?.response?.body?.ok || 
                   result?.response?.statusCode === 200 || 
                   result?.body?.ok || 
                   result?.statusCode === 200;
      if (isOk) {
        const items = result?.response?.body?.data?.items || 
                     result?.response?.data?.items || 
                     result?.body?.data?.items || 
                     result?.data?.items || 
                     [];
        setListData(items);
        setView(type);
      } else {
        actions.addAlert({ title: "Error", message: "Failed to load list", variant: "danger" });
      }
    } catch(e) {
      actions.addAlert({ title: "Error", message: e.message, variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const loadOrder = async (id, isSubmitted) => {
    setLoading(true);
    try {
      const result = await runServerlessFunction({ name: 'viProxy', parameters: { action: 'getOrder', payload: { id } } });
      // Handle different response structures
      const isOk = result?.response?.body?.ok || 
                   result?.response?.statusCode === 200 || 
                   result?.body?.ok || 
                   result?.statusCode === 200;
      if (isOk) {
        const orderData = result?.response?.body?.data || 
                         result?.response?.data || 
                         result?.body?.data || 
                         result?.data;
        setOrder(orderData);
        if (isSubmitted) {
           // View only mode or similar? For now just load it.
           // Maybe jump to Review or success? 
           // User req: "View Submitted Order... load selected order as it was submitted"
           // We'll jump to Review page in 'readonly' mode effectively, or just let them edit a copy.
           // Let's assume edit copy for now to keep flow simple, or jump to Review.
           setCurrentPage(4); 
        } else {
           setCurrentPage(1);
        }
      }
    } catch(e) {
      actions.addAlert({ title: "Error", message: e.message || "Failed to load order", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  if (view !== 'menu') {
    return (
      <Box gap="medium">
        <Flex justify="between" align="center">
          <Heading>{view === 'drafts' ? 'Draft Orders' : 'Submitted Orders'}</Heading>
          <Button onClick={() => setView('menu')} variant="secondary" size="sm">Back</Button>
        </Flex>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Job Name</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {listData.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.jobName}</TableCell>
                <TableCell>{item.date || item.updatedAt}</TableCell>
                <TableCell>
                  <Button size="xs" onClick={() => loadOrder(item.id, view === 'submitted')}>Load</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {listData.length === 0 && <Text>No orders found.</Text>}
      </Box>
    );
  }

  return (
    <Box direction="column" gap="medium" alignSelf="center" width="600px">
      <Heading>Order Management</Heading>
      <Text>Choose an option to begin:</Text>
      
      <Tile padding="medium">
        <Flex direction="column" gap="medium">
          
          <Button onClick={handleOpenIframe} variant="primary" width="100%">
            Open Iframe Modal
          </Button>
        </Flex>
      </Tile>
    </Box>
  );
};

export default OrderStart;

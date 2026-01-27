import React, { useState } from "react";
import { Button, Text, Box, Flex, Heading, Tile, Panel, PanelBody, Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from "@hubspot/ui-extensions";

const OrderStart = ({ setOrder, setCanGoNext, setCurrentPage, runServerlessFunction, actions }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('menu'); // 'menu', 'drafts', 'submitted'
  const [listData, setListData] = useState([]);

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
      if (result.response.ok) {
        setListData(result.response.data.items);
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
      if (result.response.ok) {
        setOrder(result.response.data);
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
          <Button onClick={handleNewOrder} variant="primary" width="100%">
            Start New Order
          </Button>
          <Button onClick={() => loadList('drafts')} variant="secondary" width="100%">
            Load Draft Order
          </Button>
          <Button onClick={() => loadList('submitted')} variant="secondary" width="100%">
            View Submitted Order
          </Button>
        </Flex>
      </Tile>
    </Box>
  );
};

export default OrderStart;

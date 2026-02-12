import React, { useState, useEffect } from "react";
import { Button, Text, Box, StepIndicator } from "@hubspot/ui-extensions";
import OrderStart from "./00-orderStart";
import PickupSetup from "./01-pickupSetup";
import PricingTable from "./02-pricingTable";
import DeliveryForm from "./03-deliveryForm";
import ReviewSubmit from "./04-reviewSubmit";
import SuccessPage from "./05-successPage";

// Define the steps for the indicator
const STEP_NAMES = [
  "Start",
  "Pickup",
  "Pricing",
  "Delivery",
  "Review",
  "Done"
];

export const Wizard = ({ context, runServerlessFunction, actions }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [canGoNext, setCanGoNext] = useState(true); 
  const [submitting, setSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [order, setOrder] = useState({
    items: [],
    supplier: null,
    pickupDate: null,
    jobName: "",
    deliveryAddress: {},
    totals: { total: 0, tax: 0, grandTotal: 0 }
  });

  // Debounced Autosave
  useEffect(() => {
    // Skip save on initial empty load
    if (!order.jobName && order.items.length === 0) return;

    const timer = setTimeout(async () => {
        setIsSaving(true);
        try {
            const res = await runServerlessFunction({
                name: 'viProxy',
                parameters: { action: 'saveDraft', payload: order }
            });
            // Handle different response structures
            const isOk = res?.response?.body?.ok || 
                        res?.response?.statusCode === 200 || 
                        res?.body?.ok || 
                        res?.statusCode === 200;
            if (isOk) {
                setLastSaved(new Date());
            }
        } catch(e) {
            console.error("Autosave failed", e);
        } finally {
            setIsSaving(false);
        }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [order]);

  // Pricing Totals Calculation
  useEffect(() => {
    if (order.items) {
      const newTotal = order.items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 1));
      }, 0);
      
      if (Math.abs(newTotal - (order.totals?.grandTotal || 0)) > 0.001) {
          setOrder(prev => ({
              ...prev,
              totals: { ...prev.totals, grandTotal: newTotal, total: newTotal }
          }));
      }
    }
  }, [order.items]);

  const commonProps = {
    context,
    runServerlessFunction,
    actions,
    order,
    setOrder,
    setCurrentPage,
    setCanGoNext
  };

  const handleNext = async () => {
    if (currentPage === 4) {
      // Review Step -> Confirm & Submit
      setSubmitting(true);
      try {
        // 1. Check Pricing Freshness
        // If any item has 0 price or we want to force refresh:
        const needsPricing = order.items.some(i => !i.price || i.price === 0);
        
        if (needsPricing) {
            actions.addAlert({ title: "Updating Prices", message: "Fetching latest pricing before submission...", variant: "info" });
            const priceRes = await runServerlessFunction({
                name: 'viProxy',
                parameters: { action: 'getPricing', payload: { items: order.items } }
            });

            // Handle different response structures
            const priceIsOk = priceRes?.response?.body?.ok || 
                             priceRes?.response?.statusCode === 200 || 
                             priceRes?.body?.ok || 
                             priceRes?.statusCode === 200;
            
            if (!priceIsOk) {
                throw new Error("Pricing update failed. Cannot submit.");
            }

            // Update state with fresh prices - try multiple response paths
            const freshItems = priceRes?.response?.body?.data?.items || 
                              priceRes?.response?.data?.items || 
                              priceRes?.body?.data?.items || 
                              priceRes?.data?.items || 
                              [];
            const freshTotals = priceRes?.response?.body?.data?.totals || 
                               priceRes?.response?.data?.totals || 
                               priceRes?.body?.data?.totals || 
                               priceRes?.data?.totals;
            setOrder(prev => ({ ...prev, items: freshItems, totals: freshTotals }));
            
            // Re-check just in case
            if (freshItems.some(i => !i.price || i.price === 0)) {
                 throw new Error("Some items could not be priced. Please remove them.");
            }
        }

        // 2. Submit
        const response = await runServerlessFunction({
          name: 'viProxy',
          parameters: {
            action: 'submitOrder',
            supplierKey: order.supplier,
            payload: order
          }
        });

        // Handle different response structures
        const submitIsOk = response?.response?.body?.ok || 
                          response?.response?.statusCode === 200 || 
                          response?.body?.ok || 
                          response?.statusCode === 200;
        
        if (submitIsOk) {
          const confirmation = response?.response?.body?.data || 
                              response?.response?.data || 
                              response?.body?.data || 
                              response?.data;
          setOrder(prev => ({ ...prev, confirmation }));
          setCurrentPage(5); // Go to success
        } else {
          const errorMsg = response?.response?.body?.error?.message || 
                          response?.response?.error?.message || 
                          response?.body?.error?.message || 
                          response?.error?.message || 
                          "Submission failed";
          actions.addAlert({ title: "Submission Failed", message: errorMsg, variant: "danger" });
        }
      } catch (e) {
        actions.addAlert({ title: "Error", message: e.message || "Submission error", variant: "danger" });
      } finally {
        setSubmitting(false);
      }
    } else {
      // Normal Navigation
      // Force autosave on transition?
      // The debouncer handles it, but we could force immediate save here if critical.
      // For simplicity, we rely on the debounce effect running eventually.
      setCurrentPage(Math.min(5, currentPage + 1));
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 0: return <OrderStart context={context} actions={actions} />;
      case 1: return <PickupSetup {...commonProps} />;
      case 2: return <PricingTable {...commonProps} />;
      case 3: return <DeliveryForm {...commonProps} />;
      case 4: return <ReviewSubmit {...commonProps} />;
      case 5: return <SuccessPage {...commonProps} />;
      default: return <Text>Unknown Page</Text>;
    }
  };

  return (
    <Box direction="column" gap="medium">
      <Box>
        {renderPage()}
      </Box>
      <Text></Text>
    </Box>
  );
};

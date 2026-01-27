import React, { useState, useEffect } from "react";
import { Button, Text, Box, StepIndicator } from "@hubspot/ui-extensions";
import OrderStart from "./00-orderStart";
import PickupSetup from "./01-pickupSetup";
import PricingTable from "./02-pricingTable";
import DeliveryForm from "./03-deliveryForm";
import ReviewSubmit from "./04-reviewSubmit";
import SuccessPage from "./05-successPage";

// Define the steps for the indicator
const STEPS = [
  { title: "Start" },
  { title: "Pickup" },
  { title: "Pricing" },
  { title: "Delivery" },
  { title: "Review" },
  { title: "Done" }
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
            if (res.response.ok) {
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

            if (!priceRes.response.ok) {
                throw new Error("Pricing update failed. Cannot submit.");
            }

            // Update state with fresh prices
            const freshItems = priceRes.response.data.items;
            const freshTotals = priceRes.response.data.totals;
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

        if (response.response.ok) {
          setOrder(prev => ({ ...prev, confirmation: response.response.data }));
          setCurrentPage(5); // Go to success
        } else {
          actions.addAlert({ title: "Submission Failed", message: response.response.error.message, variant: "danger" });
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
      case 0: return <OrderStart {...commonProps} />;
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
      <Box direction="row" justify="between" align="center">
         <StepIndicator currentStep={currentPage} steps={STEPS} />
         {/* Autosave Indicator */}
         {lastSaved && (
             <Text variant="micro" format="italic">
                 {isSaving ? "Saving..." : `Draft Saved ${lastSaved.toLocaleTimeString()}`}
             </Text>
         )}
      </Box>
      
      <Box>
        {renderPage()}
      </Box>

      {/* Navigation Buttons (Hidden on Success Page) */}
      {currentPage < 5 && (
        <Box direction="row" justify="between" gap="medium">
          <Button 
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || submitting}
            variant="secondary"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canGoNext || submitting}
            variant="primary"
          >
            {currentPage === 4 ? (submitting ? "Confirming..." : "Confirm & Submit Order") : "Next"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

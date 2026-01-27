import React from "react";
import { hubspot } from "@hubspot/ui-extensions";
import { Wizard } from "./Wizard";

// Explicitly call hubspot.extend at the module level
// This ensures HubSpot can detect the entry point
hubspot.extend(({ context, runServerlessFunction, actions }) => {
  return (
    <Wizard 
      context={context} 
      runServerlessFunction={runServerlessFunction} 
      actions={actions} 
    />
  );
});

import React from "react";
import { hubspot } from "../hubspot-mock/ui-extensions";
import { Wizard } from "./Wizard";

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Wizard 
    context={context} 
    runServerlessFunction={runServerlessFunction} 
    actions={actions} 
  />
));

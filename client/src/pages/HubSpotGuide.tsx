import React from "react";
import { HubSpotVisualizer } from "@/components/HubSpotVisualizer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, FileCode, Server, ShieldCheck } from "lucide-react";

export default function HubSpotGuide() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">HubSpot CRM Extension Project</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A complete scaffolding for a Serverless UI Extension, ready for HubSpot CLI upload.
          </p>
        </div>

        {/* Visualizer Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-orange-500 text-white p-2 rounded">
              <Terminal className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Extension Preview (Visual Mockup)</h2>
          </div>
          <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800">
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              This is a React-based visual simulation running in the browser. The actual extension code (using HubSpot's React components) is located in <code>src/app/extensions</code>.
            </AlertDescription>
          </Alert>
          <HubSpotVisualizer />
        </section>

        {/* Project Structure */}
        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileCode className="h-5 w-5 text-purple-600" />
              Source Code Structure
            </h3>
            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-2 font-mono text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">📂 src/app/extensions/</span>
                <span className="text-slate-400"># UI Code</span>
              </div>
              <div className="pl-6 text-slate-500">
                ├── Wizard.jsx<br/>
                ├── 00-orderStart.jsx<br/>
                ├── ... (Pages 01-05)<br/>
                └── config/ (JSONs)
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-green-600">📂 src/app/app.functions/</span>
                <span className="text-slate-400"># Serverless</span>
              </div>
              <div className="pl-6 text-slate-500">
                ├── serverless.json<br/>
                └── viProxy.js
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-blue-600">📄 GUARDRAILS.md</span>
                <span className="text-slate-400"># Rules</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-600" />
              Deployment Instructions
            </h3>
            <div className="bg-slate-900 text-slate-50 p-6 rounded-lg shadow-sm font-mono text-sm leading-relaxed">
              <p className="text-slate-400 mb-2"># 1. Authenticate with HubSpot</p>
              <p className="text-green-400">$ npx hs auth</p>
              
              <p className="text-slate-400 mt-4 mb-2"># 2. Upload Project</p>
              <p className="text-green-400">$ npx hs project upload</p>
              
              <p className="text-slate-400 mt-4 mb-2"># 3. Watch for Changes</p>
              <p className="text-green-400">$ npx hs project watch</p>
            </div>
            
            <div className="flex items-start gap-3 bg-amber-50 p-4 rounded text-amber-900 text-sm">
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
              <p>
                <strong>Security Guardrails:</strong><br/>
                All supplier API keys must be configured in HubSpot Secrets. The code references them via <code>context.secrets</code>. Do not hardcode keys.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

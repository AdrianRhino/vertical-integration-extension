
import React from 'react';
import { Wizard } from '../extensions-mirror/Wizard.jsx';
import { Toaster } from "@/components/ui/toaster";
import { createClient } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { Settings } from 'lucide-react';

// Mock Data
const MOCK_DRAFTS = [
  { id: 'draft-1', jobName: 'Smith Residence', updatedAt: '2023-10-25' },
  { id: 'draft-2', jobName: 'Miller Commercial', updatedAt: '2023-10-24' }
];

const MOCK_SUBMITTED = [
  { id: 'ord-101', jobName: 'Jones Roof', status: 'Submitted', date: '2023-10-20' },
  { id: 'ord-102', jobName: 'City Hall Siding', status: 'Shipped', date: '2023-10-18' }
];

const MOCK_TICKETS = [
  { id: 'ticket-501', subject: 'Roof Leak Repair - Smith', created: '2023-10-25' },
  { id: 'ticket-502', subject: 'New Siding Estimate - Miller', created: '2023-10-22' }
];

const MOCK_TEAM_MEMBERS = [
  { id: 'user-1', name: 'John Doe (Sales)', email: 'john@example.com' },
  { id: 'user-2', name: 'Jane Smith (PM)', email: 'jane@example.com' }
];

// Real Backend Bridge
const realBackend = async ({ name, parameters }: any) => {
  console.log(`[Backend] Action: ${parameters.action}`, parameters);
  
  try {
    switch (parameters.action) {
      case 'getDraftOrders':
        await new Promise(resolve => setTimeout(resolve, 600));
        return { response: { ok: true, data: { items: MOCK_DRAFTS } } };
      
      case 'getSubmittedOrders':
        await new Promise(resolve => setTimeout(resolve, 600));
        return { response: { ok: true, data: { items: MOCK_SUBMITTED } } };
        
      case 'getOrder':
        await new Promise(resolve => setTimeout(resolve, 600));
        return { 
          response: { 
            ok: true, 
            data: { 
              id: parameters.payload.id,
              jobName: "Mock Loaded Job",
              supplier: "ABC",
              items: [{ name: "Mock Item", quantity: 1, price: 100 }],
            } 
          } 
        };

      case 'getAssociatedTickets':
        await new Promise(resolve => setTimeout(resolve, 600));
        return { response: { ok: true, data: { items: MOCK_TICKETS } } };

      case 'getTeamMembers':
        await new Promise(resolve => setTimeout(resolve, 600));
        return { response: { ok: true, data: { items: MOCK_TEAM_MEMBERS } } };

      case 'searchProducts':
        try {
          const searchQuery = parameters.payload?.query || '';
          const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&supplier=${parameters.supplierKey}`);
          
          if (!response.ok) {
            throw new Error('Failed to search products');
          }

          const products = await response.json();
          return {
            response: {
              ok: true,
              data: {
                results: products.map((p: any) => {
                  let name = p.itemdescription;
                  const supplier = parameters.supplierKey?.toLowerCase();
                  
                  if (supplier === 'srs') {
                    name = p.marketingdescription || p.itemdescription;
                  } else if (supplier === 'beacon') {
                    name = p.familyname || p.itemdescription;
                  }

                  return {
                    id: p.id || p.itemnumber,
                    sku: p.sku,
                    name: name,
                    price: p.price || 0,
                    variant: p.color || 'Standard',
                    uom: p.uom || 'EA'
                  };
                })
              }
            }
          };
        } catch (error: any) {
          console.error('Product search error:', error);
          return {
            response: {
              ok: false,
              error: { message: error.message || 'Failed to search products' }
            }
          };
        }

      case 'getPricing':
        try {
          const response = await fetch('/api/pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supplier: parameters.supplierKey || parameters.payload.supplier,
              items: parameters.payload.items,
              branchNumber: parameters.payload.branchNumber,
              shipToNumber: parameters.payload.shipToNumber,
              customerCode: parameters.payload.customerCode,
              branchCode: parameters.payload.branchCode,
              env: 'sandbox'
            })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Pricing request failed');
          }

          const data = await response.json();
          return {
            response: {
              ok: true,
              data: data
            }
          };
        } catch (error: any) {
          console.error('Pricing error:', error);
          return {
            response: {
              ok: false,
              error: { message: error.message || 'Failed to fetch pricing' }
            }
          };
        }

      case 'submitOrder':
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          response: {
            ok: true,
            data: {
              orderId: `ORD-${Date.now()}`,
              status: 'CONFIRMED',
              confirmationUrl: 'https://example.com/receipt.pdf'
            }
          }
        };

      case 'saveDraft':
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
          response: {
            ok: true,
            data: { savedAt: new Date().toISOString() }
          }
        };

      case 'getSettings':
        try {
          const settingsRes = await fetch('/api/settings');
          if (!settingsRes.ok) throw new Error('Failed to fetch settings');
          const settingsData = await settingsRes.json();
          return { response: { ok: true, data: settingsData } };
        } catch (err: any) {
          return { response: { ok: false, error: { message: err.message } } };
        }

      case 'updateSetting':
        try {
          const { supplier, actionKey, env } = parameters.payload;
          const updateRes = await fetch(`/api/settings/${supplier}/${actionKey}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ env })
          });
          if (!updateRes.ok) throw new Error('Failed to update setting');
          const updateData = await updateRes.json();
          return { response: { ok: true, data: updateData } };
        } catch (err: any) {
          return { response: { ok: false, error: { message: err.message } } };
        }

      default:
        return { response: { ok: false, error: { message: `Unknown action: ${parameters.action}` } } };
    }
  } catch (error: any) {
    return { response: { ok: false, error: { message: error.message || 'Request failed' } } };
  }
};

const mockActions = {
  addAlert: ({ title, message }: any) => alert(`${title}: ${message}`),
  closeOverlay: () => window.location.reload()
};

const mockContext = { portalId: 123, user: { id: 1 }, crm: { objectId: 999 } };

export default function Preview() {
  return (
    <div className="min-h-screen bg-[#f5f8fa] flex flex-col items-center py-8">
      <div className="w-full max-w-4xl bg-white shadow-sm border border-[#dfe3eb] rounded-md overflow-hidden min-h-[700px]">
        <div className="bg-white border-b border-[#dfe3eb] px-6 py-4 flex justify-between items-center">
          <h1 className="font-semibold text-[#33475b] text-lg">Order Management (Extension Preview)</h1>
          <div className="flex items-center gap-3">
            <Link href="/settings">
              <button className="flex items-center gap-1 text-xs text-[#516f90] hover:text-[#33475b] transition-colors" data-testid="link-settings">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </Link>
            <div className="text-xs text-[#516f90] bg-[#f5f8fa] px-2 py-1 rounded border border-[#cbd6e2]">
               Live Backend
            </div>
          </div>
        </div>
        <div className="p-6">
          <Wizard 
            context={mockContext}
            runServerlessFunction={realBackend}
            actions={mockActions}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
}

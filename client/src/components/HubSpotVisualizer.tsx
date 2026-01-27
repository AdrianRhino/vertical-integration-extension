import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, ChevronRight, Package, Truck, CreditCard } from "lucide-react";

// Mock Data
const TEMPLATES = [
  { id: "roofing-residential", name: "Residential Roofing Order" },
  { id: "siding-commercial", name: "Commercial Siding Order" }
];

const MOCK_PRODUCTS = [
  { id: "101", name: "ABC Shingles - Black", price: 35.00 },
  { id: "102", name: "ABC Shingles - Brown", price: 35.00 },
  { id: "103", name: "ABC Underlayment", price: 12.50 }
];

export function HubSpotVisualizer() {
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<any>({ items: [] });
  const [loading, setLoading] = useState(false);

  const next = () => setStep(s => Math.min(5, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  const STEPS = ["Start", "Pickup", "Pricing", "Delivery", "Review", "Success"];

  // Page Components
  const PageStart = () => (
    <div className="space-y-4">
      <Label>Select Template</Label>
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map(t => (
          <Button 
            key={t.id} 
            variant={order.templateId === t.id ? "default" : "outline"}
            className="h-24 flex flex-col items-center justify-center gap-2"
            onClick={() => setOrder({ ...order, templateId: t.id, supplier: "ABC" })}
          >
            <Package className="h-6 w-6" />
            {t.name}
          </Button>
        ))}
      </div>
    </div>
  );

  const PagePickup = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Job Name</Label>
        <Input 
          value={order.jobName || ''} 
          onChange={e => setOrder({...order, jobName: e.target.value})}
          placeholder="e.g. Smith Residence" 
        />
      </div>
      <div className="space-y-2">
        <Label>Pickup Date</Label>
        <Input type="date" />
      </div>
    </div>
  );

  const PagePricing = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Supplier Catalog ({order.supplier || 'ABC'})</h3>
        <Button size="sm" variant="secondary" onClick={() => setLoading(true)}>
          {loading ? "Loading..." : "Refresh Prices"}
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PRODUCTS.map(p => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>${p.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setOrder({...order, items: [...order.items, p]})}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted p-4 rounded-md">
        <p className="font-medium">Cart Total: ${order.items.reduce((a:any, b:any) => a + b.price, 0).toFixed(2)}</p>
      </div>
    </div>
  );

  const PageDelivery = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Street Address</Label>
        <Input placeholder="123 Main St" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input placeholder="Springfield" />
        </div>
        <div className="space-y-2">
          <Label>Zip</Label>
          <Input placeholder="12345" />
        </div>
      </div>
    </div>
  );

  const PageReview = () => (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Ready to Submit</AlertTitle>
        <AlertDescription>
          Please review the details below before submitting to {order.supplier}.
        </AlertDescription>
      </Alert>
      
      <div className="text-sm space-y-2 border p-4 rounded-md">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Job:</span>
          <span className="font-medium">{order.jobName || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Items:</span>
          <span className="font-medium">{order.items.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium">${order.items.reduce((a:any, b:any) => a + b.price, 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  const PageSuccess = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
      <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-bold">Order Placed!</h3>
      <p className="text-muted-foreground">Order #ORD-{Date.now().toString().slice(-4)} has been confirmed.</p>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Order Management Extension</CardTitle>
        <CardDescription>Visual Mockup of the HubSpot Wizard</CardDescription>
        
        {/* Stepper */}
        <div className="flex justify-between mt-6 px-2">
          {STEPS.map((label, i) => (
            <div key={i} className={`flex flex-col items-center space-y-2 ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {i + 1}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="py-6 min-h-[400px]">
        {step === 0 && <PageStart />}
        {step === 1 && <PagePickup />}
        {step === 2 && <PagePricing />}
        {step === 3 && <PageDelivery />}
        {step === 4 && <PageReview />}
        {step === 5 && <PageSuccess />}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-6">
        {step < 5 && (
          <>
            <Button variant="ghost" onClick={back} disabled={step === 0}>Back</Button>
            <Button onClick={next} disabled={step === 0 && !order.templateId}>
              {step === 4 ? "Submit Order" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
        {step === 5 && (
          <Button className="w-full" onClick={() => setStep(0)}>Start New Order</Button>
        )}
      </CardFooter>
    </Card>
  );
}

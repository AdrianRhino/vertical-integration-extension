import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, Settings as SettingsIcon, CheckCircle, AlertCircle } from "lucide-react";

interface SupplierSettings {
  [supplier: string]: {
    [action: string]: 'sandbox' | 'prod';
  };
}

const SUPPLIERS = [
  { key: 'ABC', name: 'ABC Supply', status: 'blocked', statusText: 'IP Firewall' },
  { key: 'SRS', name: 'SRS Distribution', status: 'blocked', statusText: 'Credentials Issue' },
  { key: 'BEACON', name: 'QXO (Beacon)', status: 'working', statusText: 'Connected' },
];

const ACTIONS = [
  { key: 'getPricing', name: 'Get Pricing' },
  { key: 'submitOrder', name: 'Submit Order' },
];

export default function Settings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SupplierSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      return res.json();
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ supplier, action, env }: { supplier: string; action: string; env: 'sandbox' | 'prod' }) => {
      const res = await fetch(`/api/settings/${supplier}/${action}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ env }),
      });
      if (!res.ok) throw new Error('Failed to update setting');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleToggle = (supplier: string, action: string, currentValue: 'sandbox' | 'prod') => {
    const newValue = currentValue === 'sandbox' ? 'prod' : 'sandbox';
    updateSetting.mutate({ supplier, action, env: newValue });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="back-button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Supplier Settings</h1>
        </div>
      </div>

      <p className="text-muted-foreground mb-8">
        Configure which environment (Sandbox or Production) is used for each supplier action. 
        Use Sandbox for testing and Production for live orders.
      </p>

      <div className="space-y-6">
        {SUPPLIERS.map((supplier) => (
          <Card key={supplier.key} data-testid={`card-supplier-${supplier.key}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {supplier.name}
                    {supplier.status === 'working' ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {supplier.statusText}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {supplier.statusText}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Configure environment settings for {supplier.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ACTIONS.map((action) => {
                  const currentValue = settings?.[supplier.key]?.[action.key] || 'sandbox';
                  const isProd = currentValue === 'prod';
                  
                  return (
                    <div key={action.key} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <Label htmlFor={`${supplier.key}-${action.key}`} className="font-medium">
                          {action.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Currently using: <span className={isProd ? 'text-orange-600 font-semibold' : 'text-blue-600 font-semibold'}>
                            {isProd ? 'Production' : 'Sandbox'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${!isProd ? 'font-semibold' : 'text-muted-foreground'}`}>
                          Sandbox
                        </span>
                        <Switch
                          id={`${supplier.key}-${action.key}`}
                          checked={isProd}
                          onCheckedChange={() => handleToggle(supplier.key, action.key, currentValue)}
                          data-testid={`switch-${supplier.key}-${action.key}`}
                        />
                        <span className={`text-sm ${isProd ? 'font-semibold text-orange-600' : 'text-muted-foreground'}`}>
                          Prod
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Warning</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Switching to Production mode will send real orders to suppliers. Only use Production 
          after thoroughly testing in Sandbox mode. Orders submitted in Production cannot be undone 
          through this system.
        </p>
      </div>
    </div>
  );
}

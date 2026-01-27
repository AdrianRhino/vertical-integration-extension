import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  Heading, 
  Panel, 
  PanelSection,
  Toggle, 
  Alert, 
  StatusTag,
  Button,
  Divider,
  LoadingSpinner
} from '../hubspot-mock/ui-extensions-react';

const SUPPLIERS = [
  { key: 'ABC', name: 'ABC Supply', status: 'blocked', statusText: 'IP Firewall' },
  { key: 'SRS', name: 'SRS Distribution', status: 'blocked', statusText: 'Credentials Issue' },
  { key: 'BEACON', name: 'QXO (Beacon)', status: 'working', statusText: 'Connected' },
];

const ACTIONS = [
  { key: 'getPricing', name: 'Get Pricing' },
  { key: 'submitOrder', name: 'Submit Order' },
];

export const SettingsPanel = ({ runServerlessFunction, onClose }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await runServerlessFunction({
        name: 'viProxy',
        parameters: { action: 'getSettings' }
      });
      if (res?.response?.ok && res?.response?.data) {
        setSettings(res.response.data);
      } else {
        setSettings({
          ABC: { getPricing: 'sandbox', submitOrder: 'sandbox' },
          SRS: { getPricing: 'sandbox', submitOrder: 'sandbox' },
          BEACON: { getPricing: 'sandbox', submitOrder: 'sandbox' },
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings({
        ABC: { getPricing: 'sandbox', submitOrder: 'sandbox' },
        SRS: { getPricing: 'sandbox', submitOrder: 'sandbox' },
        BEACON: { getPricing: 'sandbox', submitOrder: 'sandbox' },
      });
    }
    setLoading(false);
  };

  const handleToggle = async (supplier, action) => {
    const currentValue = settings?.[supplier]?.[action] || 'sandbox';
    const newValue = currentValue === 'sandbox' ? 'prod' : 'sandbox';
    
    setSaving(true);
    try {
      await runServerlessFunction({
        name: 'viProxy',
        parameters: { 
          action: 'updateSetting',
          payload: { supplier, actionKey: action, env: newValue }
        }
      });
      
      setSettings(prev => ({
        ...prev,
        [supplier]: {
          ...prev[supplier],
          [action]: newValue
        }
      }));
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box padding="large">
        <LoadingSpinner />
        <Text variant="subdued" align="center">Loading settings...</Text>
      </Box>
    );
  }

  return (
    <Box padding="medium">
      <Heading>Supplier Environment Settings</Heading>
      <Text variant="subdued">
        Configure which environment (Sandbox or Production) is used for each supplier action.
        Use Sandbox for testing and Production for live orders.
      </Text>
      
      <Divider />

      {SUPPLIERS.map((supplier) => (
        <Panel key={supplier.key} title={supplier.name}>
          <PanelSection>
            <Flex justify="space-between" align="center">
              <Text format="bold">{supplier.name}</Text>
              <StatusTag variant={supplier.status === 'working' ? 'success' : 'neutral'}>
                {supplier.statusText}
              </StatusTag>
            </Flex>
          </PanelSection>
          
          {ACTIONS.map((action) => {
            const currentValue = settings?.[supplier.key]?.[action.key] || 'sandbox';
            const isProd = currentValue === 'prod';
            
            return (
              <PanelSection key={action.key}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text format="bold">{action.name}</Text>
                    <Text variant="micro">
                      Current: {isProd ? 'Production' : 'Sandbox'}
                    </Text>
                  </Box>
                  <Toggle
                    name={`${supplier.key}-${action.key}`}
                    checked={isProd}
                    onChange={() => handleToggle(supplier.key, action.key)}
                    label={isProd ? 'Prod' : 'Sandbox'}
                  />
                </Flex>
              </PanelSection>
            );
          })}
        </Panel>
      ))}

      <Alert type="warning" title="Warning">
        Switching to Production mode will send real orders to suppliers.
        Only use Production after thoroughly testing in Sandbox mode.
        Orders submitted in Production cannot be undone through this system.
      </Alert>

      {onClose && (
        <Flex justify="flex-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default SettingsPanel;

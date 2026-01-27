
// Mock logic for hubspot.extend
export const hubspot = {
  extend: (callback: any) => {
    // In a real environment, this registers the extension.
    // For our mock wrapper, we'll manually invoke the component passed to this.
    // We can't easily simulate the callback architecture here without the wrapper knowing about it.
    // So we'll export a helper to register the "Root" component.
    (window as any).__hubspotExtension = callback;
  }
};

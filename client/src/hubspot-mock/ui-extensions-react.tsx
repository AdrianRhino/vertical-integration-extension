
import React, { useState } from 'react';

// Mock components to simulate HubSpot UI Extensions in browser with Canvas-like styling

// --- Colors ---
// Canvas uses Obsidian (#33475b) for text, Flint (#516f90) for secondary text
// Gypsum (#f5f8fa) for backgrounds, Koala (#dfe3eb) for borders.
// Lorax (#ff7a59) is the primary orange, but user requested neutral.
// We'll use Calypso (#00a4bd) or just Slate for a neutral look.

export const Button = ({ children, onClick, variant = 'primary', disabled, size = 'md', type }: any) => {
  const baseClass = "font-medium transition-colors rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants: any = {
    primary: "bg-[#ff7a59] text-white hover:bg-[#ff8f73] border border-transparent", // HubSpot Orange
    secondary: "bg-white text-[#33475b] border border-[#cbd6e2] hover:bg-[#f5f8fa]",
    destructive: "bg-[#f2545b] text-white hover:bg-[#ff6e75]",
    tertiary: "bg-transparent text-[#00a4bd] hover:text-[#00bda5] hover:underline"
  };

  const sizes: any = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      type={type}
      className={`${baseClass} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md}`}
    >
      {children}
    </button>
  );
};

export const ButtonRow = ({ children }: any) => (
  <div className="flex flex-row gap-3 mt-4">
    {children}
  </div>
);

export const Text = ({ children, format, variant, align }: any) => {
  const styles: any = {
    bold: "font-bold",
    italic: "italic",
    code: "font-mono bg-gray-100 px-1 rounded text-xs",
  };
  
  const variants: any = {
    micro: "text-xs text-[#516f90]",
    small: "text-sm text-[#33475b]",
    default: "text-base text-[#33475b]",
    large: "text-lg font-medium text-[#33475b]",
    error: "text-[#f2545b]",
    success: "text-[#00a4bd]",
    subdued: "text-[#516f90]"
  };

  return (
    <div className={`${styles[format] || ''} ${variants[variant] || variants.default} text-${align || 'left'}`}>
      {children}
    </div>
  );
};

export const Heading = ({ children }: any) => (
  <h2 className="text-xl font-bold mb-4 text-[#33475b]">{children}</h2>
);

export const Box = ({ children, flex, gap, direction = 'column', alignSelf, width, padding }: any) => (
  <div style={{ 
    display: flex ? 'flex' : 'block',
    flexDirection: direction,
    gap: gap ? `${gap === 'small' ? 0.5 : gap === 'medium' ? 1 : 2}rem` : undefined,
    alignSelf,
    width,
    padding: padding ? `${padding === 'small' ? 0.5 : padding === 'medium' ? 1 : 2}rem` : undefined
  }}>
    {children}
  </div>
);

export const Flex = ({ children, direction = 'row', gap, justify, align, wrap, padding }: any) => (
  <div style={{
    display: 'flex',
    flexDirection: direction,
    gap: gap ? `${gap === 'small' ? 0.5 : gap === 'medium' ? 1 : 2}rem` : undefined,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    padding: padding ? `${padding === 'small' ? 0.5 : padding === 'medium' ? 1 : 2}rem` : undefined
  }}>
    {children}
  </div>
);

export const Divider = () => <hr className="my-6 border-[#dfe3eb]" />;

// Inputs

export const Input = ({ label, value, onChange, error, required, name, type, placeholder }: any) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium mb-1 text-[#33475b]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type || "text"}
      name={name}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-sm outline-none transition-all ${
        error ? 'border-[#f2545b] focus:ring-[#f2545b]' : 'border-[#cbd6e2] focus:border-[#00a4bd] focus:ring-1 focus:ring-[#00a4bd]'
      } bg-[#f5f8fa] focus:bg-white text-[#33475b] placeholder-gray-400`}
    />
    {error && <div className="text-[#f2545b] text-xs mt-1">{error}</div>}
  </div>
);

export const TextArea = ({ label, value, onChange, error, placeholder, rows = 3 }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium mb-1 text-[#33475b]">{label}</label>}
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-[#cbd6e2] rounded-sm bg-[#f5f8fa] focus:bg-white focus:border-[#00a4bd] outline-none text-[#33475b]"
    />
  </div>
);

export const Select = ({ label, value, onChange, options, error, required, placeholder }: any) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium mb-1 text-[#33475b]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-[#cbd6e2] rounded-sm bg-[#f5f8fa] focus:bg-white focus:border-[#00a4bd] outline-none text-[#33475b]"
    >
      <option value="" disabled>{placeholder || "Select an option"}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <div className="text-[#f2545b] text-xs mt-1">{error}</div>}
  </div>
);

export const NumberInput = ({ label, value, onChange, min, max, error, step }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium mb-1 text-[#33475b]">{label}</label>}
    <input 
      type="number" 
      min={min} 
      max={max} 
      step={step}
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-[#cbd6e2] rounded-sm bg-[#f5f8fa] focus:bg-white focus:border-[#00a4bd] outline-none text-[#33475b]"
    />
    {error && <div className="text-[#f2545b] text-xs mt-1">{error}</div>}
  </div>
);

export const DateInput = ({ label, value, onChange, error }: any) => (
  <Input type="date" label={label} value={value} onChange={onChange} error={error} />
);

export const StepperInput = ({ label, value, onChange, min = 0, max = 100, step = 1 }: any) => {
  const handleDec = () => onChange(Math.max(min, Number(value || 0) - step));
  const handleInc = () => onChange(Math.min(max, Number(value || 0) + step));
  
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1 text-[#33475b]">{label}</label>}
      <div className="flex items-center">
        <button onClick={handleDec} className="px-3 py-2 border border-[#cbd6e2] rounded-l-sm bg-gray-100 hover:bg-gray-200 text-[#33475b]">-</button>
        <input 
          type="number" 
          value={value} 
          readOnly 
          className="w-20 text-center border-t border-b border-[#cbd6e2] py-2 text-[#33475b]"
        />
        <button onClick={handleInc} className="px-3 py-2 border border-[#cbd6e2] rounded-r-sm bg-gray-100 hover:bg-gray-200 text-[#33475b]">+</button>
      </div>
    </div>
  );
};

// Layouts & Containers

export const Panel = ({ children, title }: any) => (
  <div className="border border-[#dfe3eb] rounded-md bg-white shadow-sm mb-4 overflow-hidden">
    {title && <div className="bg-[#f5f8fa] px-4 py-3 border-b border-[#dfe3eb] font-medium text-[#33475b]">{title}</div>}
    {children}
  </div>
);

export const PanelSection = ({ children }: any) => (
  <div className="px-4 py-4 border-b border-[#dfe3eb] last:border-b-0">
    {children}
  </div>
);

export const PanelBody = ({ children }: any) => (
  <div className="px-4 py-4">
    {children}
  </div>
);

export const PanelFooter = ({ children }: any) => (
  <div className="px-4 py-3 bg-[#f5f8fa] border-t border-[#dfe3eb] flex justify-end gap-2">
    {children}
  </div>
);

export const Tile = ({ children, padding = 'medium' }: any) => (
  <div 
    className="bg-white rounded border border-[#dfe3eb] mb-4"
    style={{ padding: padding === 'small' ? '0.5rem' : padding === 'medium' ? '1rem' : '2rem' }}
  >
    {children}
  </div>
);

// Tables

export const Table = ({ children }: any) => (
  <div className="border border-[#dfe3eb] rounded-sm overflow-hidden">
    <table className="w-full border-collapse text-sm text-[#33475b]">{children}</table>
  </div>
);
export const TableHead = ({ children }: any) => <thead className="bg-[#f5f8fa] border-b border-[#dfe3eb]">{children}</thead>;
export const TableBody = ({ children }: any) => <tbody>{children}</tbody>;
export const TableRow = ({ children }: any) => <tr className="border-b border-[#dfe3eb] last:border-b-0 hover:bg-[#f5f8fa]">{children}</tr>;
export const TableHeader = ({ children, width }: any) => (
  <th className="text-left px-4 py-3 font-semibold text-[#516f90]" style={{width}}>{children}</th>
);
export const TableCell = ({ children }: any) => <td className="px-4 py-3 align-middle">{children}</td>;


// Visuals

export const StatusTag = ({ children, variant }: any) => {
  const variants: any = {
    success: "bg-[#e5f5f6] text-[#00a4bd] border-[#99d7e1]",
    warning: "bg-[#fff8e5] text-[#b26200] border-[#ffe099]",
    danger: "bg-[#fbeaea] text-[#d9252c] border-[#f5a1a5]",
    info: "bg-[#e5f3ff] text-[#007a8c] border-[#99d3ff]",
    neutral: "bg-[#f5f8fa] text-[#516f90] border-[#dfe3eb]"
  };
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${variants[variant] || variants.neutral}`}>
      {children}
    </span>
  );
};

export const Illustration = ({ name, size = 'md' }: any) => {
  // Simple placeholder for HubSpot illustrations
  return (
    <div className={`flex flex-col items-center justify-center p-4 text-[#cbd6e2] ${size === 'sm' ? 'h-16' : size === 'lg' ? 'h-48' : 'h-32'}`}>
      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className="text-xs uppercase tracking-wide font-medium">{name}</span>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex justify-center p-4">
    <div className="animate-spin h-6 w-6 border-2 border-[#ff7a59] border-t-transparent rounded-full" />
  </div>
);

export const StepIndicator = ({ currentStep, steps }: any) => (
  <div className="flex justify-between mb-8 max-w-2xl mx-auto px-4">
    {steps.map((step: any, index: number) => {
      const isComplete = index < currentStep;
      const isCurrent = index === currentStep;
      
      return (
        <div key={index} className={`flex flex-col items-center relative z-10 w-full`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
            isComplete ? 'bg-[#ff7a59] text-white border-2 border-[#ff7a59]' : 
            isCurrent ? 'bg-white text-[#ff7a59] border-2 border-[#ff7a59]' : 
            'bg-white text-[#cbd6e2] border-2 border-[#cbd6e2]'
          }`}>
            {isComplete ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </div>
          <span className={`text-xs font-medium ${isCurrent ? 'text-[#33475b]' : 'text-[#516f90]'}`}>
            {step.title}
          </span>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-10 ${
              index < currentStep ? 'bg-[#ff7a59]' : 'bg-[#cbd6e2]'
            }`} />
          )}
        </div>
      );
    })}
  </div>
);

// Modal / Sheet
export const Sheet = ({ children, title, onClose, isOpen, footer }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dfe3eb] bg-[#f5f8fa]">
          <h2 className="text-lg font-bold text-[#33475b]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-[#516f90] hover:text-[#33475b] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
            <div className="px-6 py-4 border-t border-[#dfe3eb] bg-[#f5f8fa]">
                {footer}
            </div>
        )}
      </div>
    </div>
  );
};

// Toggle Component (HubSpot standard)
export const Toggle = ({ checked, onChange, label, description, name }: any) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex-1">
      {label && <div className="text-sm font-medium text-[#33475b]">{label}</div>}
      {description && <div className="text-xs text-[#516f90]">{description}</div>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00a4bd] focus:ring-offset-2 ${
        checked ? 'bg-[#ff7a59]' : 'bg-[#cbd6e2]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

// ToggleGroup Component (HubSpot standard)
export const ToggleGroup = ({ children, name, value, onChange, options, inline = false }: any) => {
  if (options) {
    return (
      <div className={`flex ${inline ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
        {options.map((opt: any) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="w-4 h-4 text-[#ff7a59] border-[#cbd6e2] focus:ring-[#ff7a59]"
            />
            <span className="text-sm text-[#33475b]">{opt.label}</span>
          </label>
        ))}
      </div>
    );
  }
  return <div className={`flex ${inline ? 'flex-row gap-4' : 'flex-col gap-2'}`}>{children}</div>;
};

// Alert Component (HubSpot standard)
export const Alert = ({ title, children, type = 'info' }: any) => {
  const types: any = {
    info: {
      bg: 'bg-[#e5f3ff]',
      border: 'border-[#99d3ff]',
      title: 'text-[#007a8c]',
      text: 'text-[#007a8c]',
    },
    warning: {
      bg: 'bg-[#fff8e5]',
      border: 'border-[#ffe099]',
      title: 'text-[#b26200]',
      text: 'text-[#8b4d00]',
    },
    success: {
      bg: 'bg-[#e5f5f6]',
      border: 'border-[#99d7e1]',
      title: 'text-[#00756a]',
      text: 'text-[#00756a]',
    },
    danger: {
      bg: 'bg-[#fbeaea]',
      border: 'border-[#f5a1a5]',
      title: 'text-[#d9252c]',
      text: 'text-[#a31b21]',
    },
  };

  const style = types[type] || types.info;

  return (
    <div className={`${style.bg} border ${style.border} rounded-md p-4 mb-4`}>
      {title && <div className={`font-semibold ${style.title} mb-1`}>{title}</div>}
      <div className={`text-sm ${style.text}`}>{children}</div>
    </div>
  );
};

// Form hooks
export const useForm = () => {
  return {
    control: {},
    handleSubmit: (fn: any) => (e: any) => { e?.preventDefault?.(); fn(); },
    formState: { errors: {} }
  };
};

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string | React.ReactNode;
  subtitle?: string;
  badge?: string;
}

interface SearchableSelectProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  allowCustom?: boolean;
  customPlaceholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  disabledPlaceholder = 'Select previous field first...',
  allowCustom = false,
  customPlaceholder = 'Type custom value...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (val: string) => {
    setIsCustomMode(false);
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsCustomMode(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-slate-300">
          {label} {required && <span className="text-emerald-400">*</span>}
        </label>
        {allowCustom && !disabled && (
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              setIsOpen(false);
            }}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            {isCustomMode ? '← Pick from list' : '+ Enter custom'}
          </button>
        )}
      </div>

      {isCustomMode ? (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={customPlaceholder}
            className="w-full bg-[#0d171a] border border-emerald-500/50 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      ) : (
        <div>
          {/* Main Trigger Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between bg-[#0d171a] border rounded-xl px-3.5 py-2 text-left text-sm transition-all ${
              disabled
                ? 'border-[#1e333a]/50 text-slate-500 bg-[#080e10] cursor-not-allowed opacity-60'
                : isOpen
                ? 'border-emerald-500 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-slate-100'
                : 'border-[#1e333a] hover:border-[#2d4d57] text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {disabled ? (
                <span className="text-slate-500 text-xs italic">{disabledPlaceholder}</span>
              ) : selectedOption ? (
                <>
                  {selectedOption.icon && (
                    <span className="text-base leading-none flex-shrink-0">
                      {selectedOption.icon}
                    </span>
                  )}
                  <span className="font-medium text-slate-100 truncate">
                    {selectedOption.label}
                  </span>
                  {selectedOption.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-mono">
                      {selectedOption.badge}
                    </span>
                  )}
                </>
              ) : value ? (
                <span className="font-medium text-slate-100 truncate">{value}</span>
              ) : (
                <span className="text-slate-500 text-sm">{placeholder}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              {value && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onChange('');
                      setIsCustomMode(false);
                    }
                  }}
                  className="p-1 rounded-md hover:bg-[#1a2d33] text-slate-400 hover:text-slate-200 transition-colors"
                  title="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </div>
          </button>

          {/* Floating Dropdown Menu */}
          {isOpen && (
            <div className="absolute z-50 mt-1.5 w-full bg-[#0b1417] border border-[#1e333a] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {/* Search Bar within dropdown */}
              <div className="p-2 border-b border-[#182a30] bg-[#070c0e]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or filter..."
                    className="w-full bg-[#111d21] border border-[#1c353d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                            : 'text-slate-300 hover:bg-[#132227] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {opt.icon && (
                            <span className="text-base flex-shrink-0 leading-none">
                              {opt.icon}
                            </span>
                          )}
                          <div className="truncate">
                            <div className="font-medium truncate">{opt.label}</div>
                            {opt.subtitle && (
                              <div className="text-[10px] text-slate-400 truncate">
                                {opt.subtitle}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {opt.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#16272c] text-slate-400 border border-[#203941]">
                              {opt.badge}
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-xs text-slate-400">No matching results found.</p>
                    {allowCustom && searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange(searchQuery);
                          setIsOpen(false);
                        }}
                        className="mt-2 text-xs text-emerald-400 hover:underline font-medium"
                      >
                        Use "{searchQuery}" as custom value
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface SelectProps<T extends string> {
  label: string;
  showLabel?: boolean;
  value: T | "";
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  error?: string;
  id?: string;
}

export function Select<T extends string>({
  label,
  showLabel = false,
  value,
  onChange,
  options,
  placeholder,
  error,
  id,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!open) return;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setOpen(false);
      }
    }
    
    function handleScroll(e: Event) {
      // Don't close if scrolling inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setOpen(false);
    }

    function handleResize() {
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") setOpen(false);
    else if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const selected = options.find((option) => option.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={selectId}
        className={
          showLabel
            ? "mb-1.5 block text-sm font-medium text-foreground"
            : "sr-only"
        }
      >
        {label}
      </label>

      <button
        type="button"
        id={selectId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-3 border bg-input px-4 py-3 text-left text-sm outline-none focus:border-brand ${
          error ? "border-red-500" : "border-border"
        }`}
      >
        {SelectedIcon && (
          <SelectedIcon className="size-5 shrink-0 text-icon-muted" />
        )}
        <span
          className={`flex-1 truncate ${
            selected ? "text-foreground" : "text-placeholder"
          }`}
        >
          {selected?.label ?? placeholder ?? label}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-icon-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && typeof document !== "undefined" &&
        createPortal(
          <ul
            ref={dropdownRef}
            role="listbox"
            style={dropdownStyle}
            className="fixed z-[9999] mt-1 max-h-64 overflow-y-auto border border-border bg-surface py-1 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm hover:bg-border/40 ${
                      option.value === value
                        ? "font-semibold text-brand"
                        : "text-foreground"
                    }`}
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.value === value && (
                      <Check className="size-4 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )}

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

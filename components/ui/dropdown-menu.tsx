"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({ trigger, children, align = "right", className = "w-48" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, bottom: 0, spaceBelow: 0, windowWidth: 0 });

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        right: window.innerWidth - rect.right,
        bottom: window.innerHeight - rect.top,
        spaceBelow: window.innerHeight - rect.bottom,
        windowWidth: window.innerWidth,
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInsideContainer = containerRef.current?.contains(target);
      const clickedInsideDropdown = dropdownRef.current?.contains(target);
      
      if (!clickedInsideContainer && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const [dropdownWidth, setDropdownWidth] = useState(0);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setDropdownWidth(dropdownRef.current.offsetWidth);
    } else {
      setDropdownWidth(0);
    }
  }, [isOpen, coords.windowWidth]);

  const clampedRight = dropdownWidth > 0 
    ? Math.max(16, Math.min(coords.right, coords.windowWidth - dropdownWidth - 16))
    : Math.max(16, coords.right);

  const clampedLeft = dropdownWidth > 0
    ? Math.max(16, Math.min(coords.left, coords.windowWidth - dropdownWidth - 16))
    : Math.max(16, coords.left);

  const dropdownMenu = isOpen && typeof document !== "undefined" ? (
    createPortal(
      <div
        ref={dropdownRef}
        className={`fixed z-[100] rounded-md bg-surface border border-border shadow-lg animate-in fade-in zoom-in-95 duration-100 ${className} ${
          align === "right" ? "origin-top-right" : "origin-top-left"
        }`}
        style={{
          maxWidth: "calc(100vw - 32px)",
          ...(coords.spaceBelow < 150 
            ? { bottom: coords.bottom + 8 } 
            : { top: coords.top + 8 }),
          ...(align === "right" 
            ? { right: clampedRight } 
            : { left: clampedLeft }),
        }}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement<{ onClick?: (e: React.MouseEvent) => void }>(
                child
              )
            ) {
              return React.cloneElement(child, {
                onClick: (e: React.MouseEvent) => {
                  child.props.onClick?.(e);
                  setIsOpen(false);
                },
              });
            }
            return child;
          })}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <div className="relative inline-block text-left" ref={containerRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="cursor-pointer inline-flex items-center justify-center"
        >
          {trigger}
        </div>
      </div>
      {dropdownMenu}
    </>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function DropdownMenuItem({ children, onClick, icon, className = "" }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center px-4 py-2 text-sm text-foreground transition-colors hover:bg-border/50 hover:text-brand ${className}`}
      role="menuitem"
    >
      {icon && <span className="mr-2 text-icon-muted">{icon}</span>}
      {children}
    </button>
  );
}

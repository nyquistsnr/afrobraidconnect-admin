import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "primary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon" | string;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-brand text-brand-foreground hover:bg-brand-hover",
  primary: "bg-brand text-brand-foreground hover:bg-brand-hover",
  outline:
    "border border-border bg-input text-foreground hover:bg-border/40",
  ghost: "text-foreground hover:bg-border/40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "primary", size, className = "", ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'default', ...props }) => {
  const baseStyles = "px-4 py-2 rounded";
  const variantStyles = variant === 'outline'
    ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
    : "bg-blue-600 text-white";

  return (
    <button {...props} className={`${baseStyles} ${variantStyles} ${props.className || ''}`.trim()}>
      {children}
    </button>
  );
};
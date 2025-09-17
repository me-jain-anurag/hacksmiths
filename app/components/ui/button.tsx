import React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'default', className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded";
  const variantStyles = variant === 'outline'
    ? "border border-gray-300 bg-transparent hover:bg-gray-100"
    : "bg-blue-600 text-white";

  return (
    <button {...props} className={`${baseStyles} ${variantStyles} ${className || ''}`.trim()}>
      {children}
    </button>
  );
};
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    
    const Comp = asChild ? Slot : "button";

    // Government-style button with clear, accessible design
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border";

    const variantStyles: Record<string, string> = {
      default: "bg-blue-700 text-white border-blue-700 hover:bg-blue-800 hover:border-blue-800",
      secondary: "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200 hover:border-gray-400",
      outline: "bg-white text-blue-700 border-blue-700 hover:bg-blue-50",
      ghost: "bg-transparent text-gray-700 border-transparent hover:bg-gray-100 hover:text-gray-900",
      destructive: "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700",
    };

    const sizeStyles: Record<string, string> = {
      sm: "h-8 px-3 text-sm rounded",
      md: "h-10 px-4 text-sm rounded",
      lg: "h-12 px-6 text-base rounded",
    };

    return (
      <Comp
        className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || ''} ${className || ''}`.trim()}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
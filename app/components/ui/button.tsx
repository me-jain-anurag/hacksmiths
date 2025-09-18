import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', asChild = false, ...props }, ref) => {
    
    const Comp = asChild ? Slot : "button";

    // Define base styles and styles for each variant
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variantStyles = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-input bg-transparent hover:bg-gray-100",
    };

    return (
      <Comp
        className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`.trim()}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
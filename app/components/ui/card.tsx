import React from "react";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}
export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`border rounded shadow p-4 bg-white ${className || ""}`.trim()}>{children}</div>
);

export const CardHeader: React.FC<{ children: ReactNode, className?: string }> = ({ children, className }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`.trim()}>{children}</div>
);

export const CardTitle: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-xl font-semibold mb-1">{children}</div>
);

export const CardContent: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

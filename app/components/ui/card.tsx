"use client";

import React from "react";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ""}`.trim()}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={`flex flex-col space-y-1.5 p-6 ${className || ''}`.trim()}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className, ...props }) => (
  <h3
    className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`.trim()}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<CardProps> = ({ children, className, ...props }) => (
  <p
    className={`text-sm text-muted-foreground ${className || ''}`.trim()}
    {...props}
  >
    {children}
  </p>
);


export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={`p-6 pt-0 ${className || ''}`.trim()} {...props}>
    {children}
  </div>
);
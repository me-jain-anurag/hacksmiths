"use client";

import React from "react";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={`rounded border border-gray-300 bg-white text-gray-900 shadow-sm ${className || ""}`.trim()}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div
    className={`flex flex-col space-y-2 p-6 border-b border-gray-200 ${className || ''}`.trim()}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className, ...props }) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-normal text-gray-900 ${className || ''}`.trim()}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<CardProps> = ({ children, className, ...props }) => (
  <p
    className={`text-sm text-gray-600 ${className || ''}`.trim()}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => (
  <div className={`p-6 ${className || ''}`.trim()} {...props}>
    {children}
  </div>
);
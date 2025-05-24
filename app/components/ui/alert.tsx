import * as React from "react";

export function Alert({ children, variant = "default", className = "" }: any) {
  const base =
    "rounded-md border px-4 py-3 text-sm " +
    (variant === "destructive"
      ? "border-red-500 bg-red-50 text-red-700"
      : "border-gray-200 bg-gray-50 text-gray-800");
  return <div className={`${base} ${className}`}>{children}</div>;
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
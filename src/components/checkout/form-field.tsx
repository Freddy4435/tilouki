"use client";

import { cloneElement, isValidElement, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

type FieldAriaProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

function enhanceFieldChild(child: ReactNode, id: string, error?: string): ReactNode {
  if (!isValidElement<FieldAriaProps>(child)) return child;

  const errorId = `${id}-error`;
  const describedBy = [child.props["aria-describedby"], error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return cloneElement(child, {
    "aria-invalid": Boolean(error) || child.props["aria-invalid"],
    "aria-describedby": describedBy || undefined,
  });
}

export function FormField({ id, label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {enhanceFieldChild(children, id, error)}
      {error ? (
        <p id={`${id}-error`} className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

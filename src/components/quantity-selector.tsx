"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({ value, onChange, min = 1, max = 99, className }: QuantitySelectorProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-card",
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={!canDecrement}
        onClick={() => onChange(value - 1)}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Minus size={15} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label="Quantity"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          if (!Number.isNaN(parsed)) onChange(Math.min(max, Math.max(min, parsed)));
        }}
        className="h-10 w-12 border-x border-border bg-transparent text-center text-sm outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={!canIncrement}
        onClick={() => onChange(value + 1)}
        className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
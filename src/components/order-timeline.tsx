import { Check, PackageCheck, PackageOpen, Truck, X } from "lucide-react";
import type { OrderStatus } from "@/types";
import { cn } from "@/lib/utils";

const steps: Array<{ key: OrderStatus; label: string }> = [
  { key: "pending", label: "Order Placed" },
  { key: "payment_confirmed", label: "Payment Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "ready_for_delivery", label: "Ready for Delivery" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

const icons: Record<string, React.ReactNode> = {
  pending: <PackageOpen size={16} strokeWidth={1.5} />,
  payment_confirmed: <Check size={16} strokeWidth={2} />,
  processing: <PackageCheck size={16} strokeWidth={1.5} />,
  ready_for_delivery: <PackageCheck size={16} strokeWidth={1.5} />,
  out_for_delivery: <Truck size={16} strokeWidth={1.5} />,
  delivered: <Check size={16} strokeWidth={2} />,
};

function indexOf(status: OrderStatus): number {
  return steps.findIndex((s) => s.key === status);
}

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-sm border border-red-200 bg-red-50 p-4 text-sm">
        <X size={18} className="text-red-600" />
        <div>
          <p className="font-medium text-red-800">This order was cancelled</p>
          <p className="text-red-600/80">Contact us on WhatsApp if you have any questions.</p>
        </div>
      </div>
    );
  }

  const current = indexOf(status);
  const max = steps.length - 1;

  return (
    <div className="relative">
      <div className="absolute left-[17px] top-6 h-[calc(100%-1.5rem)] w-px bg-border sm:left-0 sm:top-[17px] sm:h-px sm:w-full" />
      <ol className="space-y-5 sm:flex sm:space-x-0 sm:space-y-0">
        {steps.map((step, index) => {
          const done = index <= current;
          const isCurrent = index === current;
          return (
            <li key={step.key} className="relative flex shrink-0 items-start gap-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-3">
              <div className="relative z-10">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    done
                      ? "border-champagne bg-champagne text-charcoal-deep"
                      : "border-border bg-card text-muted-foreground",
                    isCurrent && "ring-4 ring-champagne/25"
                  )}
                  aria-hidden
                >
                  {icons[step.key]}
                </span>
              </div>
              <div className="sm:mt-0 sm:text-center">
                <p className={cn("text-sm font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                {index === current && current < max && (
                  <p className="text-xs text-champagne-deep">In progress</p>
                )}
                {index === max && status === "delivered" && (
                  <p className="text-xs text-champagne-deep">Enjoy your fragrance!</p>
                )}
                {index < current && <span className="sr-only">Completed</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
"use client";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitives.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border border-line bg-bg-s2 transition-colors",
        "data-[state=checked]:border-accent-cyan data-[state=checked]:bg-accent-cyan/20",
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb className="pointer-events-none block h-3 w-3 translate-x-1 bg-ink-lo transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-accent-cyan" />
    </SwitchPrimitives.Root>
  );
});

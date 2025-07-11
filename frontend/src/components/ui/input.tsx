import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full px-0 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90 focus:ring-0 text-sm placeholder-white/80",
        className
      )}
      {...props}
    />
  );
}

export { Input };
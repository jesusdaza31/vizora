"use client"

import * as React from "react"
import { Checkbox } from "@base-ui/react/checkbox"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

function CheckboxComponent({ className, ...props }: React.ComponentProps<typeof Checkbox.Root>) {
  return (
    <Checkbox.Root
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary data-[checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <Checkbox.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className="h-3 w-3" />
      </Checkbox.Indicator>
    </Checkbox.Root>
  )
}

export { CheckboxComponent as Checkbox }

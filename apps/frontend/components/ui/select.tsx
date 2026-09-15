"use client"

import * as React from "react"
import { Select } from "@base-ui/react/select"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof Select.Trigger>) {
  return (
    <Select.Trigger
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <Select.Icon className="h-4 w-4 opacity-50">
        <ChevronDown />
      </Select.Icon>
    </Select.Trigger>
  )
}

function SelectContent({ className, children, ...props }: React.ComponentProps<typeof Select.Popup>) {
  return (
    <Select.Portal>
      <Select.Positioner sideOffset={4}>
        <Select.Popup
          className={cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
            className
          )}
          {...props}
        >
          {children}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof Select.Item>) {
  return (
    <Select.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <Select.ItemIndicator>
          <Check className="h-4 w-4" />
        </Select.ItemIndicator>
      </span>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
}

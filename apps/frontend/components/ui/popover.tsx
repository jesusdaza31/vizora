"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"
import { cn } from "@/lib/utils"

type PopoverContentProps = Omit<React.ComponentProps<typeof Popover.Popup>, 'align'> & {
  align?: "start" | "center" | "end"
}

function PopoverContent({ className, children, align = "center", ...props }: PopoverContentProps) {
  return (
    <Popover.Portal>
      <Popover.Positioner align={align} sideOffset={4}>
        <Popover.Popup
          className={cn(
            "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            className
          )}
          {...props}
        />
      </Popover.Positioner>
    </Popover.Portal>
  )
}

export { Popover, PopoverContent }

"use client"

import * as React from "react"
import { Slider } from "@base-ui/react/slider"
import { cn } from "@/lib/utils"

type SliderProps = Omit<React.ComponentProps<typeof Slider.Root>, 'className'> & {
  className?: string
}

function SliderComponent({ className, children, ...props }: SliderProps) {
  return (
    <Slider.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <Slider.Control className="flex w-full items-center">
        <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <Slider.Indicator className="absolute h-full bg-primary" />
        </Slider.Track>
        <Slider.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </Slider.Control>
      {children}
    </Slider.Root>
  )
}

export { SliderComponent as Slider }

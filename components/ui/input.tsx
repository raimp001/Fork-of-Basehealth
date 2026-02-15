import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Prevent autofill yellow background - multiple approaches
          "[&:-webkit-autofill]:!bg-background [&:-webkit-autofill]:!text-foreground [&:-webkit-autofill]:!shadow-[0_0_0_1000px_hsl(var(--background))_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:!border-input",
          "[&:-webkit-autofill:hover]:!bg-background [&:-webkit-autofill:hover]:!shadow-[0_0_0_1000px_hsl(var(--background))_inset]",
          "[&:-webkit-autofill:focus]:!bg-background [&:-webkit-autofill:focus]:!shadow-[0_0_0_1000px_hsl(var(--background))_inset]",
          "[&:-webkit-autofill:active]:!bg-background [&:-webkit-autofill:active]:!shadow-[0_0_0_1000px_hsl(var(--background))_inset]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

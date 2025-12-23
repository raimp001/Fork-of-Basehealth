import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-stone-600 placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Prevent autofill yellow background - multiple approaches
          "[&:-webkit-autofill]:!bg-white [&:-webkit-autofill]:!text-foreground [&:-webkit-autofill]:!shadow-[0_0_0_1000px_white_inset] [&:-webkit-autofill]:![-webkit-text-fill-color:rgb(23,23,23)] [&:-webkit-autofill]:!border-stone-300",
          "[&:-webkit-autofill:hover]:!bg-white [&:-webkit-autofill:hover]:!shadow-[0_0_0_1000px_white_inset]",
          "[&:-webkit-autofill:focus]:!bg-white [&:-webkit-autofill:focus]:!shadow-[0_0_0_1000px_white_inset]",
          "[&:-webkit-autofill:active]:!bg-white [&:-webkit-autofill:active]:!shadow-[0_0_0_1000px_white_inset]",
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

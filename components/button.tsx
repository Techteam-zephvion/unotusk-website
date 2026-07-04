import { cn } from "@/lib/utils"
import React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "default"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[#A07C4A] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variant === "outline" && "border border-white/10 hover:border-[#A07C4A]/40 bg-transparent hover:bg-white/5 text-[#CBC1B5] h-9 w-9 p-0",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

export function LoaderButton({
  children,
  isLoading,
  hideChildrenWhileLoading,
  className,
  ...props
}: ButtonProps & { isLoading: boolean; hideChildrenWhileLoading?: boolean }) {
  return (
    <Button
      disabled={isLoading}
      type="submit"
      {...props}
      className={cn("flex justify-center gap-2 px-3", className)}
    >
      {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
      {hideChildrenWhileLoading ? !isLoading && children : children}
    </Button>
  )
}

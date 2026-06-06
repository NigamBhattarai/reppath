
import { cn } from "@/lib/utils/cn"

type CardProps = {
    children: React.ReactNode,
    className?: string,
    variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success',
    opacity?: number
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'bg-surface border border-border rounded-lg w-full p-5 break-words',
      className
    )}>
      {children}
    </div>
  );
}
import { cn } from "@/lib/utils/cn"

type BadgeProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
  className?: string,
  children: React.ReactNode
}
const variantClasses = {
    primary: 'bg-primary text-text-primary',
    secondary: 'bg-secondary text-secondary-text',
    danger: 'bg-danger text-text-primary',
    warning: 'bg-warning text-text-primary',
    success: 'bg-success text-text-primary'
};

export default function Badge({variant="primary", className, children, ...props}: BadgeProps) {
    return (
        <span className={cn(
            'rounded-2xl w-fit py-2 px-5 cursor-default select-none',
            variantClasses[variant],
            className)}
            {...props}
            >
            {children}
        </span>
    );
}
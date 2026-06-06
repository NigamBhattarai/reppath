import { cn } from "@/lib/utils/cn"
import { ClipLoader } from "react-spinners"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  className?: string
}
const variantClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-text-primary',
    secondary: 'bg-secondary hover:bg-secondary-hover text-secondary-text',
    danger: 'bg-danger hover:bg-danger-hover text-text-primary',
    warning: 'bg-warning hover:bg-warning-hover text-text-primary',
    success: 'bg-success hover:bg-success-hover text-text-primary'
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
};    

const loaderSizes = {
    sm: 16,
    md: 20,
    lg: 24
}

export default function Button({variant="primary", size="sm", className, disabled, isLoading, children, ...props}: ButtonProps) {
    return (
        <button className={cn(
            'font-semibold rounded-md border border-border cursor-pointer transition-colors duration-150 flex items-center justify-center',
            variantClasses[variant],
            sizeClasses[size],
            (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
            className)}
            disabled={disabled || isLoading}
            {...props}
            >
            {isLoading?<ClipLoader color="white" size={loaderSizes[size]} />:children}
        </button>
    );
}
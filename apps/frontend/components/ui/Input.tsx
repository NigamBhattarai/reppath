
import { cn } from "@/lib/utils/cn"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string,
    error?: string,
}

export default function Input({label, error, className, ...props}: InputProps) {
    return (
        <div className="px-2 py-2 mt-3 relative ">
            <div>
                <input className={cn(
                    'peer w-full p-2 border-0 border-b-3 bg-transparent border-border-subtle',
                    'text-text-primary placeholder-transparent',
                    'focus:border-primary focus:outline-none',
                    'autofill:shadow-[0_0_0_1000px_#1e293b_inset]',
                    'autofill:[-webkit-text-fill-color:#f8fafc]',
                     error && 'border-danger',
                     className
                     )} placeholder="johndoe@example.com" {...props}/>
                <span className={cn(
                    'absolute left-2 transition-all duration-200 pointer-events-none',
                    'text-text-secondary text-sm top-2',
                    'peer-focus:-top-4 peer-focus:text-xs peer-focus:text-primary',
                    'peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm',
                    'peer-[&:not(:placeholder-shown)]:-top-4',
                    'peer-[&:not(:placeholder-shown)]:text-xs',
                    error && 'text-danger'
                    )}>{label}</span>
            </div>
            {error && <span className="text-danger text-xs mt-1 block">{error}</span>}
        </div>
    );
}
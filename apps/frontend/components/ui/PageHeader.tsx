import { cn } from "@/lib/utils/cn"

type PageHeaderProps = {
    title: string,
    description?: string,
    className?: string
}

export default function PageHeader({title, description, className}: PageHeaderProps) {
    return (
        <span className={cn(
            'w-full py-2 px-5 cursor-default select-none flex flex-col', className)}
            >
                <span className="text-3xl font-bold w-full border-b py-4">{title}</span>
                <span className="text-lg pl-2 py-3 text-center">{description}</span>
        </span>
    );
}
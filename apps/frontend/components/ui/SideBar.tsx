import { cn } from "@/lib/utils/cn";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { IconType } from "react-icons/lib";
import { PiSidebarBold, PiSidebarLight } from "react-icons/pi";

type SidebarMenuOptions = {Icon: IconType, name: string, link: string};

export default function SideBar({options, className}: {options: SidebarMenuOptions[], className?: string}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    
    return (
        <div className={cn('w-64 flex flex-col h-full bg- bg-background transition-all', sidebarCollapsed && 'w-16', className)}>
            <div className="w-full h-fit">
                <div className="w-fit text-2xl p-1 m-3 border border-border rounded cursor-pointer float-right transition-colors transition-75 hover:bg-border hover:border-border-subtle" onClick={()=>setSidebarCollapsed(!sidebarCollapsed)}>{sidebarCollapsed ? <PiSidebarBold/> : <PiSidebarLight/> }</div>
            </div>
            {options.map(({Icon, name, link}) => 
                <div className={cn(
                        'flex flex-row gap-4 w-full cursor-pointer py-4 items-center justify-center transition-colors duration-75 border-b border-b-border/30 hover:bg-border/50',
                        (pathname === link || pathname.startsWith(link + '/')) && 'bg-border/50 hover:bg-border')}
                    onClick={()=>router.push(link)}>
                        <Icon className={cn(sidebarCollapsed && 'text-3xl')}/>
                        {!sidebarCollapsed && name}
                </div>
            )}
        </div>
    );
}
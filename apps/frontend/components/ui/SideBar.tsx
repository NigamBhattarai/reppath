import useCurrentUser from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils/cn";
import { clearAuthCookie } from "@/lib/utils/cookies";
import { useApolloClient } from "@apollo/client/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GiCog, GiExitDoor } from "react-icons/gi";
import { IconType } from "react-icons/lib";
import { PiSidebarBold, PiSidebarLight } from "react-icons/pi";
import { toast } from "react-toastify";
import { TfiAlignLeft } from "react-icons/tfi";
import { LiaTimesSolid } from "react-icons/lia";

type SidebarMenuOptions = {Icon: IconType, name: string, link: string};

export default function SideBar({options, className}: {options: SidebarMenuOptions[], className?: string}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarHidden, setSidebarHidden] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const user = useCurrentUser();
    const client = useApolloClient();

    const handleLogout = async () => {
        clearAuthCookie();
        await client.clearStore();
        toast.success("Logged Out", {
            position: 'top-center',
            hideProgressBar:true
        });
        router.push('/login');
    }


    return (
        <div>
            <div className={cn('hidden lg:hidden absolute left-0 top-0 w-screen h-screen bg-black/70 backdrop-blur-md', !sidebarHidden && 'block')} onClick={()=>{setSidebarHidden(true)}}/>
            <div className={cn(
                "z-1 flex gap-3 items-center lg:hidden p-3 bg-border absolute bottom-3 left-3 border border-border-subtle rounded-4xl cursor-pointer hover:bg-border/40 active:bg-border transition-all",
                !sidebarHidden && 'transform translate-x-[calc(100vw-100%-1.5rem)]'
            )}
                onClick={()=>{setSidebarHidden(!sidebarHidden);setSidebarCollapsed(false);}}
            >
                {sidebarHidden ? <TfiAlignLeft/> : <LiaTimesSolid/>} Menu
            </div>
            <div className={cn(
                'w-0 absolute lg:static flex lg:w-64 overflow-hidden flex-col h-full bg- bg-background transition-all',
                !sidebarHidden && 'w-64',
                sidebarCollapsed && 'lg:w-16', className)}>
                <div className="w-full h-fit flex flex-row gap-3 items-center p-1">
                    {!sidebarCollapsed && <div className="w-40 h-fit cursor-pointer" onClick={()=>router.push("/")}><img src={'/logo-only.png'}/></div>}
                    {!sidebarCollapsed && <div className="cursor-pointer pt-2 px-2" onClick={()=>router.push("/")}><img src={'/logo-text-only-white-text.png'}/></div>}
                    <button className="hidden lg:block w-fit text-2xl p-1 m-3 border border-border rounded cursor-pointer float-right transition-colors transition-75 hover:bg-border hover:border-border-subtle active:bg-border/50"
                    onClick={()=>setSidebarCollapsed(!sidebarCollapsed)}>
                        {sidebarCollapsed ? <PiSidebarBold/> : <PiSidebarLight/> }
                    </button>
                </div>
                {options.map(({Icon, name, link}) => 
                    <div className={cn(
                            'flex flex-row gap-4 w-full cursor-pointer py-4 items-center justify-center transition-colors duration-75 border-b border-b-border/30 hover:bg-border/50 active:bg-border/70',
                            (pathname === link || pathname.startsWith(link + '/')) && 'bg-border/50 hover:bg-border')}
                        onClick={()=>router.push(link)}>
                            <Icon className={cn('transition-all',sidebarCollapsed && 'text-3xl')}/>
                            {!sidebarCollapsed && name}
                    </div>
                )}
                <div className=" mt-auto mb-10">
                    <div className="flex flex-row w-full py-2 h-fit select-none pl-2 items-center">
                        {!sidebarCollapsed && <span className="flex-3">{user?.user?.name}</span>}
                        <span className="flex-1 py-3 mx-2 cursor-pointer bg-border/10 hover:bg-border rounded-xl transition-colors active:bg-border/50" ><GiCog className="mx-auto"/></span>
                    </div>
                    <div className="flex flex-row w-full py-2 h-fit select-none pl-2 items-center cursor-pointer text-danger bg-danger/10 hover:bg-danger/50 hover:text-secondary active:bg-danger/70" onClick={handleLogout}>
                        {!sidebarCollapsed && <span className="flex-3">Logout</span>}
                        <span className="flex-1 py-3 mx-2 rounded-xl transition-colors"><GiExitDoor className="mx-auto"/></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';
import useCurrentUser from "@/hooks/useCurrentUser";
import { clearAuthCookie } from "@/lib/utils/cookies";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { PiHouse, PiPower, PiUser } from "react-icons/pi";
import { CgGym } from "react-icons/cg";
import { toast } from "react-toastify";
import SideBar from "@/components/ui/SideBar";

export default function CoachLayout({
    children
}: Readonly<{
  children: React.ReactNode;
}> ) {
    const router = useRouter();

    return (
        <div className="h-screen">
            {/* Top Bar */}
            <div className="flex flex-row gap-0 w-full h-full">
                <SideBar className="border-r border-t border-border" options={[
                    {Icon: PiHouse, name: "Dashboard", link: '/coach/dashboard'},
                    {Icon: PiUser, name: "Members", link: '/coach/members'},
                    {Icon: CgGym, name: "Programs", link: '/coach/programs'}
                ]}/>
                <div className="flex flex-col w-full">
                    <div className="w-full h-15 bg-surface flex flex-row-reverse gap-1">
                        <div className="flex-1 flex flex-row mx-2 my-1 cursor-pointer" onClick={()=>router.push("/")}>
                            <img src={'/logo-only.png'}/>
                            <div className="flex mx-5 my-auto w-30 h-fit "><img src={'/logo-text-only-white-text.png'}/></div>
                        </div>
                    </div>
                    <div className="flex-9 h-full overflow-y-auto scrollbar-thin m-4 p-6 border border-border rounded-2xl">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
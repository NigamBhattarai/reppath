'use client';

import SideBar from "@/components/ui/SideBar";
import useCurrentUser from "@/hooks/useCurrentUser";
import { CgGym } from "react-icons/cg";
import { PiHouse, PiPower } from "react-icons/pi";
import { GiProgression } from "react-icons/gi";
import { clearAuthCookie } from "@/lib/utils/cookies";
import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function MemberLayout({
    children
}: Readonly<{
  children: React.ReactNode;
}> ) {
    const client = useApolloClient();
    const router = useRouter();
    const user = useCurrentUser();
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
        <div className="h-screen">
            {/* Top Bar */}
            <div className="w-full h-15 bg-surface sticky flex flex-row-reverse gap-1">
                <span className="my-auto mx-2 p-2 rounded cursor-pointer hover:bg-secondary/10 transition-colors" title="Logout" onClick={handleLogout}>
                    <PiPower/>
                </span>
                <div className="my-auto">Hello, {user?.user?.name}</div>
                <div className="flex-1 flex flex-row mx-2 my-1 cursor-pointer" onClick={()=>router.push("/")}>
                    <img src={'/logo-only.png'}/>
                    <div className="flex mx-5 my-auto w-30 h-fit "><img src={'/logo-text-only-white-text.png'}/></div>
                </div>
            </div>
            <div className="flex flex-row h-full">
                {/* Side Bar */}
                <SideBar options={[
                    {Icon: PiHouse, name: "Dashboard", link: '/'},
                    {Icon: CgGym, name: "Program", link: '/member/program'},
                    {Icon: GiProgression, name: "Progress", link: '/member/progress'}
                    
                ]}/>
                {/* Content Div */}
                <div className="flex-9 h-full overflow-y-auto scrollbar-thin">
                    {children}
                </div>
            </div>
        </div>
    );
}
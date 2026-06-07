'use client';

import SideBar from "@/components/ui/SideBar";
import { useRouter } from "next/navigation";
import { GiTeacher } from "react-icons/gi";
import { PiHouse, PiUser } from "react-icons/pi";

export default function OwnerLayout({
    children
}: Readonly<{
  children: React.ReactNode;
}> ) {
    const router = useRouter();
    return (
        <div className="h-screen">
            {/* Top Bar */}
            <div className="flex flex-row gap-0 w-full h-full">
                {/* Side Bar */}
                <SideBar options={[
                    {Icon: PiHouse, name: "Dashboard", link: '/owner/dashboard'},
                    {Icon: GiTeacher, name: "Coaches", link: '/owner/coaches'},
                    {Icon: PiUser, name: "Members", link: '/owner/members'}
                    
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
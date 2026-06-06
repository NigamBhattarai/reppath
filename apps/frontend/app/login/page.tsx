'use client';

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import { LOGIN_MUTATION } from "@/lib/graphql/mutations";
import { LoginResponse } from "@/lib/graphql/types";
import { setAuthCookie } from "@/lib/utils/cookies";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";


const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password Required"),
});
type FormFields = z.infer<typeof loginSchema>;


export default function LoginPage() {
    const [loginMutation] = useMutation<LoginResponse>(LOGIN_MUTATION);
    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting}
    } = useForm({
        resolver: zodResolver(loginSchema),
    });
    const router = useRouter();
    const onSubmit: SubmitHandler<FormFields> = async(data) => {
        try{
            const loginData = await loginMutation({variables: {input : {email: data.email, password: data.password}}});
            setAuthCookie(loginData.data?.login.token);
            const role = loginData.data?.login.user.role;
            router.push(`/${role}/dashboard`);
        } catch(err: any) {
            setError("root", {message: err.message} )
        }
    }
    return (
        <div className="h-screen flex justify-center items-center">
            <div className="w-100 self-center border border-border rounded p-5 pb-10">
                <PageHeader title="Login" className="text-center"/>
                <img src={'/logo.png'} className="border border-border-subtle/20 bg-border/20 rounded-[100%] mb-5 scale-75"/>
                <form method="post" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <Input{...register("email")} type="text" label="Email" error={errors?.email?.message}></Input>
                    <Input {...register("password")} type="password" label="Password" error={errors?.password?.message}></Input>
                    {errors?.root && <div className="text-red-600">{errors.root.message}</div>}
                    <Button className="w-full" disabled={isSubmitting} type="submit" isLoading={isSubmitting}>Login</Button>
                </form>
            </div>
        </div>
    );
}
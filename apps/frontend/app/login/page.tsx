'use client';

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
  password: z.string().min(1),
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
        <div>
            <form method="post" className="flex flex-row gap-2" onSubmit={handleSubmit(onSubmit)}>
                <input {...register("email")} type="text" placeholder="Email"></input>
                {errors?.email && <div className="text-red-600">{errors.email.message}</div>}
                <input {...register("password")} type="password" placeholder="Password"></input>
                {errors?.password && <div className="text-red-600">{errors.password.message}</div>}
                {errors?.root && <div className="text-red-600">{errors.root.message}</div>}
                
                <button disabled={isSubmitting} type="submit"> {isSubmitting? "Loading..." : "Login"} </button>
            </form>
        </div>
    );
}
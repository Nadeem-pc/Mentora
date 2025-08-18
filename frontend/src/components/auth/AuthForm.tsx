"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import FormField from "../shared/Formfield"
import { authFormSchema } from "@/schemas/authSchema"
import { useEffect, useState } from "react"
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { AuthService } from "@/services/authServices"


const AuthForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate()

    const [authState, setAuthState] = useState<'login' | 'register'>('login');
    const [role, setRole] = useState<string | null>(null);
    
    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
           setAuthState('register');
           setRole(storedRole);
        }
    }, []);

    
    const formSchema = authFormSchema(authState);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const { firstName, lastName, email, password } = values;

        try {
            if (authState === "login") {
                const response = await AuthService.login(email, password);
                if(response.success){
                    toast.success(response.message);
                    navigate('/', { replace: true });
                }else{
                    toast.error(response.message);
                }
            } else {
                if(firstName && lastName && role){
                    const response = await AuthService.register(firstName, lastName, email, password, role);
                    if(response.success){
                        toast.success(response.message);
                        navigate('/auth-layout/verify-otp', { state: email });
                    } else{
                        toast.error(response.message);
                    }
                }
            }
        } catch (error) {
            console.log(error);
            const errorMessage = error?.response?.data?.message;
            toast.error(errorMessage);
        }
    }


    return (
        <div className="space-y-6">
            {authState !== 'login' && (
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                    <ArrowLeft size={18} />
                    Back
                </button>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {authState === 'register' && (
                        <>
                            <div>
                                <FormField control={form.control} name="firstName" label="First Name" placeholder="First name" />
                            </div>

                            <div>
                                <FormField control={form.control} name="lastName" label="Last Name" placeholder="Last name" />
                            </div>
                        </>
                    )}

                    <div>
                        <FormField control={form.control} type="email" name="email" label="Email" placeholder="Enter your email" />                
                    </div>

                    <div>
                        <FormField control={form.control} type="password" name="password" label="Password" placeholder="Enter your password" />
                    </div>

                    {authState === 'register' && (
                        <div>
                            <FormField control={form.control} type="password" name="confirmPassword" label="Confirm Password" placeholder="Confirm your password" />
                        </div>
                    )}

                    <Button variant="btnPrimary" type="submit">
                        {authState !== 'register' ? "Sign In" : "Create account"}
                    </Button>
                </form>
            </Form>

            <div className='flex items-center '>
                <div className='flex-1 border-t border-gray-300'></div>
                    <span className='px-4 text-sm text-white/80'>or</span>
                <div className='flex-1 border-t border-gray-300'></div>
            </div>

             <button className='w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm flex items-center justify-center gap-2'>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                { authState === 'register' ? 'Sign up with Google' : 'Continue with Google' }
            </button>

            <div className='mt-6 text-center'>
                {authState === 'login' && (  
                    <p className='text-sm text-white mr-2'>
                        Don't have an account?{' '}
                        <a onClick={() =>{ navigate('/auth-layout/pre')}} className='text-white/55 hover:text-white font-medium underline'>
                            Sign up
                        </a>
                    </p>
                )}
            </div>
        </div>
    );
}

export default AuthForm
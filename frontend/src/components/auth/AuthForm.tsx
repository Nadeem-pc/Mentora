"use client"

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { registerSchema } from '@/schemas/authSchema';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"


const AuthForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const role = localStorage.getItem('role')

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        mode: "onTouched"
    })
    
    return (
        <div className='space-y-6'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-6">
                    <div>
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="First name" />
                                    </FormControl>
                                    <FormMessage style={{color:'red'}}/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Last name" />
                                    </FormControl>
                                    <FormMessage style={{color:'red'}}/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Email" />
                                    </FormControl>
                                    <FormMessage style={{color:'red'}}/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <FormControl>
                                            <input
                                                {...field}
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={role === undefined ? "Enter your password" : "Create a password"}
                                                className="w-full px-0 py-2 pr-8 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90 focus:ring-0 text-sm placeholder-white/80"
                                            />
                                        </FormControl>

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <FormMessage style={{color:'red'}}/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="relative">
                                        <FormControl>
                                            <input
                                                {...field}
                                                id="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder='Confirm your password'
                                                className="w-full px-0 py-2 pr-8 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90 focus:ring-0 text-sm placeholder-white/80"
                                            />
                                        </FormControl>

                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <FormMessage style={{color:'red'}}/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button variant="btnPrimary" type="submit">
                        {role ? "Create account" : "Sign In"}
                    </Button>

                </form>
            </Form>
        </div>
    )
}

export default AuthForm
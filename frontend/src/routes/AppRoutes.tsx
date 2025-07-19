import { createBrowserRouter } from "react-router-dom";
import PreAuth from "@/pages/auth/PreAuth";
import AuthLayout from "@/layouts/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";
import VerifyOtp from "@/pages/auth/VerifyOtp";

export const router = createBrowserRouter([
    {
        path: '/auth-layout', element: <AuthLayout/>, 
        
        children: [
            {
                path: 'pre', element: <PreAuth/>
            },
            {
                path: 'auth', element: <AuthForm/>
            },
            {
                path: 'verify-otp', element: <VerifyOtp/>
            },
        ]
    },
])
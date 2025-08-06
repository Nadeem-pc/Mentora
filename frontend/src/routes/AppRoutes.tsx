import { createBrowserRouter } from "react-router-dom";
import PreAuth from "@/pages/auth/PreAuth";
import AuthLayout from "@/layouts/AuthLayout";
import Auth from "@/pages/auth";
import Landing from "@/pages/client/Landing";
import OtpForm from "@/components/auth/OTPForm";

export const router = createBrowserRouter([
    {
        path: '/auth-layout', element: <AuthLayout/>, 
        
        children: [
            {
                path: 'pre', element: <PreAuth/>
            },
            {
                path: 'auth', element: <Auth/>
            },
            {
                path: 'verify-otp', element: <OtpForm/>
            },
        ]
    },
    {
        path: '/', element: <Landing/>
    }
])
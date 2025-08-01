import { createBrowserRouter } from "react-router-dom";
import PreAuth from "@/pages/auth/PreAuth";
import AuthLayout from "@/layouts/AuthLayout";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import Auth from "@/pages/auth";
import Landing from "@/pages/client/Landing";

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
                path: 'verify-otp', element: <VerifyOtp/>
            },
        ]
    },
    {
        path: '/', element: <Landing/>
    }
])
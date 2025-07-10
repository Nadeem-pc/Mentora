import { createBrowserRouter } from "react-router-dom";
import PreAuth from "@/pages/auth/PreAuth";
import Auth from "@/pages/auth";

export const router = createBrowserRouter([
    {
        path: '/pre-auth', element: <PreAuth/>
    },
    {
        path: '/auth', element: <Auth/>
    },
])
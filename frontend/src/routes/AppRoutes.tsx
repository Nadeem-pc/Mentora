import { createBrowserRouter } from "react-router-dom";
import Signup from "@/pages/auth";
import Landing from "@/pages/client/Landing";

export const router = createBrowserRouter([
    {
        path: '/', element: <Landing/>
    },
    {
        path: '/auth', element: <Signup/>
    },
])
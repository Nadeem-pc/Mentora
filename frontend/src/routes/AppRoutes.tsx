import { createBrowserRouter } from "react-router-dom";
import Signup from "@/pages/auth/signup";

export const router = createBrowserRouter([
    {
        path: '/', element: <Signup/>
    },
])
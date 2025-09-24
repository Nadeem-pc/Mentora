import { createBrowserRouter } from "react-router-dom";
import PreAuth from "@/pages/auth/PreAuth";
import AuthLayout from "@/layouts/AuthLayout";
import Auth from "@/pages/auth";
import Landing from "@/pages/client/Landing";
import UnProtectedRoute from "./UnProtectedRoute";
import OtpForm from "@/components/auth/OtpForm";
import ClientManagement from "@/pages/admin/ClientManagement";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import UserProfilePage from "@/pages/client/Profile";
import NotFoundPage from "@/pages/shared/PageNotFound";
import UserDetail from "@/pages/admin/UserDetail";
import TherapistProfilePage from "@/pages/therapist/Profile";
import ProtectedRoute from "./ProtectedRoute";
import TherapistDashboard from "@/pages/therapist/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import DashboardLayout from "@/layouts/DashboardLayout";

export const router = createBrowserRouter([
    {
        path: '/', element: <Landing/> 
    },
    {
        path: '/auth', element: <AuthLayout/>, 
        children: [
            {
                path: 'role', element: <PreAuth/>
            },
            {
                path: 'form', element: <UnProtectedRoute> <Auth/> </UnProtectedRoute>
            },
            {
                path: 'verify-otp', element: <UnProtectedRoute> <OtpForm/> </UnProtectedRoute>
            },
            {
                path: 'forgot-password', element: <ForgotPassword/>
            },
            {
                path: 'reset-password', element: <ResetPassword />
            },
        ]
    },
    {
        path: '/profile',  element: <ProtectedRoute allowedRoles={['client']}> <UserProfilePage /> </ProtectedRoute>
    },

    {
        path: '/admin',  element: <ProtectedRoute allowedRoles={['admin']}> <DashboardLayout /> </ProtectedRoute>,
        children: [
            {
                path: 'dashboard', element: <AdminDashboard/>
            },
            {
                path: 'users', element: <ClientManagement/>
            },
            {
                path: 'users/detail', element: <UserDetail/>
            }
        ]
    },

    {
        path: '/therapist', element: <ProtectedRoute allowedRoles={['therapist']}> <DashboardLayout /> </ProtectedRoute>,
        children: [
            {
                path: 'dashboard', element: <TherapistDashboard/>
            },
            {
                path: 'profile', element: <TherapistProfilePage/>
            },
        ]
    },


    {
        path: '*', element: <NotFoundPage/>
    },
]);
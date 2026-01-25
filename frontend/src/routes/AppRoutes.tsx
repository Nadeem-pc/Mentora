import { createBrowserRouter } from "react-router-dom";
import PreAuth from "@/pages/auth/PreAuth";
import AuthLayout from "@/layouts/AuthLayout";
import Auth from "@/pages/auth";
import Landing from "@/pages/client/Landing";
import AboutPage from "@/pages/client/About";
import UnProtectedRoute from "./UnProtectedRoute";
import OtpForm from "@/components/auth/OtpForm";
import ClientManagement from "@/pages/admin/ClientManagement";
import ForgotPassword from "@/components/auth/ForgotPassword";
import ResetPassword from "@/components/auth/ResetPassword";
import UserProfilePage from "@/pages/client/Profile";
import NotFoundPage from "@/pages/shared/PageNotFound";
import UserDetail from "@/pages/admin/UserDetail";
import ProtectedRoute from "./ProtectedRoute";
import TherapistDashboard from "@/pages/therapist/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import DashboardLayout from "@/layouts/DashboardLayout";
import VerificationForm from "@/pages/therapist/VerificationForm";
import TherapistProfilePage from "@/pages/therapist/Profile";
import JobApplications from "@/pages/admin/JobApplications";
import JobApplicationDetail from "@/pages/admin/JobApplicationDetail";
import TherapistListing from "@/pages/client/TherapistList";
import TherapistDetailPage from "@/pages/client/TherapistDetail";
import TherapistEarnings from "@/pages/therapist/Wallet";
import PaymentSuccess from "@/pages/client/PaymentSuccess";
import PaymentCancel from "@/pages/client/PaymentCancel";
import MentalHealthPlatform from "@/pages/client/Home";
import SlotManagement from "@/pages/therapist/ManageSlots";
import TherapistAppointments from "@/pages/therapist/Appointments";
import ClientChatPage from "@/pages/client/ChatPage";
import TherapistChatDashboard from "@/pages/therapist/ChatDashboard";
import AppointmentDetailPage from "@/pages/therapist/AppointmentDetail";
import TherapistReviewsDashboard from "@/pages/therapist/Review";
import SubscriptionAdminPage from "@/pages/admin/Subscription";

export const router = createBrowserRouter([
    {
        path: '/', element: <Landing/> 
    },
    {
        path: '/about', element: <AboutPage/> 
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
        path: '/client/home', element: <ProtectedRoute allowedRoles={['client']}> <MentalHealthPlatform/> </ProtectedRoute>
    },
    {
        path: '/profile',  element: <ProtectedRoute allowedRoles={['client']}> <UserProfilePage /> </ProtectedRoute>
    },
    {
        path: '/client/chat/:therapistId', element: <ProtectedRoute allowedRoles={['client']}> <ClientChatPage /> </ProtectedRoute>
    },
    {
        path: '/therapists', element: <ProtectedRoute allowedRoles={['client']}> <TherapistListing/> </ProtectedRoute>
    },
    {
        path: '/therapist/detail/:therapistId', element: <ProtectedRoute allowedRoles={['client']}> <TherapistDetailPage/> </ProtectedRoute>
    },
    {
        path: '/payment/success', element: <PaymentSuccess/>
    },
    {
        path: '/payment/cancel', element: <PaymentCancel/>
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
                path: 'users/:userId', element: <UserDetail/>
            },
            {
                path: 'job-applications', element: <JobApplications/>
            },
            {
                path: 'job-applications/:applicationId', element: <JobApplicationDetail/>
            },
            {
                path: 'wallet', element: <TherapistEarnings/>
            },
            {
                path: 'subscription', element: <SubscriptionAdminPage/>
            },
        ]
    },

    {
        path: '/therapist', element: <ProtectedRoute allowedRoles={['therapist']}> <DashboardLayout /> </ProtectedRoute>,
        children: [
            {
                path: 'dashboard', element: <TherapistDashboard/>
            },
            {
                path: 'profile/verification', element: <VerificationForm/>
            },
            {
                path: 'profile', element: <TherapistProfilePage/>
            },
            {
                path: 'wallet', element: <TherapistEarnings/>
            },
            {
                path: 'slots', element: <SlotManagement/>
            },
            {
                path: 'appointments', element: <TherapistAppointments/>
            },
            {
                path: 'chat', element: <TherapistChatDashboard />
            },
            {
                path: 'appointments/:appointmentId', element: <AppointmentDetailPage/>
            }, 
            {
                path: 'reviews', element: <TherapistReviewsDashboard/>
            }
        ]
    },


    {
        path: '*', element: <NotFoundPage/>
    },
]);
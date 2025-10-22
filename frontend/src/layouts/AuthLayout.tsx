import { useEffect, useState } from 'react';
import background_img from '/signup-background.jpg';
import { Outlet, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthLayout: React.FC = () => {
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    useEffect(() => {
        const handleStorageChange = () => {
            setRole(localStorage.getItem('role'));
        }

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const location = useLocation();
    const heading = location.pathname === '/auth/role' ? "Select Your Role" 
        : location.pathname === '/auth/forgot-password' ? ""
        : location.pathname === '/auth/reset-password' ? ""
        : role ?  "Create an account" : "Welcome Back" ;
    const text = !role 
        ? "At Mentora, we're building a space where mental well-being is supported and accessible to all. Whether you're here to seek help or provide it, you're part of a mission to make a real difference."
        : role === "therapist" 
        ? "We believe in changing lives by making high-quality mental healthcare accessible to all. By joining Mentora, you'll play a vital role in turning that vision into reality."
        : "You don't have to take the first step towards your mental well-being alone. Create an account and start your mental health journey with us, today"


    return (
        <GoogleOAuthProvider clientId="258406381423-al4882pvn77qsr2kos74pqnrmfelnt9g.apps.googleusercontent.com">
            <div className='fixed inset-0'>
                <img 
                    className='hidden md:block h-full w-full object-cover' 
                    src={background_img}
                    alt=""  
                />

                <div className='md:absolute mt-5 md:top-18 md:left-30 max-w-lg md:text-start'>
                    <h1 className='hidden md:block text-2xl md:text-4xl w-full font-semibold text-gray-800 mb-4 leading-tight'>
                        Welcome to Mentora!
                    </h1>
                    <p className='hidden md:block md:text-sm w-70 md:w-full text-gray-700 leading-relaxed'>
                        {text}
                    </p>
                </div>

                <div className='bg-primary absolute top-0 right-0 h-full w-full md:me-25 md:min-w-[440px] md:max-w-[440px] flex items-center justify-end p-8'>
                    <div className='rounded-lg p-8 max-w-md w-full'>
                        <div className='mb-8 flex justify-center'>
                            <h1 className='flex text-2xl text-white mb-2'>{heading}</h1>
                        </div>
                        <Outlet context={{ setRole }}/>
                    </div>    
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default AuthLayout;
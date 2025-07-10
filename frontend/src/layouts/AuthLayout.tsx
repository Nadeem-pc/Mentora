import React, { type ReactNode } from 'react';
import background_img from '/signup-background.jpg';

interface AuthLayoutProps {
    children: ReactNode;
    heading: string;
    text: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, heading, text }) => {
    return (
        <div className='fixed inset-0'>
            <img 
                className='hidden md:block h-full w-full object-cover' 
                src={background_img}
                alt=""  
            />

            <h1 className='absolute top-70 -left-40 md:hidden text-[90px] md:text-[140px] font-bold text-primary/80 drop-shadow-xl leading-tight uppercase -rotate-90'>
                Mentora
            </h1>

            <div className='md:absolute mt-5 md:top-18 md:left-30 max-w-lg md:text-start'>
                <h1 className='hidden md:block text-2xl md:text-4xl w-full font-semibold text-gray-800 mb-4 leading-tight'>
                    Welcome to Mentora!
                </h1>
                <p className='hidden md:block md:text-sm w-70 md:w-full text-gray-700 leading-relaxed'>
                    {text}
                </p>
            </div>

            <div className='bg-primary absolute top-0 right-0 h-full md:me-25 md:min-w-[440px] md:max-w-[440px] flex items-center justify-end p-8'>
                <div className='rounded-lg p-8 max-w-md w-full'>
                    <div className='mb-8 flex justify-center'>
                        <h1 className='flex text-2xl text-white mb-2'>{heading}</h1>
                    </div>
                    {children}
                </div>    
            </div>
        </div>
    );
};

export default AuthLayout;
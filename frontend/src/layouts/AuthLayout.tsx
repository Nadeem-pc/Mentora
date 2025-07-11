import background_img from '/signup-background.jpg';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
    const role = localStorage.getItem('role')
    const heading = role ? "Create an account" : "Welcome Back";
    const text = !role 
        ? "At Mentora, we're building a space where mental well-being is supported and accessible to all. Whether you're here to seek help or provide it, you're part of a mission to make a real difference."
        : role === "therapist" 
        ? "We believe in changing lives by making high-quality mental healthcare accessible to all. By joining Mentora, you'll play a vital role in turning that vision into reality."
        : "You don't have to take the first step towards your mental well-being alone. Create an account and start your mental health journey with us, today"


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
                    <Outlet />
                </div>    
            </div>
        </div>
    );
};

export default AuthLayout;
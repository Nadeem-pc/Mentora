import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Auth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const role:string = location.state?.role;

    return (
        <div className='space-y-6'>
            {role !== undefined && (
                <div className='flex gap-6'>
                    <div className='flex-1'>
                        <input 
                            type="text" 
                            id='firstName'
                            placeholder='First name'
                            className='w-full px-0 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90 focus:ring-0 text-sm placeholder-white/80'
                        />
                    </div>
                    <div className='flex-1'>
                        <input 
                            type="text" 
                            id='lastName'
                            placeholder='Last name'
                            className='w-full px-0 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90  focus:ring-0 text-sm placeholder-white/80'
                        />
                    </div>
                </div>
            )}
            <div>
                <input 
                    type="email" 
                    id='email'
                    placeholder='Enter your email'
                    className='w-full px-0 py-2 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90  focus:ring-0 text-sm placeholder-white/80'
                />
            </div>
            
            <div>
                <div className='relative'>
                    <input 
                    id='password'
                        type={showPassword ? "text" : "password"}
                        placeholder= { role === undefined ? "Enter your password" : "Create a password"}
                        className='w-full px-0 py-2 pr-8 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90 focus:ring-0 text-sm placeholder-white/80'
                    />
                    <button
                        type="button"
                        id='confirmPassword'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {role && (
                <div>
                    <div className='relative'>
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder='Confirm your password'
                            className='w-full px-0 py-2 pr-8 bg-transparent border-0 border-b border-gray-300 focus:outline-none text-white/90 focus:ring-0 text-sm placeholder-white/80'
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className='absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            )}

            <button 
                type="submit"
                className='w-full btn-primary text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition duration-200 font-medium text-sm mt-6'
            >
                { role ? "Create account" : "Sign In" }
            </button>
        
            <div className='flex items-center '>
                <div className='flex-1 border-t border-gray-300'></div>
                <span className='px-4 text-sm text-white/80'>or</span>
                <div className='flex-1 border-t border-gray-300'></div>
            </div>

            <button className='w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm flex items-center justify-center gap-2'>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                { role ? 'Sign up with Google' : 'Continue with Google' }
            </button>

            <div className='mt-6 text-center'>
                {!role && (
                    <p className='text-sm text-white mr-2'>
                        Don't have an account?{' '}
                        <a onClick={() => navigate('/pre-auth')} className='text-white/55 hover:text-white font-medium underline'>
                            Sign up
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}

export default Auth
import React, { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import FormField from '../ui/Formfield';
import { FormProvider, useForm } from 'react-hook-form';
import type z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/schemas/authSchema';
import { AuthService } from '@/services/shared/authServices';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ResetPasswordFormProps {
  isLoading?: boolean;
}

const ResetPassword: React.FC<ResetPasswordFormProps> = ({ isLoading = false }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onChange',
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const newPassword = form.watch('password');
    const confirmPassword = form.watch('confirmPassword');

    const passwordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const getStrengthColor = (strength: number) => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = (strength: number) => {
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Medium';
        return 'Strong';
    };

    const strength = passwordStrength(newPassword);

    const handleSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
        const token = searchParams.get('token');
        if(!token) toast.error("Token is missing");

        try {
            const response = await AuthService.resetPassword(data.password, token);
            if(response.success){
                toast.success(response.message);
                navigate('/auth/form');
            }else{
                toast.error(response?.error || 'Sending reset link failed');
            }
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                </div>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl text-white mb-4">Email Verified Successfully</h1>
                <p className="text-white/90 text-sm leading-relaxed">
                    Your email has been verified. You can now create a new password for your account.
                </p>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="relative">
                        <FormField
                            control={form.control}
                            type={showNewPassword ? 'text' : 'password'}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute top-5 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {newPassword && (
                        <div className="mt-2">
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
                                        style={{ width: `${(strength / 5) * 100}%` }}
                                    />
                                </div>
                                <span
                                    className={`text-xs font-medium ${
                                        strength <= 2 ? 'text-red-500' : strength <= 3 ? 'text-yellow-500' : 'text-green-500'
                                    }`}
                                    >
                                    {getStrengthText(strength)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="relative">
                        <FormField
                            control={form.control}
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>

                    {confirmPassword && newPassword && (
                        <div className="mt-2 flex items-center space-x-2">
                            {newPassword === confirmPassword ? (
                                <div className="flex items-center text-green-600">
                                    <Check className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Passwords match</span>
                                </div>
                            ) : (
                                <span className="text-xs text-red-600">Passwords do not match</span>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmPassword}
                        className="w-full btn-primary disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-1"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                Resetting Password...
                            </div>
                            ) : (
                            'RESET PASSWORD'
                        )}
                    </button>
                </form>
            </FormProvider>
        </div>
    );
};

export default ResetPassword;
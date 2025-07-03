import { useState, useRef, useEffect } from 'react';

const OtpVerification: React.FC = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '']);
    const [timer, setTimer] = useState<number>(30);
    const [canResend, setCanResend] = useState<boolean>(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer effect
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index: number, value: string): void => {
        // Only allow single digit
        if (value.length > 1) return;
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        
        // Handle Enter key
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 4);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 4; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        
        // Focus last filled input or next empty one
        const nextIndex = Math.min(pastedData.length, 3);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = (): void => {
        const otpValue = otp.join('');
        if (otpValue.length === 4) {
            console.log('OTP submitted:', otpValue);
            // Add your verification logic here
        }
    };

    const handleResend = (): void => {
        if (!canResend) return;
        
        console.log('Resending OTP...');
        // Add your resend logic here
        setOtp(['', '', '', '']);
        setTimer(30);
        setCanResend(false);
        inputRefs.current[0]?.focus();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className=''>
            <div className="text-center mb-6">
                <p className="text-white text-sm">Enter the 4-digit verification code sent to your email.</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-8">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => inputRefs.current[index] = el}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 text-white/80 transition-all duration-200"
                        maxLength={1}
                        autoComplete="off"
                    />
                ))}
            </div>
            
            <div className="space-y-3">
                <button 
                    onClick={handleSubmit}
                    disabled={otp.join('').length !== 4}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                >
                    VERIFY OTP
                </button>
                
                <button 
                    onClick={handleResend}
                    disabled={!canResend}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                    {canResend ? 'RESEND OTP' : `RESEND OTP (${formatTime(timer)})`}
                </button>
            </div>
            
            <p className="text-center text-[12px] text-white/80 mt-4">
                Didn't receive the code? Check your spam folder.
            </p>
        </div> 
    );
};

export default OtpVerification;
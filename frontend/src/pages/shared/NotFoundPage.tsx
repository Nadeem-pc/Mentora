import React, { useState, useEffect } from 'react';
import { Heart, Leaf, Home, ArrowRight } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleGoHome = () => window.location.href = '/';

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating leaves/elements */}
                <div 
                    className="absolute w-64 h-64 bg-gradient-to-r from-green-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse"
                    style={{
                        left: mousePosition.x * 0.02 + '%',
                        top: mousePosition.y * 0.02 + '%',
                        transform: 'translate(-50%, -50%)'
                    }}
                />
                <div 
                    className="absolute w-48 h-48 bg-gradient-to-r from-cyan-200/20 to-emerald-200/20 rounded-full blur-2xl animate-pulse delay-1000"
                    style={{
                        right: (100 - mousePosition.x * 0.01) + '%',
                        bottom: (100 - mousePosition.y * 0.01) + '%',
                        transform: 'translate(50%, 50%)'
                    }}
                />
                
                {/* Decorative elements */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-green-400 rounded-full animate-bounce delay-300" />
                <div className="absolute top-40 right-32 w-6 h-6 bg-teal-400 rounded-full animate-bounce delay-700" />
                <div className="absolute bottom-32 left-32 w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-1000" />
                <div className="absolute bottom-20 right-20 w-5 h-5 bg-emerald-400 rounded-full animate-bounce delay-500" />
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
                {/* Main 404 Section */}
                <div className="max-w-4xl mx-auto">
                    {/* Large 404 with leaf decoration */}
                    <div className="relative mb-8">
                        <div className="text-9xl md:text-[12rem] font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-pulse">
                            404
                        </div>
                        <div className="absolute -top-4 -right-4 transform rotate-12">
                            <Leaf className="w-16 h-16 text-green-500 animate-bounce" />
                        </div>
                        <div className="absolute -bottom-4 -left-4 transform -rotate-12">
                            <Heart className="w-12 h-12 text-teal-500 animate-pulse" />
                        </div>
                    </div>

                    {/* Calming message */}
                    <div className="mb-12 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            <span className="bg-gradient-to-r from-green-700 to-teal-700 bg-clip-text text-transparent">
                                Take a Deep Breath
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            The page you're looking for seems to have wandered off for some self-care.
                        </p>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Just like in our journey to mental wellness, sometimes we need to redirect our path. 
                            Let's help you find your way back to where you need to be.
                        </p>
                    </div>

                    {/* Home Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={handleGoHome}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 ease-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300/50"
                        >
                            {/* Button background with gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-2xl transition-all duration-300 group-hover:shadow-xl group-hover:shadow-green-500/25" />
                            
                            {/* Animated background overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            
                            {/* Button content */}
                            <div className="relative flex items-center space-x-3">
                                <Home className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'animate-bounce' : ''}`} />
                                    <span>Find Your Way Home</span>
                                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                            </div>
                            
                            {/* Subtle glow effect */}
                            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
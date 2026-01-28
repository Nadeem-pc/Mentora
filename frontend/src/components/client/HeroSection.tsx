import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99] as const
      }
    }
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1] as const
    }
  };

  return (
    <section id="home" className="relative pt-24 pb-16 min-h-screen flex items-center overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Subtle mesh gradient */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 0.12) 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)`
          }}
        />
        
        {/* Noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Premium Background Effects */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 100% 100% at center, black 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at center, black 40%, transparent 70%)'
        }}
      />

      {/* Animated blur orbs */}
      <motion.div 
        className="absolute top-1/4 left-[10%] w-96 h-96 bg-blue-400/8 dark:bg-blue-400/4 rounded-full blur-3xl"
        animate={floatingAnimation}
      />
      <motion.div 
        className="absolute bottom-1/3 right-[10%] w-[500px] h-[500px] bg-teal-400/8 dark:bg-teal-400/4 rounded-full blur-3xl"
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 1 }
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/6 dark:bg-indigo-400/3 rounded-full blur-3xl"
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition, delay: 2 }
        }}
      />

      {/* Decorative geometric lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-blue-200/20 dark:via-blue-800/10 to-transparent"
          style={{ transform: 'rotate(15deg)', transformOrigin: 'top right' }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-transparent via-teal-200/20 dark:via-teal-800/10 to-transparent"
          style={{ transform: 'rotate(-15deg)', transformOrigin: 'bottom left' }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Content */}
          <motion.div 
            className="max-w-4xl mx-auto mb-10"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
              variants={itemVariants}
            >
              Your Mental Wellbeing
              <motion.span 
                className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Deserves Expert Care
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Connect with certified therapists in a safe, confidential environment. 
              Begin your journey to better mental health today.
            </motion.p>
          </motion.div>

          {/* Premium CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-4"
            variants={itemVariants}
          >
            <motion.a
              href="#contact"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/therapists')}
            >
              <span className="relative z-10">Start Your Journey</span>
              <motion.svg 
                className="relative z-10 w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ x: 5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-600 dark:to-indigo-600"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
            
            <motion.a
              href="#services"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-900 dark:text-white font-semibold rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explore Services</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';
import { 
  Heart, 
  ShieldCheck, 
  Lightbulb, 
  Users, 
  Target,
  Sparkles,
} from 'lucide-react';

const AboutPage: React.FC = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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

  const values = [
    {
      Icon: Heart,
      title: "Compassion",
      description: "We approach every interaction with empathy, understanding, and genuine care for your wellbeing.",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      Icon: ShieldCheck,
      title: "Trust & Safety",
      description: "Your privacy and security are our top priorities. We maintain the highest standards of confidentiality.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      Icon: Lightbulb,
      title: "Innovation",
      description: "We leverage cutting-edge technology and evidence-based practices to deliver exceptional care.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      Icon: Users,
      title: "Inclusivity",
      description: "Mental health support should be accessible to everyone, regardless of background or circumstance.",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Header />
      
      {/* Enhanced Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[70vh] flex items-center overflow-hidden">
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
          
          {/* Noise texture */}
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">About Mentora</span>
            </motion.div>
            
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Empowering Mental
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
                Wellbeing
              </span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              We're on a mission to make mental health care accessible, personalized, and effective for everyone. 
              Our platform connects you with licensed professionals who understand your unique journey.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section - Enhanced Layout */}
      <section className="relative py-32 bg-white dark:bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
                Our Purpose
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission - Enhanced */}
            <motion.div
              className="group relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div
                className="relative bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10 backdrop-blur-sm p-10 lg:p-12 rounded-3xl overflow-hidden border border-blue-100/50 dark:border-blue-900/30"
                variants={itemVariants}
                style={{
                  boxShadow: '0 20px 60px rgba(59, 130, 246, 0.08), 0 8px 24px rgba(59, 130, 246, 0.04)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 30px 80px rgba(59, 130, 246, 0.15), 0 12px 32px rgba(59, 130, 246, 0.08)'
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Decorative gradient border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), transparent, rgba(6, 182, 212, 0.2))',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}
                />
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)`
                  }}
                />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                      <Target className="w-8 h-8 text-white" strokeWidth={2.5} />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 opacity-50 blur-xl rounded-2xl"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Our Mission
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    To make high-quality mental health care accessible, affordable, and personalized for everyone. 
                    We believe that everyone deserves support on their journey to better mental wellbeing, and we're 
                    here to provide that support with compassion, expertise, and innovation.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Vision - Enhanced */}
            <motion.div
              className="group relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              <motion.div
                className="relative bg-gradient-to-br from-teal-50/50 to-cyan-50/30 dark:from-teal-950/20 dark:to-cyan-950/10 backdrop-blur-sm p-10 lg:p-12 rounded-3xl overflow-hidden border border-teal-100/50 dark:border-teal-900/30"
                variants={itemVariants}
                style={{
                  boxShadow: '0 20px 60px rgba(20, 184, 166, 0.08), 0 8px 24px rgba(20, 184, 166, 0.04)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -8,
                  boxShadow: '0 30px 80px rgba(20, 184, 166, 0.15), 0 12px 32px rgba(20, 184, 166, 0.08)'
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Decorative gradient border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), transparent, rgba(6, 182, 212, 0.2))',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}
                />
                
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 70% 30%, rgba(20, 184, 166, 0.4) 0%, transparent 50%)`
                  }}
                />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 opacity-50 blur-xl rounded-2xl"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Our Vision
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    To become the most trusted and accessible mental health platform globally, breaking down barriers 
                    and creating a world where mental health support is as normalized and accessible as physical healthcare. 
                    We envision a future where everyone has the tools and support they need to thrive.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section - Enhanced */}
      <section className="relative py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Our Foundation</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600">
                Core Values
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do and shape how we serve our community.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {values.map((value, index) => {
              const getPatternColor = (gradient: string) => {
                if (gradient.includes('pink')) return 'rgba(236, 72, 153, 0.15)';
                if (gradient.includes('blue')) return 'rgba(59, 130, 246, 0.15)';
                if (gradient.includes('yellow')) return 'rgba(234, 179, 8, 0.15)';
                if (gradient.includes('purple')) return 'rgba(168, 85, 247, 0.15)';
                return 'rgba(59, 130, 246, 0.15)';
              };
              
              const getGradientColors = (gradient: string) => {
                if (gradient.includes('pink')) return { from: 'rgba(236, 72, 153, 0.3)', to: 'rgba(244, 63, 94, 0.3)' };
                if (gradient.includes('blue')) return { from: 'rgba(59, 130, 246, 0.3)', to: 'rgba(6, 182, 212, 0.3)' };
                if (gradient.includes('yellow')) return { from: 'rgba(234, 179, 8, 0.3)', to: 'rgba(249, 115, 22, 0.3)' };
                if (gradient.includes('purple')) return { from: 'rgba(168, 85, 247, 0.3)', to: 'rgba(99, 102, 241, 0.3)' };
                return { from: 'rgba(59, 130, 246, 0.3)', to: 'rgba(6, 182, 212, 0.3)' };
              };
              
              const getBgColor = (gradient: string) => {
                if (gradient.includes('pink')) return 'bg-pink-500';
                if (gradient.includes('blue')) return 'bg-blue-500';
                if (gradient.includes('yellow')) return 'bg-yellow-500';
                if (gradient.includes('purple')) return 'bg-purple-500';
                return 'bg-blue-500';
              };
              
              const getTextColor = (gradient: string) => {
                if (gradient.includes('pink')) return 'text-pink-600 dark:text-pink-400';
                if (gradient.includes('blue')) return 'text-blue-600 dark:text-blue-400';
                if (gradient.includes('yellow')) return 'text-yellow-600 dark:text-yellow-400';
                if (gradient.includes('purple')) return 'text-purple-600 dark:text-purple-400';
                return 'text-blue-600 dark:text-blue-400';
              };
              
              const gradientColors = getGradientColors(value.gradient);
              
              return (
                <motion.div
                  key={index}
                  className="group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
                  variants={itemVariants}
                  style={{
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)'
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.08)'
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                >
                  {/* Abstract Background Pattern */}
                  <div 
                    className="absolute inset-0 opacity-40 dark:opacity-20 transition-opacity duration-300 group-hover:opacity-60"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 20% 30%, ${getPatternColor(value.gradient)} 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, ${getPatternColor(value.gradient)} 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, ${getPatternColor(value.gradient)} 0%, transparent 70%)
                      `
                    }}
                  />
                  
                  {/* Gradient border glow on hover */}
                  <motion.div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${gradientColors.from}, transparent, ${gradientColors.to})`,
                      padding: '2px',
                      WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      WebkitMaskComposite: 'xor',
                      maskComposite: 'exclude'
                    }}
                  />
                  
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      style={{
                        animation: 'shine 1.5s ease-in-out infinite',
                        transform: 'translateX(-100%)'
                      }}
                    />
                  </div>
                  
                  {/* Corner Accent Decorations */}
                  <div className={`absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${getBgColor(value.gradient)} rounded-tl-full blur-2xl`} />
                  
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <motion.div 
                      className="mb-6"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 mx-auto`}>
                        {/* Icon glow */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`} />
                        <value.Icon className="w-8 h-8 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                      </div>
                    </motion.div>
                    <h3 className={`text-xl font-bold mb-3 text-center ${getTextColor(value.gradient)} group-hover:scale-105 transform transition-all duration-300`}>
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;

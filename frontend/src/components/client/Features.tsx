import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Users, Lock, Calendar, MessageCircle, Target, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  Icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    Icon: Users,
    title: "Individual Therapy",
    description: "One-on-one sessions with licensed therapists tailored to your specific needs and goals.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    Icon: Lock,
    title: "Complete Privacy",
    description: "End-to-end encryption and strict confidentiality ensure your conversations remain private.",
    gradient: "from-teal-500 to-cyan-500"
  },
  {
    Icon: Calendar,
    title: "Flexible Scheduling",
    description: "Book sessions that fit your schedule with our easy-to-use appointment system.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    Icon: MessageCircle,
    title: "Multiple Formats",
    description: "Choose from video calls, phone sessions, or secure messaging based on your comfort level.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    Icon: Target,
    title: "Specialized Care",
    description: "Access therapists who specialize in anxiety, depression, trauma, relationships, and more.",
    gradient: "from-teal-500 to-cyan-500"
  },
  {
    Icon: Sparkles,
    title: "AI Assistant",
    description: "Get personalized therapist recommendations powered by AI based on your unique needs and preferences.",
    gradient: "from-teal-500 to-green-500"
  }
];

const Features: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99] as const
      }
    }
  };

  return (
    <section id="services" className="relative py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <motion.div 
          className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-teal-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-green-200/20 to-teal-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Comprehensive Mental Health
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
              Services
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We offer a wide range of mental health services designed to support you 
            on your journey to better mental wellbeing.
          </p>
        </motion.div>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-transparent overflow-hidden"
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Gradient Background on Hover */}
              <motion.div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Animated Glow Effect on Hover */}
              <motion.div 
                className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-2xl blur-xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Corner Accent Decorations */}
              <motion.div 
                className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-br-3xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div 
                className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl ${feature.gradient} rounded-tl-3xl`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Icon Container */}
              <motion.div 
                className={`relative mb-6 w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 6 }}
                transition={{ duration: 0.3 }}
              >
                <feature.Icon className="w-8 h-8 text-white relative z-10" strokeWidth={2.5} />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 blur-lg`}></div>
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl blur-md`}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              
              <h3 className="relative text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-teal-600 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="relative text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Shine Effect on Hover */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
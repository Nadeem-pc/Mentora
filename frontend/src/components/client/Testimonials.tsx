import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import sarahImg from "@/assets/sarah.avif";
import jamesImg from "@/assets/james.avif";
import emilyImg from "@/assets/emily.avif";

interface Testimonial {
  name: string;
  content: string;
  rating: number;
  avatar: string;
  imageUrl: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah M.",
    content: "Mentora helped me overcome my anxiety and develop healthy coping strategies. The therapists are incredibly supportive and understanding.",
    rating: 5,
    avatar: "SM",
    imageUrl: sarahImg
  },
  {
    name: "James L.",
    content: "The flexible scheduling made it possible for me to get help while managing my studies. My therapist really understood my challenges.",
    rating: 5,
    avatar: "JL",
    imageUrl: jamesImg
  },
  {
    name: "Emily R.",
    content: "Finding time for therapy as a busy parent seemed impossible until I found Mentora. The online sessions fit perfectly into my schedule.",
    rating: 5,
    avatar: "ER",
    imageUrl: emilyImg
  }
];

const Testimonials: React.FC = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
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
    <section id="testimonials" className="relative py-24 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            What Our Clients
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
              Say About Us
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Real stories from people who found healing and hope through our platform.
          </p>
        </motion.div>

        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group relative bg-white dark:bg-gray-900/80 rounded-3xl px-8 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)] flex flex-col justify-between border border-transparent overflow-hidden"
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
            >
              {/* Subtle gradient overlay on hover */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 rounded-3xl"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.3 }}
                transition={{ duration: 0.5 }}
              />

              {/* Top row: avatar, name/role on left, quote icon on right */}
              <div className="relative flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-100 dark:ring-slate-800"
                    whileHover={{ scale: 1.1 }}
                  >
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback avatar */}
                    <div className="avatar-fallback hidden w-full h-full bg-slate-200 dark:bg-slate-700 items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-100">
                      {testimonial.avatar}
                    </div>
                  </motion.div>
                  <div>
                    <motion.h3 
                      className="text-sm font-semibold text-slate-900 dark:text-white"
                      whileHover={{ color: "#2563eb" }}
                      transition={{ duration: 0.3 }}
                    >
                      {testimonial.name}
                    </motion.h3>
                    {/* 5 Stars below name */}
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Beautiful Quote Icon */}
                <motion.div 
                  className="shrink-0 flex items-start"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg 
                    className="w-10 h-10 text-transparent fill-transparent stroke-2 stroke-teal-400" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L24 4.26c-4.169 0.966-6.8 3.477-6.8 7.391V21h-3.183zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609L10 4.26c-4.169 0.966-6.8 3.477-6.8 7.391V21H0z"
                    />
                  </svg>
                </motion.div>
              </div>

              {/* Testimonial Text */}
              <motion.p 
                className="relative text-sm text-slate-500 dark:text-slate-300 leading-relaxed mt-2"
                whileHover={{ color: "#475569" }}
                transition={{ duration: 0.3 }}
              >
                {testimonial.content}
              </motion.p>

              {/* Decorative shine effect on hover */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
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

export default Testimonials;
import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: "👥",
    title: "Individual Therapy",
    description: "One-on-one sessions with licensed therapists tailored to your specific needs and goals."
  },
  {
    icon: "🔒",
    title: "Complete Privacy",
    description: "End-to-end encryption and strict confidentiality ensure your conversations remain private."
  },
  {
    icon: "📅",
    title: "Flexible Scheduling",
    description: "Book sessions that fit your schedule with our easy-to-use appointment system."
  },
  {
    icon: "💬",
    title: "Multiple Formats",
    description: "Choose from video calls, phone sessions, or secure messaging based on your comfort level."
  },
  {
    icon: "🎯",
    title: "Specialized Care",
    description: "Access therapists who specialize in anxiety, depression, trauma, relationships, and more."
  },
  {
    icon: "📱",
    title: "Mobile Friendly",
    description: "Access support anywhere with our responsive platform that works on all devices."
  }
];

const Features: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Mental Health Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer a wide range of mental health services designed to support you 
            on your journey to better mental wellbeing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-green-100 hover:border-green-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
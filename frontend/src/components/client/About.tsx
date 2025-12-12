import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Why Choose Mentora?
        </h2>
        <div className="space-y-10">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Licensed Professionals</h3>
            <p className="text-gray-600">
              All our therapists are licensed, experienced, and committed to providing the highest quality care.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Evidence-Based Approach</h3>
            <p className="text-gray-600">
              We use proven therapeutic methods and techniques backed by scientific research.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Treatment</h3>
            <p className="text-gray-600">
              Every treatment plan is tailored to your unique needs, goals, and circumstances.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
import React from 'react';

const CTA: React.FC = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-r from-green-600 to-teal-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Take the First Step?
        </h2>
        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
          Your mental health journey starts here. Connect with a licensed therapist today 
          and begin building the tools you need for a healthier, happier life.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="bg-white text-green-600 px-8 py-4 rounded-full hover:bg-gray-100 transition-colors font-medium"
          >
            Book Free Consultation
          </a>
          <a
            href="#"
            className="border border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-green-600 transition-colors font-medium"
          >
            Learn About Our Process
          </a>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white">🔒</div>
            <div className="text-green-100 mt-2">100% Confidential</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">⚡</div>
            <div className="text-green-100 mt-2">Quick Matching</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">💝</div>
            <div className="text-green-100 mt-2">Compassionate Care</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
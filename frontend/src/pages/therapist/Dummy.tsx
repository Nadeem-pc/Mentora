import React from 'react';
import { ShieldAlert } from 'lucide-react';

const TherapistStatusPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-amber-50 rounded-2xl shadow-lg p-6 md:p-10 lg:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="text-amber-500 animate-pulse">
              <ShieldAlert className="w-16 h-16 md:w-20 md:h-20" />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
              Account Access Restricted
            </h1>

            {/* Message */}
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
              Your account is currently under review by our team. This may be due to pending verification, 
              credential review, or other administrative processes.  
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistStatusPage;
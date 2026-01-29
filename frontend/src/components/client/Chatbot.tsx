import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, AlertCircle, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { therapistSuggestionService } from '@/services/client/therapistSuggestionService';
import { useNavigate } from 'react-router-dom';
import IntakeForm from './IntakeForm';
import DynamicFollowUp from './DynamicFollowUp';
import BookingFlow from './BookingFlow';
import type { TherapistSuggestionResponse, SuggestedTherapist } from '@/types/dtos/therapist-suggestion.dto';
import type { IntakeFormData, FollowUpAnswers, BookingPreferences } from '@/types/dtos/intake-form.dto';
import type { AxiosError } from 'axios';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'component';
  content: string;
  timestamp: Date;
  componentType?: 'intake_form' | 'follow_up' | 'booking_flow' | 'therapist_cards';
  suggestionData?: TherapistSuggestionResponse;
}

type ChatbotStep = 'greeting' | 'intake_form' | 'follow_up' | 'processing' | 'booking_flow' | 'completed';

const FloatingChatButtonRedesigned: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatStep, setChatStep] = useState<ChatbotStep>('greeting');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [intakeFormData, setIntakeFormData] = useState<IntakeFormData>({
    durationOfDifficulties: null,
    impactOnDailyLife: null,
    previousTherapyExperience: null,
    comfortLevelInSharing: null,
    primaryAreaOfConcern: null,
    followUpAnswers: {},
  });
  const [intakeFormStep, setIntakeFormStep] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState<FollowUpAnswers>({});
  const [suggestedTherapists, setSuggestedTherapists] = useState<SuggestedTherapist[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      const greetingMessage: ChatMessage = {
        id: 'greeting',
        type: 'bot',
        content:
          "Hi there! 👋 I'm here to help you find the right therapist.\n\nI'll ask you a few quick questions so I can understand what you're going through and suggest therapists who fit your needs.",
        timestamp: new Date(),
      };
      setChatMessages([greetingMessage]);
      setChatStep('intake_form');
    }
  }, [isOpen, chatMessages.length]);

  const handleIntakeFormAnswer = (field: keyof IntakeFormData, value: string | undefined) => {
    setIntakeFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleIntakeFormNext = () => {
    if (intakeFormStep < 5) {
      setIntakeFormStep(intakeFormStep + 1);
    } else {
      // Move to follow-up questions
      setChatStep('follow_up');
      const followUpMessage: ChatMessage = {
        id: `follow-up-intro-${Date.now()}`,
        type: 'bot',
        content: `Great! Now let me understand your situation better based on "${intakeFormData.primaryAreaOfConcern}".`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, followUpMessage]);
    }
  };

  const handleIntakeFormPrevious = () => {
    if (intakeFormStep > 0) {
      setIntakeFormStep(intakeFormStep - 1);
    }
  };

  const handleFollowUpComplete = () => {
    setIntakeFormData((prev) => ({
      ...prev,
      followUpAnswers,
    }));
    setChatStep('processing');
    processIntakeAndGetSuggestions();
  };

  const handleFollowUpSkip = () => {
    setIntakeFormData((prev) => ({
      ...prev,
      followUpAnswers,
    }));
    setChatStep('processing');
    processIntakeAndGetSuggestions();
  };

  const processIntakeAndGetSuggestions = async () => {
    setLoading(true);
    try {
      // Create a summary of the intake form for the AI
      const intakeSummary = buildIntakeSummary(intakeFormData);

      const response = await therapistSuggestionService.getSuggestions(intakeSummary);
      setSuggestedTherapists(response.therapists || []);

      // Add bot message with therapist suggestions
      const botMessage: ChatMessage = {
        id: `bot-suggestions-${Date.now()}`,
        type: 'bot',
        content: formatTherapistSuggestionMessage(response),
        timestamp: new Date(),
        componentType: 'therapist_cards',
        suggestionData: response,
      };

      setChatMessages((prev) => [...prev, botMessage]);

      // Add booking confirmation prompt
      const bookingPromptMessage: ChatMessage = {
        id: `booking-prompt-${Date.now()}`,
        type: 'bot',
        content: 'Would you like me to go ahead and book an appointment for you?',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, bookingPromptMessage]);
      setChatStep('booking_flow');
    } catch (error) {
      console.error('Error getting suggestions:', error);

      let friendlyMessage =
        'Sorry, I encountered an error while processing your information. Please try again or contact our support team.';

      const axiosError = error as AxiosError<{ success: boolean; message?: string }>;
      const backendMessage = axiosError?.response?.data?.message;
      if (backendMessage) {
        friendlyMessage = backendMessage;
      }

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'bot',
        content: friendlyMessage,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      setChatStep('greeting');
    } finally {
      setLoading(false);
    }
  };

  const buildIntakeSummary = (data: IntakeFormData): string => {
    const parts: string[] = [];

    if (data.durationOfDifficulties) {
      parts.push(`Duration: ${data.durationOfDifficulties.replace(/_/g, ' ')}`);
    }
    if (data.impactOnDailyLife) {
      parts.push(`Impact on daily life: ${data.impactOnDailyLife.replace(/_/g, ' ')}`);
    }
    if (data.previousTherapyExperience) {
      parts.push(`Previous therapy experience: ${data.previousTherapyExperience}`);
      if (data.previousTherapyExperienceQuality) {
        parts.push(`Experience quality: ${data.previousTherapyExperienceQuality.replace(/_/g, ' ')}`);
      }
    }
    if (data.comfortLevelInSharing) {
      parts.push(`Comfort level: ${data.comfortLevelInSharing.replace(/_/g, ' ')}`);
    }
    if (data.primaryAreaOfConcern) {
      parts.push(`Primary concern: ${data.primaryAreaOfConcern.replace(/_/g, ' ')}`);
    }

    return parts.join('. ') + '.';
  };

  const formatTherapistSuggestionMessage = (response: TherapistSuggestionResponse): string => {
    if (response.off_topic) {
      return response.message || 'I can only help with mental health concerns and therapist suggestions.';
    }

    const { analysis } = response;
    if (!analysis) {
      return 'I found some therapists for you. Please review them below.';
    }

    let message = `Based on what you've shared, here are therapists who specialize in:\n\n`;
    message += analysis.categories.map((cat) => `• ${cat.label}`).join('\n');
    message += `\n\nThey can help you with: ${analysis.summary}`;

    if (analysis.safety_flag) {
      message += `\n\n⚠️ Important: ${analysis.safety_note || 'Please prioritize your safety.'}`;
    }

    return message;
  };

  const handleBookingComplete = (_preferences: BookingPreferences, selectedTherapistId: string) => {
    const selectedTherapist = suggestedTherapists.find((t) => t._id === selectedTherapistId);
    if (selectedTherapist) {
      const confirmationMessage: ChatMessage = {
        id: `booking-complete-${Date.now()}`,
        type: 'bot',
        content: `Perfect! Your appointment with ${selectedTherapist.name} has been confirmed. Check your email for details.`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, confirmationMessage]);
      setChatStep('completed');
    }
  };

  const handleBookingCancel = () => {
    const cancelMessage: ChatMessage = {
      id: `booking-cancel-${Date.now()}`,
      type: 'bot',
      content: 'No problem! You can explore therapists anytime. Feel free to reach out when you\'re ready.',
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, cancelMessage]);
    setChatStep('greeting');
  };

  const handleReset = () => {
    setChatMessages([]);
    setChatStep('greeting');
    setIntakeFormData({
      durationOfDifficulties: null,
      impactOnDailyLife: null,
      previousTherapyExperience: null,
      comfortLevelInSharing: null,
      primaryAreaOfConcern: null,
      followUpAnswers: {},
    });
    setIntakeFormStep(0);
    setFollowUpAnswers({});
    setSuggestedTherapists([]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group"
          aria-label="Open Therapist Finder"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:z-[60]"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 lg:inset-auto lg:bottom-0 lg:right-6 lg:top-6 lg:w-[600px] lg:h-[calc(100vh-1.5rem)] bg-white dark:bg-gray-800 rounded-none lg:rounded-t-3xl shadow-2xl z-[70] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white p-3 lg:p-5 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Therapist Finder</h3>
                    <p className="text-xs text-blue-100">Find your perfect match in 3 steps</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Messages Area - Fixed Height, No Scroll */}
              <div className="flex-shrink-0 bg-gradient-to-b from-blue-50/30 via-cyan-50/20 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 overflow-hidden">
                <div className="p-4 lg:p-6 space-y-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-3">
                      {msg.type === 'bot' && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 justify-start"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                            AI
                          </div>
                          <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-md max-w-xs lg:max-w-md whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </div>
                        </motion.div>
                      )}

                      {msg.type === 'user' && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 justify-end"
                        >
                          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md max-w-xs lg:max-w-md whitespace-pre-wrap text-sm">
                            {msg.content}
                          </div>
                        </motion.div>
                      )}

                      {msg.componentType === 'therapist_cards' &&
                        msg.suggestionData?.therapists &&
                        msg.suggestionData.therapists.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="ml-11 space-y-3"
                          >
                            {msg.suggestionData.therapists.map((therapist) => (
                              <div
                                key={therapist._id}
                                className="bg-white dark:bg-gray-700 border-2 border-teal-200 dark:border-teal-800 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:border-teal-300 dark:hover:border-teal-600"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-bold text-base text-gray-900 dark:text-white">
                                      {therapist.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {therapist.experienceYears}+ years experience
                                    </p>
                                  </div>
                                  <span className="text-xs bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-full font-bold">
                                    {Math.round(therapist.matchScore * 100)}% match
                                  </span>
                                </div>

                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Specializations:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {therapist.specializations.slice(0, 4).map((spec, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-700"
                                      >
                                        {spec}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Languages:
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {therapist.languages.join(', ')}
                                  </p>
                                </div>

                                {therapist.fee && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                    <span className="font-semibold">Fee:</span> ₹{therapist.fee}
                                  </p>
                                )}

                                <motion.button
                                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-sm py-2.5 px-4 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/therapists/${therapist._id}`);
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  View Profile
                                </motion.button>
                              </div>
                            ))}
                          </motion.div>
                        )}

                      {msg.suggestionData?.analysis?.safety_flag &&
                        msg.suggestionData.emergency_message && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="ml-11 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4"
                          >
                            <div className="flex gap-3">
                              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm text-red-700 dark:text-red-400 font-bold mb-1">
                                  ⚠️ Important Safety Notice
                                </p>
                                <p className="text-xs text-red-600 dark:text-red-300">
                                  {msg.suggestionData.emergency_message}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                    </div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                        AI
                      </div>
                      <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area / Components - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg custom-scrollbar">
                <div className="p-4 lg:p-5 max-w-full">
                  {chatStep === 'intake_form' && (
                    <IntakeForm
                      currentStep={intakeFormStep}
                      formData={intakeFormData}
                      onAnswerSelect={handleIntakeFormAnswer}
                      onNext={handleIntakeFormNext}
                      onPrevious={handleIntakeFormPrevious}
                      isLastStep={intakeFormStep === 5}
                    />
                  )}

                  {chatStep === 'follow_up' && intakeFormData.primaryAreaOfConcern && (
                    <DynamicFollowUp
                      primaryArea={intakeFormData.primaryAreaOfConcern}
                      followUpAnswers={followUpAnswers}
                      onAnswerSelect={(path, value) => {
                        const keys = path.split('.');
                        setFollowUpAnswers((prev) => {
                          const updated: FollowUpAnswers = { ...prev };
                          let current: Record<string, unknown> = updated as Record<string, unknown>;

                          for (let i = 0; i < keys.length - 1; i++) {
                            const key = keys[i];
                            const next = (current[key] as Record<string, unknown> | undefined) ?? {};
                            (current as Record<string, unknown>)[key] = next;
                            current = next;
                          }

                          const lastKey = keys[keys.length - 1];
                          (current as Record<string, unknown>)[lastKey] = value;

                          return updated;
                        });
                      }}
                      onComplete={handleFollowUpComplete}
                      onSkip={handleFollowUpSkip}
                    />
                  )}

                  {chatStep === 'booking_flow' && suggestedTherapists.length > 0 && (
                    <BookingFlow
                      therapists={suggestedTherapists}
                      onBookingComplete={handleBookingComplete}
                      onCancel={handleBookingCancel}
                    />
                  )}

                  {chatStep === 'completed' && (
                    <motion.button
                      onClick={handleReset}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Over
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatButtonRedesigned;
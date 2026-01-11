import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        aria-label="Open Therapist Finder"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col max-h-screen overflow-hidden">
          <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <SheetTitle className="text-white">Therapist Finder</SheetTitle>
                <SheetDescription className="text-emerald-100">
                  Find your perfect match in 3 steps
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Messages Area */}
            <div className="flex-shrink-0 p-6 space-y-4 bg-gradient-to-b from-emerald-50/30 to-white">
              <div className="max-w-2xl mx-auto w-full space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-3">
                    {msg.type === 'bot' && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          AI
                        </div>
                        <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-3 shadow-sm max-w-xs lg:max-w-md whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    )}

                    {msg.type === 'user' && (
                      <div className="flex gap-3 justify-end">
                        <div className="bg-emerald-600 text-white rounded-lg rounded-br-none px-4 py-3 shadow-sm max-w-xs lg:max-w-md whitespace-pre-wrap text-sm">
                          {msg.content}
                        </div>
                      </div>
                    )}

                    {msg.componentType === 'therapist_cards' &&
                      msg.suggestionData?.therapists &&
                      msg.suggestionData.therapists.length > 0 && (
                        <div className="ml-11 space-y-3">
                          {msg.suggestionData.therapists.map((therapist) => (
                            <div
                              key={therapist._id}
                              className="bg-white border border-emerald-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-base text-gray-900">
                                    {therapist.name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {therapist.experienceYears}+ years experience
                                  </p>
                                </div>
                                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                                  {Math.round(therapist.matchScore * 100)}% match
                                </span>
                              </div>

                              <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1">
                                  Specializations:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {therapist.specializations.slice(0, 4).map((spec, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-3">
                                <p className="text-xs font-semibold text-gray-600 mb-1">
                                  Languages:
                                </p>
                                <p className="text-xs text-gray-700">
                                  {therapist.languages.join(', ')}
                                </p>
                              </div>

                              {therapist.fee && (
                                <p className="text-xs text-gray-600 mb-3">
                                  <span className="font-semibold">Fee:</span> ₹{therapist.fee}
                                </p>
                              )}

                              <button
                                className="w-full bg-emerald-600 text-white text-xs py-2 px-3 rounded hover:bg-emerald-700 transition-colors font-medium"
                                onClick={() => navigate(`/therapist/detail/${therapist._id}`)}
                              >
                                View Profile
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                    {msg.suggestionData?.analysis?.safety_flag &&
                      msg.suggestionData.emergency_message && (
                        <div className="ml-11 bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-red-700 font-semibold mb-1">
                                ⚠️ Important Safety Notice
                              </p>
                              <p className="text-xs text-red-600">
                                {msg.suggestionData.emergency_message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      AI
                    </div>
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area / Components */}
            <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
              <div className="max-w-2xl mx-auto">
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
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Start Over
                  </button>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FloatingChatButtonRedesigned;
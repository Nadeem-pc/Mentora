import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { IntakeFormData } from '@/types/dtos/intake-form.dto';

interface IntakeFormProps {
  currentStep: number;
  formData: IntakeFormData;
  onAnswerSelect: (field: keyof IntakeFormData, value: string | undefined) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep: boolean;
}

const IntakeForm: React.FC<IntakeFormProps> = ({
  currentStep,
  formData,
  onAnswerSelect,
  onNext,
  onPrevious,
  isLastStep,
}) => {
  const renderQuestion = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long have you been experiencing these difficulties?
              </h3>
              <p className="text-sm text-gray-600">
                This helps us understand the timeline of what you're going through.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { value: 'few_days', label: 'A few days' },
                { value: 'few_weeks', label: 'A few weeks' },
                { value: 'several_months', label: 'Several months' },
                { value: 'over_a_year', label: 'Over a year' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect('durationOfDifficulties', option.value)}
                  className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                    formData.durationOfDifficulties === option.value
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                  }`}
                >
                  <span className="font-medium text-gray-900">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How much are these difficulties affecting your daily life?
              </h3>
              <p className="text-sm text-gray-600">
                Think about work, studies, relationships, and overall well-being.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { value: 'not_much', label: 'Not much', desc: 'I can manage most things' },
                { value: 'mildly', label: 'Mildly', desc: 'Some areas are affected' },
                { value: 'moderately', label: 'Moderately', desc: 'Several areas are struggling' },
                { value: 'severely', label: 'Severely', desc: 'Most things feel difficult' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect('impactOnDailyLife', option.value)}
                  className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                    formData.impactOnDailyLife === option.value
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Have you ever spoken to a counselor or therapist before?
              </h3>
              <p className="text-sm text-gray-600">
                This helps us understand your therapy background.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect('previousTherapyExperience', option.value)}
                  className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                    formData.previousTherapyExperience === option.value
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                  }`}
                >
                  <span className="font-medium text-gray-900">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        if (formData.previousTherapyExperience !== 'yes') {
          return null;
        }
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How would you describe that experience?
              </h3>
              <p className="text-sm text-gray-600">
                Your feedback helps us match you with the right therapist.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { value: 'mostly_positive', label: 'Mostly positive' },
                { value: 'mostly_negative', label: 'Mostly negative' },
                { value: 'mixed', label: 'Mixed' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect('previousTherapyExperienceQuality', option.value)}
                  className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                    formData.previousTherapyExperienceQuality === option.value
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                  }`}
                >
                  <span className="font-medium text-gray-900">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How comfortable do you feel talking about personal matters right now?
              </h3>
              <p className="text-sm text-gray-600">
                This helps us guide our conversation at the right pace for you.
              </p>
            </div>
            <div className="space-y-2">
              {[
                { value: 'very_comfortable', label: 'Very comfortable', emoji: '😊' },
                { value: 'somewhat_comfortable', label: 'Somewhat comfortable', emoji: '🙂' },
                { value: 'not_very_comfortable', label: 'Not very comfortable', emoji: '😌' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect('comfortLevelInSharing', option.value)}
                  className={`w-full p-3 text-left rounded-xl border-2 transition-all flex items-center gap-3 ${
                    formData.comfortLevelInSharing === option.value
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium text-gray-900">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Which area best describes what you're going through right now?
              </h3>
              <p className="text-sm text-gray-600">
                Select the one that resonates most with you.
              </p>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[
                { value: 'relationship_issues', label: '💑 Relationship issues', desc: 'Partner, family, or friends' },
                { value: 'mood_emotional_concerns', label: '🌧️ Mood or emotional concerns', desc: 'Stress, anxiety, sadness, grief' },
                { value: 'trauma_ptsd', label: '⚡ Trauma or PTSD', desc: 'Past or recent traumatic events' },
                { value: 'work_career_academic', label: '💼 Work, career, or academic pressure', desc: 'Job stress or studies' },
                { value: 'substance_use', label: '🚫 Substance use or addictive behaviors', desc: 'Dependency concerns' },
                { value: 'mental_health_condition', label: '🧠 Mental health condition', desc: 'OCD, Bipolar, Eating Disorder, etc.' },
                { value: 'life_transitions', label: '🌱 Life transitions', desc: 'Moving, divorce, parenthood, major change' },
                { value: 'not_sure', label: '❓ Not sure', desc: 'I just need someone to talk to' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAnswerSelect('primaryAreaOfConcern', option.value)}
                  className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                    formData.primaryAreaOfConcern === option.value
                      ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600'
                  }`}
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCurrentStepAnswered = () => {
    switch (currentStep) {
      case 0:
        return formData.durationOfDifficulties !== null;
      case 1:
        return formData.impactOnDailyLife !== null;
      case 2:
        return formData.previousTherapyExperience !== null;
      case 3:
        return formData.previousTherapyExperience !== 'yes' || formData.previousTherapyExperienceQuality !== undefined;
      case 4:
        return formData.comfortLevelInSharing !== null;
      case 5:
        return formData.primaryAreaOfConcern !== null;
      default:
        return false;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Progress Bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`flex-1 h-1 rounded-full transition-all ${
              step <= currentStep ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="min-h-64">{renderQuestion()}</div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between pt-4">
        <button
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isCurrentStepAnswered()}
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
        >
          {isLastStep ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default IntakeForm;

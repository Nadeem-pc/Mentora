import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { IntakeFormData, FollowUpAnswers } from '@/types/dtos/intake-form.dto';

interface DynamicFollowUpProps {
  primaryArea: IntakeFormData['primaryAreaOfConcern'];
  followUpAnswers: FollowUpAnswers | undefined;
  onAnswerSelect: (path: string, value: string) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const DynamicFollowUp: React.FC<DynamicFollowUpProps> = ({
  primaryArea,
  followUpAnswers,
  onAnswerSelect,
  onComplete,
  onSkip,
}) => {
  const renderFollowUpQuestions = () => {
    switch (primaryArea) {
      case 'relationship_issues':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                💑 Thanks for sharing. Relationships can be complicated sometimes. Let me ask a couple of quick questions.
              </p>
            </div>

            {/* Question 1: Who is this mainly about? */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Who is this mainly about?</h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'partner', label: '💑 Partner' },
                  { value: 'family', label: '👨‍👩‍👧 Family member' },
                  { value: 'friend', label: '👫 Friend' },
                  { value: 'multiple', label: '👥 Multiple people' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('relationshipIssues.mainFocus', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.relationshipIssues?.mainFocus === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Issue Type */}
            {followUpAnswers?.relationshipIssues?.mainFocus && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Is this concern more about…</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'communication', label: '💬 Communication issues' },
                    { value: 'trust', label: '🔒 Trust or boundaries' },
                    { value: 'conflict', label: '⚔️ Conflict or frequent arguments' },
                    { value: 'emotional_distance', label: '📏 Emotional distance' },
                    { value: 'breakup', label: '💔 Breakup or separation' },
                    { value: 'not_sure', label: "❓ Not sure / It's complicated" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('relationshipIssues.issueType', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.relationshipIssues?.issueType === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Intensity */}
            {followUpAnswers?.relationshipIssues?.issueType && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How intense does this feel for you right now?</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: '🟢 Low', desc: 'Manageable, occasional concern' },
                    { value: 'medium', label: '🟡 Medium', desc: 'Regularly on my mind' },
                    { value: 'high', label: '🔴 High', desc: 'Very distressing, affecting daily life' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('relationshipIssues.intensity', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.relationshipIssues?.intensity === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'substance_use':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                🚫 Thank you for being honest about this. Reaching out about substance use or addictive patterns is a really strong step.
              </p>
            </div>

            {/* Question 1: Substance / behavior type */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  What are you mainly concerned about?
                </h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'alcohol', label: '🍷 Alcohol' },
                  { value: 'drugs', label: '💊 Drugs or medication' },
                  { value: 'behavioral_addiction', label: '📱/🎮 Behavioural habits (gaming, phone, gambling, etc.)' },
                  { value: 'other', label: '❓ Something else' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('substanceUse.substanceType', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.substanceUse?.substanceType === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Level of support desired */}
            {followUpAnswers?.substanceUse?.substanceType && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    What kind of support are you hoping for?
                  </h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'awareness', label: '👀 Just understanding my patterns better' },
                    { value: 'reduction', label: '📉 Cutting down or gaining more control' },
                    { value: 'recovery', label: '🛟 Recovery and long-term change' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('substanceUse.supportLevel', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.substanceUse?.supportLevel === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'mental_health_condition':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                🧠 Thanks for sharing this. Living with a specific mental health condition can be a lot to carry—you're not alone in this.
              </p>
            </div>

            {/* Question 1: Type of condition */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Which of these sounds closest to what you're dealing with?
                </h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'ocd', label: '🌀 OCD or obsessive thoughts/rituals' },
                  { value: 'bipolar', label: '⚖️ Bipolar or strong mood swings' },
                  { value: 'eating_disorder', label: '🥗 Eating-related difficulties' },
                  { value: 'personality', label: '🧩 Personality-related difficulties' },
                  { value: 'other', label: '❓ Something else / not sure' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('mentalHealthCondition.condition', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.mentalHealthCondition?.condition === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Duration */}
            {followUpAnswers?.mentalHealthCondition?.condition && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    How long has this been a concern for you?
                  </h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'less_than_6_months', label: '🕒 Less than 6 months' },
                    { value: 'six_to_twelve_months', label: '📆 6–12 months' },
                    { value: 'one_to_three_years', label: '📅 1–3 years' },
                    { value: 'more_than_three_years', label: '🗓️ More than 3 years' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('mentalHealthCondition.duration', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.mentalHealthCondition?.duration === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Current treatment */}
            {followUpAnswers?.mentalHealthCondition?.duration && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Are you currently seeing a psychiatrist or therapist for this?
                  </h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'yes', label: '✅ Yes, I am in treatment' },
                    { value: 'no', label: '🧭 Not right now' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('mentalHealthCondition.currentTreatment', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.mentalHealthCondition?.currentTreatment === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'mood_emotional_concerns':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                🌧️ Thank you for opening up. Emotional challenges are very real, and support can make a real difference. Let's explore this together.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What's affecting you most?</h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'stress', label: '😰 Stress' },
                  { value: 'anxiety', label: '😟 Anxiety' },
                  { value: 'sadness', label: '😢 Sadness' },
                  { value: 'grief', label: '💔 Grief' },
                  { value: 'other', label: '❓ Other' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('moodConcerns.specificConcern', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.moodConcerns?.specificConcern === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {followUpAnswers?.moodConcerns?.specificConcern && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How intense does this feel?</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: '🟢 Low', desc: 'Manageable most days' },
                    { value: 'medium', label: '🟡 Medium', desc: 'Affects my daily routine' },
                    { value: 'high', label: '🔴 High', desc: 'Very overwhelming' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('moodConcerns.intensity', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.moodConcerns?.intensity === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'trauma_ptsd':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                ⚡ Thank you for trusting us with this. Trauma recovery is possible, and you deserve compassionate, specialized support.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What kind of support would help you most right now?</h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'urgent', label: '🚨 Urgent support needed' },
                  { value: 'soon', label: '⏰ I need support soon' },
                  { value: 'flexible', label: '📅 Flexible timeline' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('traumaPtsd.timelinessOfSupport', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.traumaPtsd?.timelinessOfSupport === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'work_career_academic':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                💼 Career and academic pressures are real. A therapist can help you navigate stress and build resilience.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What's the main challenge?</h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'career_change', label: '🔄 Career change or transition' },
                  { value: 'job_stress', label: '😤 Job stress or burnout' },
                  { value: 'academic_pressure', label: '📚 Academic pressure' },
                  { value: 'performance_anxiety', label: '😰 Performance anxiety' },
                  { value: 'other', label: '❓ Other' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('workConcerns.workType', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.workConcerns?.workType === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {followUpAnswers?.workConcerns?.workType && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How much is this affecting you?</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'low', label: '🟢 Low', desc: 'Occasional concern' },
                    { value: 'medium', label: '🟡 Medium', desc: 'Regular impact' },
                    { value: 'high', label: '🔴 High', desc: 'Significantly affecting my life' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('workConcerns.intensity', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.workConcerns?.intensity === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'life_transitions':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                🌱 Life transitions can be challenging, even when they're positive. Support during these times can help you navigate change with confidence.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">What transition are you going through?</h4>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'moving', label: '🏠 Moving to a new place' },
                  { value: 'divorce', label: '💔 Divorce or separation' },
                  { value: 'parenthood', label: '👶 Becoming a parent' },
                  { value: 'retirement', label: '🎯 Retirement' },
                  { value: 'loss', label: '🕊️ Loss or grief' },
                  { value: 'other', label: '❓ Other major change' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onAnswerSelect('lifeTransitions.transitionType', option.value)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      followUpAnswers?.lifeTransitions?.transitionType === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {followUpAnswers?.lifeTransitions?.transitionType && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How ready do you feel for this change?</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { value: 'prepared', label: '✅ Prepared and ready' },
                    { value: 'uncertain', label: '🤔 Uncertain' },
                    { value: 'overwhelmed', label: '😰 Overwhelmed' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onAnswerSelect('lifeTransitions.readinessForChange', option.value)}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                        followUpAnswers?.lifeTransitions?.readinessForChange === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'not_sure':
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-800">
                ❓ That's completely okay! Sometimes it's hard to put feelings into words. A good therapist can help you explore and understand what you're experiencing.
              </p>
            </div>
            <p className="text-gray-700">
              Let's move forward with finding you a supportive therapist who can help you work through whatever you're facing.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const isFollowUpComplete = () => {
    if (primaryArea === 'not_sure') return true;
    if (primaryArea === 'relationship_issues') {
      return (
        followUpAnswers?.relationshipIssues?.mainFocus &&
        followUpAnswers?.relationshipIssues?.issueType &&
        followUpAnswers?.relationshipIssues?.intensity
      );
    }
    if (primaryArea === 'mood_emotional_concerns') {
      return (
        followUpAnswers?.moodConcerns?.specificConcern &&
        followUpAnswers?.moodConcerns?.intensity
      );
    }
    if (primaryArea === 'trauma_ptsd') {
      return followUpAnswers?.traumaPtsd?.timelinessOfSupport;
    }
    if (primaryArea === 'work_career_academic') {
      return (
        followUpAnswers?.workConcerns?.workType &&
        followUpAnswers?.workConcerns?.intensity
      );
    }
    if (primaryArea === 'substance_use') {
      return (
        followUpAnswers?.substanceUse?.substanceType &&
        followUpAnswers?.substanceUse?.supportLevel
      );
    }
    if (primaryArea === 'mental_health_condition') {
      return (
        followUpAnswers?.mentalHealthCondition?.condition &&
        followUpAnswers?.mentalHealthCondition?.duration &&
        followUpAnswers?.mentalHealthCondition?.currentTreatment
      );
    }
    if (primaryArea === 'life_transitions') {
      return (
        followUpAnswers?.lifeTransitions?.transitionType &&
        followUpAnswers?.lifeTransitions?.readinessForChange
      );
    }
    return true;
  };

  return (
    <div className="w-full space-y-6">
      {/* Progress indicator */}
      <div className="text-sm text-gray-600 font-medium">
        Step 2 of 3: Understanding Your Situation
      </div>

      {/* Questions */}
      <div className="min-h-64">{renderFollowUpQuestions()}</div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 justify-between pt-4">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Skip
        </button>
        <button
          onClick={onComplete}
          disabled={!isFollowUpComplete()}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
        >
          Continue
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DynamicFollowUp;

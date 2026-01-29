export interface IntakeFormData {
  durationOfDifficulties: 'few_days' | 'few_weeks' | 'several_months' | 'over_a_year' | null;
  impactOnDailyLife: 'not_much' | 'mildly' | 'moderately' | 'severely' | null;
  previousTherapyExperience: 'yes' | 'no' | null;
  previousTherapyExperienceQuality?: 'mostly_positive' | 'mostly_negative' | 'mixed' | 'prefer_not_to_say';
  comfortLevelInSharing: 'very_comfortable' | 'somewhat_comfortable' | 'not_very_comfortable' | null;
  primaryAreaOfConcern: PrimaryAreaOfConcern | null;
  followUpAnswers?: FollowUpAnswers;
}

export type PrimaryAreaOfConcern =
  | 'relationship_issues'
  | 'mood_emotional_concerns'
  | 'trauma_ptsd'
  | 'work_career_academic'
  | 'substance_use'
  | 'mental_health_condition'
  | 'life_transitions'
  | 'not_sure';

export interface FollowUpAnswers {
  relationshipIssues?: RelationshipFollowUp;
  moodConcerns?: MoodFollowUp;
  traumaPtsd?: TraumaFollowUp;
  workConcerns?: WorkFollowUp;
  substanceUse?: SubstanceFollowUp;
  mentalHealthCondition?: MentalHealthFollowUp;
  lifeTransitions?: LifeTransitionsFollowUp;
}

export interface RelationshipFollowUp {
  mainFocus: 'partner' | 'family' | 'friend' | 'multiple' | null;
  issueType: 'communication' | 'trust' | 'conflict' | 'emotional_distance' | 'breakup' | 'not_sure' | null;
  intensity: 'low' | 'medium' | 'high' | null;
}

export interface MoodFollowUp {
  specificConcern: 'stress' | 'anxiety' | 'sadness' | 'grief' | 'other' | null;
  duration: string;
  intensity: 'low' | 'medium' | 'high' | null;
}

export interface TraumaFollowUp {
  traumaType: 'single_event' | 'ongoing' | 'childhood' | 'recent' | null;
  timelinessOfSupport: 'urgent' | 'soon' | 'flexible' | null;
}

export interface WorkFollowUp {
  workType: 'career_change' | 'job_stress' | 'academic_pressure' | 'performance_anxiety' | 'other' | null;
  intensity: 'low' | 'medium' | 'high' | null;
}

export interface SubstanceFollowUp {
  substanceType: 'alcohol' | 'drugs' | 'behavioral_addiction' | 'other' | null;
  supportLevel: 'awareness' | 'reduction' | 'recovery' | null;
}

export interface MentalHealthFollowUp {
  condition: string;
  duration: string;
  currentTreatment: 'yes' | 'no' | null;
}

export interface LifeTransitionsFollowUp {
  transitionType: 'moving' | 'divorce' | 'parenthood' | 'retirement' | 'loss' | 'other' | null;
  readinessForChange: 'prepared' | 'uncertain' | 'overwhelmed' | null;
}

// Booking Flow Data
export interface BookingPreferences {
  budget: 'under_1500' | '1500_2000' | 'over_2000' | null;
  availability: AvailabilityWindow[];
}

export type AvailabilityWindow =
  | 'weekday_mornings'
  | 'weekday_evenings'
  | 'weekend_mornings'
  | 'weekend_afternoons'
  | 'any_time';

export interface BookingConfirmation {
  therapistId: string;
  therapistName: string;
  appointmentDateTime: string;
  mode: 'video' | 'in_person';
  sessionFee: number;
}

// Complete Client Intake Submission
export interface ClientIntakeSubmission {
  intakeForm: IntakeFormData;
  bookingPreferences?: BookingPreferences;
  timestamp: string;
}

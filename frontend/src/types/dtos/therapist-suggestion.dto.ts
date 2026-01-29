export interface TherapistCategory {
  key: string;
  label: string;
}

export interface TherapistUrgency {
  level: "low" | "medium" | "high" | "crisis";
  reason: string;
}

export interface SuggestedTherapist {
  _id: string;
  name: string;
  specializations: string[];
  experienceYears: number;
  languages: string[];
  matchScore: number;
  fee?: string;
  about?: string;
}

export interface TherapistSuggestionResponse {
  off_topic?: boolean;
  message?: string;
  analysis?: {
    categories: TherapistCategory[];
    urgency: TherapistUrgency;
    summary: string;
    safety_flag: boolean;
    safety_note?: string;
  };
  therapists?: SuggestedTherapist[];
  explanation?: string;
  emergency_message?: string;
}
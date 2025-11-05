export interface JobApplicationListDTO {
  _id: string;
  applicantName: string;
  experience: string;
  appliedDate: Date;
  specializations: string[];
  approvalStatus: 'Requested' | 'Approved' | 'Rejected';
}

export interface JobApplicationDetailDTO {
  _id: string;
  applicantName: string;
  email: string;
  phone: string;
  gender: string;
  experience: string;
  fee: string;
  qualification: string;
  specializations: string[];
  languages: string[];
  about: string;
  profileImg: string | null;
  resume: string | null;
  certifications: string[];
  approvalStatus: 'Requested' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdAt: Date;
}

export interface ApplicationStatsDTO {
  total: number;
  requested: number;
  approved: number;
  rejected: number;
}

export interface ApplicationFiltersDTO {
  page: number;
  limit: number;
  search: string;
  status: string;
  specialization: string;
  experienceRange: string;
}

export interface ApplicationsListResponseDTO {
  applications: JobApplicationListDTO[];
  currentPage: number;
  totalPages: number;
  totalApplications: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  stats: ApplicationStatsDTO;
  specializations: string[];
}
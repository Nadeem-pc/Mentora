export interface JobApplicationDTO {
  _id: string;
  applicantName: string;
  experience: string;
  appliedDate: string;
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

export interface PaginationDTO {
  currentPage: number;
  totalPages: number;
  totalApplications: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApplicationsResponseDTO {
  success: boolean;
  data: JobApplicationDTO[];
  pagination: PaginationDTO;
  stats: ApplicationStatsDTO;
  specializations: string[];
}

export interface ApplicationDetailResponseDTO {
  success: boolean;
  application: JobApplicationDetailDTO;
}
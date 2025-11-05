import { 
  ApplicationFiltersDTO, 
  ApplicationsListResponseDTO, 
  JobApplicationDetailDTO 
} from "@/dtos/job-application.dto";
import { ITherapistModel } from "@/models/interface/therapist.model.interface";

export interface IJobApplicationService {
  listApplications(filters: ApplicationFiltersDTO): Promise<ApplicationsListResponseDTO>;

  getApplicationDetails(applicationId: string): Promise<JobApplicationDetailDTO>;

  updateApplicationStatus(
    applicationId: string,
    status: 'Approved' | 'Rejected',
    reason?: string
  ): Promise<ITherapistModel | null>;
}
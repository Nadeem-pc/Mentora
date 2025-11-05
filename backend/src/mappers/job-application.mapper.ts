import { ITherapistModel } from "@/models/interface/therapist.model.interface";
import { JobApplicationListDTO, JobApplicationDetailDTO } from "@/dtos/job-application.dto";

export class JobApplicationMapper {
    static toListDTO(therapist: ITherapistModel): JobApplicationListDTO {
        return {
            _id: therapist._id?.toString() || '',
            applicantName: `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim(),
            experience: therapist.experience || 'Not specified',
            appliedDate: therapist.createdAt || new Date(),
            specializations: therapist.specializations || [],
            approvalStatus: (therapist.approvalStatus || 'Requested') as 'Requested' | 'Approved' | 'Rejected',
        };
    }

    static toDetailDTO(therapist: ITherapistModel): JobApplicationDetailDTO {
        return {
            _id: therapist._id?.toString() || '',
            applicantName: `${therapist.firstName || ''} ${therapist.lastName || ''}`.trim(),
            email: therapist.email || '',
            phone: therapist.phone || 'Not provided',
            gender: therapist.gender || 'Not specified',
            experience: therapist.experience || 'Not specified',
            fee: therapist.fee || '0',
            qualification: therapist.qualification || 'Not specified',
            specializations: therapist.specializations || [],
            languages: therapist.languages || [],
            about: therapist.about || 'No description provided',
            profileImg: therapist.profileImg || null,
            resume: therapist.resume || null,
            certifications: therapist.certifications || [],
            approvalStatus: (therapist.approvalStatus || 'Requested') as 'Requested' | 'Approved' | 'Rejected',
            rejectionReason: therapist.rejectionReason,
            createdAt: therapist.createdAt || new Date()
        };
    }

    static toListDTOs(therapists: ITherapistModel[]): JobApplicationListDTO[] {
        return therapists.map((therapist) => this.toListDTO(therapist));
    }

    static toDetailDTOs(therapists: ITherapistModel[]): JobApplicationDetailDTO[] {
        return therapists.map((therapist) => this.toDetailDTO(therapist));
    }
}
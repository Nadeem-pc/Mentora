import { ITherapistRepository } from "@/repositories/interface/ITherapistRepository";
import { IJobApplicationService } from "../interface/IJobsService";
import { ITherapistModel } from "@/models/interface/therapist.model.interface";
import { createHttpError } from "@/utils/http-error.util";
import { HttpStatus } from "@/constants/status.constant";
import { HttpResponse } from "@/constants/response-message.constant";

interface ApplicationFilters {
    page: number;
    limit: number;
    search: string;
    status: string;
    specialization: string;
    experienceRange: string;
}

export class JobApplicationService implements IJobApplicationService {
    constructor(private readonly _therapistRepository: ITherapistRepository) {};

    listApplications = async (filters: ApplicationFilters) => {
        try {
            const { page, limit, search, status, specialization, experienceRange } = filters;

            const query: any = {
                role: 'therapist',
                approvalStatus: { $ne: 'Pending' }
            };

            if (search && search.trim()) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { specializations: { $elemMatch: { $regex: search, $options: 'i' } } }
                ];
            }

            if (status && status !== 'All') {
                query.approvalStatus = status;
            }

            if (specialization && specialization !== 'All') {
                query.specializations = specialization;
            }

            if (experienceRange && experienceRange !== 'All') {
                const experienceRegex = this.getExperienceRegex(experienceRange);
                if (experienceRegex) {
                    query.experience = experienceRegex;
                }
            }

            const totalApplications = await this._therapistRepository.countDocuments(query);

            const totalPages = Math.ceil(totalApplications / limit) || 1;
            const skip = (page - 1) * limit;

            const applications = await this._therapistRepository.findWithPagination(
                query,
                skip,
                limit,
                { createdAt: -1 }
            );


            let stats;
            try {
                stats = await this._therapistRepository.getApplicationStats();
            } catch (error) {
                console.error('Error fetching stats:', error);
                stats = {
                    total: 0,
                    requested: 0,
                    approved: 0,
                    rejected: 0
                };
            }

            let allTherapists: ITherapistModel[] = [];
            try {
                allTherapists = await this._therapistRepository.findAllTherapists();
            } catch (error) {
                console.error('Error fetching all therapists:', error);
            }
            
            const specializationsSet = new Set<string>();
            allTherapists.forEach((app: ITherapistModel) => {
                if (app.specializations && Array.isArray(app.specializations)) {
                    app.specializations.forEach((spec: string) => {
                        if (spec && spec.trim()) {
                            specializationsSet.add(spec);
                        }
                    });
                }
            });

            const result = {
                applications: applications.map(app => ({
                    _id: app._id?.toString() || '',
                    applicantName: `${app.firstName || ''} ${app.lastName || ''}`.trim(),
                    email: app.email || '',
                    phone: app.phone || 'Not provided',
                    experience: app.experience || 'Not specified',
                    appliedDate: app.createdAt || new Date(),
                    approvalStatus: app.approvalStatus || 'Requested',
                    specializations: app.specializations || [],
                    profileImg: app.profileImg || null,
                    gender: app.gender,
                    fee: app.fee,
                    qualification: app.qualification,
                    languages: app.languages,
                    about: app.about,
                    resume: app.resume,
                    certifications: app.certifications 
                })),
                currentPage: page,
                totalPages: totalPages,
                totalApplications: totalApplications,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                stats: stats,
                specializations: ['All', ...Array.from(specializationsSet).sort()]
            };

            return result;
            
        } catch (error) {
            console.error('Error in listApplications service:', error);
            throw error;
        }
    };

    getApplicationDetails = async (applicationId: string) => {
        if(!applicationId){
            throw createHttpError(HttpStatus.BAD_REQUEST, HttpResponse.INVALID_CREDENTIALS);
        }
        const application = await this._therapistRepository.findById(applicationId);

        if (!application) {
            throw createHttpError(HttpStatus.NOT_FOUND, HttpResponse.USER_NOT_FOUND);
        }
        return application;
    };

    updateApplicationStatus = async (
        applicationId: string, 
        status: 'Approved' | 'Rejected',
        reason?: string
    ): Promise<ITherapistModel | null> => {
        try {
            const existingApplication = await this._therapistRepository.findById(applicationId);

            if (!existingApplication) {
                throw createHttpError(HttpStatus.NOT_FOUND, 'Application not found');
            }

            if (existingApplication.approvalStatus !== 'Requested') {
                throw createHttpError(
                    HttpStatus.CONFLICT, 
                    `Application has already been ${existingApplication.approvalStatus.toLowerCase()}`
                );
            }

            const updateData: any = {
                approvalStatus: status
            };

            if (status === 'Rejected' && reason) {
                updateData.rejectionReason = reason;
            }

            const updatedApplication = await this._therapistRepository.updateTherapistProfile(
                applicationId,
                updateData
            );

            if (!updatedApplication) {
                throw createHttpError(HttpStatus.NOT_FOUND, 'Failed to update application');
            }

            return updatedApplication;

        } catch (error) {
            console.error('Error updating application status:', error);
            throw error;
        }
    };

    private getExperienceRegex(range: string): any {
        switch (range) {
            case '0-2':
                return { $regex: '^[0-2]', $options: 'i' };
            case '3-5':
                return { $regex: '^[3-5]', $options: 'i' };
            case '6-10':
                return { $regex: '^([6-9]|10)', $options: 'i' };
            case '10+':
                return { $regex: '^([1-9][0-9]|[1-9][0-9]+)', $options: 'i' };
            default:
                return null;
        }
    }
}
import { IJobApplicationService } from "@/services/admin/interface/IJobsService";
import { IJobApplicationController } from "../interface/IJobsController";
import { NextFunction, Request, Response } from "express";
import logger from "@/config/logger.config";
import { HttpResponse } from "@/constants/response-message.constant";
import { HttpStatus } from "@/constants/status.constant";
import { ApplicationFiltersDTO } from "@/dtos/job-application.dto";

export class JobApplicationController implements IJobApplicationController {
    constructor(private readonly _jobApplicationService: IJobApplicationService) {}

    listApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { 
                page = 1, 
                limit = 8, 
                search = '', 
                status = 'All',
                specialization = 'All',
                experienceRange = 'All'
            } = req.query;

            const filters: ApplicationFiltersDTO = {
                page: Number(page),
                limit: Number(limit),
                search: String(search),
                status: String(status),
                specialization: String(specialization),
                experienceRange: String(experienceRange)
            };

            const result = await this._jobApplicationService.listApplications(filters);

            const response = {
                success: true,
                data: result.applications,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalApplications: result.totalApplications,
                    hasNextPage: result.hasNextPage,
                    hasPrevPage: result.hasPrevPage
                },
                stats: result.stats,
                specializations: result.specializations
            };

            res.status(HttpStatus.OK).json(response);
            
        } catch (error: unknown) {
            logger.error(error);
            next(error);
        }
    };

    getApplicationDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { applicationId } = req.params;
            const application = await this._jobApplicationService.getApplicationDetails(applicationId);
            res.status(HttpStatus.OK).json({ success: true, application });
        } catch (error: unknown) {
            logger.error(error);
            next(error);
        }
    };

    updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            if (!status || !['Approved', 'Rejected'].includes(status)) {
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    success: false,
                    message: HttpResponse.INVALID_STATUS
                });
                return;
            }

            if (status === 'Rejected' && (!reason || !reason.trim())) {
                res.status(HttpStatus.BAD_REQUEST).json({ 
                    success: false,
                    message: HttpResponse.REJECTION_REASON_NOT_PROVIDED 
                });
                return;
            }

            const updatedApplication = await this._jobApplicationService.updateApplicationStatus(
                id,
                status,
                status === 'Rejected' ? reason : undefined
            );

            if (!updatedApplication) {
                res.status(HttpStatus.NOT_FOUND).json({ 
                    success: false,
                    message: HttpResponse.APPLICATION_NOT_FOUND 
                });
                return;
            }

            res.status(HttpStatus.OK).json({ 
                success: true,
                message: `Application ${status.toLowerCase()} successfully`,
                data: updatedApplication
            });

        } catch (error: unknown) {
            logger.error('Error updating application status:', error);
            if (error.statusCode === HttpStatus.CONFLICT) {
                res.status(HttpStatus.CONFLICT).json({
                    success: false,
                    message: error.message || 'Application has already been processed'
                });
                return;
            }
            next(error);
        }
    };
}
import { TherapistDetails } from "@/models/implementation/therapist.model";
import { BaseRepository } from "../base.repository";
import { ITherapistRepository } from "../interface/ITherapistRepository";
import { ITherapistModel } from "@/models/interface/therapist.model.interface";
import { FilterQuery, Types } from "mongoose";
import logger from "@/config/logger.config";

export class TherapistRepository extends BaseRepository<ITherapistModel> implements ITherapistRepository {
    constructor() {
        super(TherapistDetails);
    }

    async updateTherapistProfile(
        id: string | Types.ObjectId, 
        updateData: Partial<ITherapistModel>
    ): Promise<ITherapistModel | null> {
        try {
            const objectId = typeof id === 'string' ? new Types.ObjectId(id) : id;
            
            const exists = await this.findById(objectId);
            if (!exists) {
                throw new Error(`Therapist with id ${id} not found`);
            }
            
            const updated = await this.findByIDAndUpdate(objectId, updateData);
            return updated;
        } catch (error) {
            console.error('Repository update error:', error);
            throw error;
        }
    }

    async findTherapistById(id: string): Promise<ITherapistModel | null> {
        try {
            return await this.findById(new Types.ObjectId(id));
        } catch (error) {
            logger.error(error);
            throw new Error("Error while finding user by Id");
        }
    }

    async findWithPagination(
        filter: FilterQuery<ITherapistModel>,
        skip: number,
        limit: number,
        sort: any
    ): Promise<ITherapistModel[]> {
        return this.model.find(filter).sort(sort).skip(skip).limit(limit).exec();
    }

    async countDocuments(filter: FilterQuery<ITherapistModel>): Promise<number> {
        return this.model.countDocuments(filter).exec();
    }

    async findAllTherapists(): Promise<ITherapistModel[]> {
        return this.model.find({ 
            role: 'therapist',
            approvalStatus: { $ne: 'Pending' }
        }).exec();
    }

    async findApprovedTherapists(): Promise<ITherapistModel[]> {
        try {
            return await this.model.find({ 
                role: 'therapist',
                approvalStatus: 'Approved',
                status: 'Active'
            }).exec();
        } catch (error) {
            logger.error("Error in findApprovedTherapists:", error);
            throw new Error("Error while fetching approved therapists");
        }
    }

    async getApplicationStats(): Promise<any> {
        try {
            const stats = await this.model.aggregate([
                {
                    $match: {
                        role: 'therapist',
                        approvalStatus: { $ne: 'Pending' }
                    }
                },
                {
                    $group: {
                        _id: '$approvalStatus',
                        count: { $sum: 1 }
                    }
                }
            ]).exec();

            const total = await this.model.countDocuments({ 
                role: 'therapist',
                approvalStatus: { $ne: 'Pending' } 
            }).exec();
            
            const statsMap: any = {
                total: total || 0,
                requested: 0,
                approved: 0,
                rejected: 0
            };

            if (stats && Array.isArray(stats)) {
                stats.forEach((stat: any) => {
                    if (stat._id) {
                        const status = stat._id.toLowerCase();
                        statsMap[status] = stat.count || 0;
                    }
                });
            }

            return statsMap;
            
        } catch (error) {
            console.error('Error in getApplicationStats:', error);
            return {
                total: 0,
                requested: 0,
                approved: 0,
                rejected: 0
            };
        }
    }
}
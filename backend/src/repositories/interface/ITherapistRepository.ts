import { ITherapistModel } from "@/models/interface/therapist.model.interface";
import { FilterQuery, Types } from "mongoose";

export interface ITherapistRepository {
    updateTherapistProfile(id: string | Types.ObjectId, updateData: Partial<ITherapistModel>): Promise<ITherapistModel | null>;
    findTherapistById(id: string): Promise<ITherapistModel | null>;
    findById(id: Types.ObjectId): Promise<ITherapistModel | null>;
    findOne(filter: FilterQuery<ITherapistModel>): Promise<ITherapistModel | null>;
    findAll(): Promise<ITherapistModel[]>;
    findWithPagination(filter: FilterQuery<ITherapistModel>, skip: number, limit: number, sort: any): Promise<ITherapistModel[]>;
    countDocuments(filter: FilterQuery<ITherapistModel>): Promise<number>;
    findAllTherapists(): Promise<ITherapistModel[]>;
    findApprovedTherapists(): Promise<ITherapistModel[]>;
    getApplicationStats(): Promise<any>;
}
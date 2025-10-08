import { ISlotModel } from "@/models/interface/slot.model.interface";

export interface ISlotRepository {
    create(data: Partial<ISlotModel>): Promise<ISlotModel>;
    findOne(filter: any): Promise<ISlotModel | null>;
    findById(id: string): Promise<ISlotModel | null>;
    find(filter: any): Promise<ISlotModel[]>;
    update(id: string, data: Partial<ISlotModel>): Promise<ISlotModel | null>;
    delete(id: string): Promise<ISlotModel | null>;
    findByTherapistId(therapistId: string): Promise<ISlotModel[]>;
}
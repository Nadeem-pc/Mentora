import { ISlotModel } from "@/models/interface/slot.model.interface";
import { BaseRepository } from "../base.repository";
import { ISlotRepository } from "../interface/ISlotRepository";
import Slot from "@/models/implementation/slot.model";

export class SlotRepository extends BaseRepository<ISlotModel> implements ISlotRepository {
    constructor() {
        super(Slot);
    }

    async create(data: Partial<ISlotModel>): Promise<ISlotModel> {
        const slot = await this.model.create(data);
        return slot;
    }

    async findOne(filter: any): Promise<ISlotModel | null> {
        const slot = await this.model.findOne(filter);
        return slot;
    }

    async findById(id: string): Promise<ISlotModel | null> {
        const slot = await this.model.findById(id);
        return slot;
    }

    async find(filter: any): Promise<ISlotModel[]> {
        const slots = await this.model.find(filter);
        return slots;
    }

    async update(id: string, data: Partial<ISlotModel>): Promise<ISlotModel | null> {
        const slot = await this.model.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
        return slot;
    }

    async delete(id: string): Promise<ISlotModel | null> {
        const slot = await this.model.findByIdAndDelete(id);
        return slot;
    }

    async findByTherapistId(therapistId: string): Promise<ISlotModel[]> {
        const slots = await this.model.find({ therapistId }).sort({ time: 1 }).lean();
        return slots;
    }

    async findConflictingSlot(
        therapistId: string, 
        time: string, 
        excludeId?: string
    ): Promise<ISlotModel | null> {
            const filter: any = {
            therapistId,
            time
        };

        if (excludeId) {
            filter._id = { $ne: excludeId };
        }

        const slot = await this.model.findOne(filter);
        return slot;
     
    }

    async getTherapistSlotTimes(therapistId: string): Promise<string[]> {
        const slots = await this.model.find({ therapistId }).distinct('time');
        return slots;
    }

    async createMany(data: Partial<ISlotModel>[]): Promise<ISlotModel[]> {
        const slots = await this.model.insertMany(data);
        return slots;
    }

    async deleteMany(filter: any): Promise<number> {
        const result = await this.model.deleteMany(filter);
        return result.deletedCount || 0;
    }
}
import {
    Document,
    Model,
    FilterQuery,
    UpdateQuery,
    DeleteResult,
    Types,
    UpdateWriteOpResult,
    // isObjectIdOrHexString,
} from "mongoose";

export abstract class BaseRepository<T extends Document> {
    constructor(protected model: Model<T>) {
    }

    async findById(id: Types.ObjectId): Promise<T | null> {
        return this.model.findById(id);
    }

    async findByIdAndUpdate(id: Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, { upsert: true, new: true });
    }

    async findAll(): Promise<T[]> {
        return this.model.find()
    }

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return document.save();
    }

    async update(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async updateOne(
        filter: FilterQuery<T>,
        update: UpdateQuery<T>
    ): Promise<UpdateWriteOpResult> {
        return this.model.updateOne(filter, update);
    }

    async delete(id: Types.ObjectId): Promise<T | null> {
        return this.model.findByIdAndDelete(id);
    }

    async deleteOne(filter: FilterQuery<T>): Promise<DeleteResult> {
        return this.model.deleteOne(filter);
    }

    async find(filter: FilterQuery<T>): Promise<T[]> {
        return this.model.find(filter);
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter);
    }

    async findByUsernameOrEmail(value: string): Promise<T | null> {
        const filter: FilterQuery<T> = {
            $or: [{ email: value }, { username: value }]
        }

        return this.model.findOne(filter);
    }

    async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T> {
        return this.model.findOneAndUpdate(filter, update, { upsert: true, new: true });
    }

    async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOneAndDelete(filter);
    }

    async addToSet(id: string, field: string, value: unknown): Promise<T | null> {
        // if(!isObjectIdOrHexString(id)){

        // }
        const updatedDocument = await this.model.findByIdAndUpdate(
            id,
            { $addToSet: { [field]: value } } as UpdateQuery<T>,
            { new: true }
        );
        return updatedDocument as unknown as T | null;
    }

    async pull(id: string, field: string, value: unknown): Promise<T | null> {
        const updatedDocument = await this.model.findByIdAndUpdate(
            id,
            { $pull: { [field]: value } } as UpdateQuery<T>,
            { new: true }
        );
        return updatedDocument as unknown as T | null;
    }
}
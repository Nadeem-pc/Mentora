import { Document, FilterQuery, Model, Types, UpdateQuery } from "mongoose";

export abstract class BaseRepository<T extends Document> {
    constructor(protected model: Model<T>) {}

    async findById(id: Types.ObjectId): Promise<T | null> {
        return this.model.findById(id);
    }

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return document.save();
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null>{
        return this.model.findOne(filter);
    }

    async find(filter: any = {}): Promise<T[]> {
        const documents = await this.model.find(filter);
        return documents;
    }

    async update(id: string, data: Partial<T>): Promise<T | null> {
        const document = await this.model.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
        return document;
    }

    async delete(id: string): Promise<T | null> {
        const document = await this.model.findByIdAndDelete(id);
        return document;
    }

    async exists(filter: any): Promise<boolean> {
        const document = await this.model.findOne(filter);
        return !!document;
    }


    async findAll(): Promise<T[]> {
        return this.model.find();
    }

    async findByIDAndUpdate(id: Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, update, {
            new: true,
            runValidators: true,
        });
    }

    async findWithPagination(filter: FilterQuery<T>, skip: number, limit: number, sort: any): Promise<T[]> {
        return this.model.find(filter).sort(sort).skip(skip).limit(limit);
    }

    async countDocuments(filter: FilterQuery<T>): Promise<number> {
        return this.model.countDocuments(filter);
    }
}
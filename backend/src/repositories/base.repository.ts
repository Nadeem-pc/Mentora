import {
    Document,
    FilterQuery,
    Model,
    Types,
} from "mongoose";

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

    async findAll(): Promise<T[]> {
        return this.model.find()
    }
};
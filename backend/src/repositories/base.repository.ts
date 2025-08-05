import {
    Document,
    FilterQuery,
    Model,
} from "mongoose";

export abstract class BaseRepository<T extends Document> {
    constructor(protected model: Model<T>) {}

    async create(data: Partial<T>): Promise<T> {
        const document = new this.model(data);
        return document.save();
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null>{
        return this.model.findOne(filter);
    }
};
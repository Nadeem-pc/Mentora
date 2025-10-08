import { IWalletModel } from "@/models/interface/wallet.model.interface";
import { BaseRepository } from "../base.repository";
import Wallet from "@/models/implementation/wallet.model";
import { Types } from "mongoose";
import logger from "@/config/logger.config";
import { IWalletRepository } from "../interface/IWalletRepository";

export class WalletRepository extends BaseRepository<IWalletModel> implements IWalletRepository {
    constructor() {
        super(Wallet);
    }

    async findByOwner(ownerId: string, ownerType: string): Promise<IWalletModel | null> {
        try {
            // For admin, use the string directly, otherwise convert to ObjectId
            const query = ownerType === 'admin' 
                ? { ownerId: ownerId, ownerType }
                : { ownerId: new Types.ObjectId(ownerId), ownerType };
            
            return await this.model.findOne(query);
        } catch (error) {
            logger.error('Error finding wallet by owner:', error);
            throw new Error("Error finding wallet");
        }
    }

    async createWallet(ownerId: string, ownerType: string): Promise<IWalletModel> {
        try {
            // For admin, use the string directly, otherwise convert to ObjectId
            const walletData = ownerType === 'admin'
                ? { ownerId: ownerId, ownerType, balance: 0 }
                : { ownerId: new Types.ObjectId(ownerId), ownerType, balance: 0 };

            return await this.model.create(walletData);
        } catch (error) {
            logger.error('Error creating wallet:', error);
            throw new Error("Error creating wallet");
        }
    }

    async incrementBalance(walletId: string, amount: number): Promise<IWalletModel | null> {
        try {
            return await this.model.findByIdAndUpdate(
                new Types.ObjectId(walletId),
                { $inc: { balance: amount } },
                { new: true }
            );
        } catch (error) {
            logger.error('Error incrementing balance:', error);
            throw new Error("Error updating wallet balance");
        }
    }

    async decrementBalance(walletId: string, amount: number): Promise<IWalletModel | null> {
        try {
            const wallet = await this.findById(new Types.ObjectId(walletId));
            if (!wallet || wallet.balance < amount) {
                throw new Error("Insufficient balance");
            }

            return await this.model.findByIdAndUpdate(
                new Types.ObjectId(walletId),
                { $inc: { balance: -amount } },
                { new: true }
            );
        } catch (error) {
            logger.error('Error decrementing balance:', error);
            throw error;
        }
    }

    async getOrCreateWallet(ownerId: string, ownerType: string): Promise<IWalletModel> {
        try {
            let wallet = await this.findByOwner(ownerId, ownerType);
            if (!wallet) {
                wallet = await this.createWallet(ownerId, ownerType);
            }
            return wallet;
        } catch (error) {
            logger.error('Error in getOrCreateWallet:', error);
            throw new Error("Error getting or creating wallet");
        }
    }
}
import { IWalletModel } from "@/models/interface/wallet.model.interface";
import { BaseRepository } from "../base.repository";
import { IWalletRepository } from "../interface/IWalletRepository";
import Wallet from "@/models/implementation/wallet.model";
import { Types } from "mongoose";
import logger from "@/config/logger.config";
import { createHttpError } from "@/utils/http-error.util";
import { HttpStatus } from "@/constants/status.constant";

export class WalletRepository extends BaseRepository<IWalletModel> implements IWalletRepository {
    constructor() {
        super(Wallet);
    }

    async create(data: Partial<IWalletModel>): Promise<IWalletModel> {
        try {
            const wallet = await this.model.create(data);
            return wallet;
        } catch (error) {
            logger.error('Error creating wallet:', error);
            throw new Error("Error creating wallet");
        }
    }

    async findById(id: string): Promise<IWalletModel | null> {
        try {
            const wallet = await this.model.findById(new Types.ObjectId(id));
            
            if (wallet) {
                logger.info(`Wallet found: ${wallet._id}, balance: ₹${wallet.balance}`);
            } else {
                logger.info(`No wallet found with ID: ${id}`);
            }
            
            return wallet;
        } catch (error) {
            logger.error('Error finding wallet by id:', error);
            throw new Error("Error finding wallet");
        }
    }

    async findByOwnerId(
        ownerId: string, 
        ownerType: 'client' | 'therapist' | 'admin'
    ): Promise<IWalletModel | null> {
        try {
            const query = ownerType === 'admin' 
                ? { ownerId: ownerId, ownerType }
                : { ownerId: new Types.ObjectId(ownerId), ownerType };
            
            const wallet = await this.model.findOne(query);
            
            if (wallet) {
                logger.info(`Wallet found for owner: ${wallet._id}, balance: ₹${wallet.balance}`);
            } else {
                logger.info(`No wallet found for owner: ${ownerId} (${ownerType})`);
            }
            
            return wallet;
        } catch (error) {
            logger.error('Error finding wallet by owner:', error);
            throw new Error("Error finding wallet");
        }
    }

    // Alias for backward compatibility
    async findByOwner(ownerId: string, ownerType: string): Promise<IWalletModel | null> {
        return this.findByOwnerId(ownerId, ownerType as 'client' | 'therapist' | 'admin');
    }

    async createWallet(ownerId: string, ownerType: string): Promise<IWalletModel> {
        try {
            const walletData = ownerType === 'admin'
                ? { ownerId: ownerId, ownerType, balance: 0 }
                : { ownerId: new Types.ObjectId(ownerId), ownerType, balance: 0 };
            
            const wallet = await this.model.create(walletData);
            return wallet;
        } catch (error) {
            logger.error('Error creating wallet:', error);
            throw new Error("Error creating wallet");
        }
    }

    async getOrCreateWallet(
        ownerId: string,
        ownerType: 'client' | 'therapist' | 'admin'
    ): Promise<IWalletModel> {
        try {
            let wallet = await this.findByOwnerId(ownerId, ownerType);
            
            if (!wallet) {
                logger.info(`Wallet not found, creating new wallet for ${ownerId}`);
                wallet = await this.createWallet(ownerId, ownerType);
            } else {
                logger.info(`Existing wallet found with ID: ${wallet._id}, balance: ₹${wallet.balance}`);
            }
            
            return wallet;
        } catch (error) {
            logger.error('Error in getOrCreateWallet:', error);
            throw new Error("Error getting or creating wallet");
        }
    }

    async updateBalance(
        walletId: string, 
        amount: number, 
        type: 'credit' | 'debit'
    ): Promise<IWalletModel> {
        try {
            const wallet = await this.findById(walletId);
            
            if (!wallet) {
                logger.error(`Wallet not found: ${walletId}`);
                throw createHttpError(
                    HttpStatus.NOT_FOUND,
                    "Wallet not found"
                );
            }

            let newBalance: number;
            
            if (type === 'credit') {
                newBalance = wallet.balance + amount;
            } else {
                // Debit
                if (wallet.balance < amount) {
                    logger.error(`Insufficient balance. Current: ₹${wallet.balance}, Required: ₹${amount}`);
                    throw createHttpError(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient wallet balance"
                    );
                }
                newBalance = wallet.balance - amount;
            }

            const updatedWallet = await this.model.findByIdAndUpdate(
                new Types.ObjectId(walletId),
                { balance: newBalance },
                { new: true }
            );

            if (!updatedWallet) {
                logger.error(`Failed to update wallet: ${walletId}`);
                throw createHttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to update wallet balance"
                );
            }

            return updatedWallet;
        } catch (error) {
            logger.error('Error updating wallet balance:', error);
            throw error;
        }
    }

    async incrementBalance(walletId: string, amount: number): Promise<IWalletModel | null> {
        try {
            const wallet = await this.model.findByIdAndUpdate(
                new Types.ObjectId(walletId),
                { $inc: { balance: amount } },
                { new: true }
            );
            return wallet;
        } catch (error) {
            logger.error('Error incrementing balance:', error);
            throw new Error("Error updating wallet balance");
        }
    }

    async decrementBalance(walletId: string, amount: number): Promise<IWalletModel | null> {
        try {
            const wallet = await this.findById(walletId);
            
            if (!wallet || wallet.balance < amount) {
                throw new Error("Insufficient balance");
            }
            
            const updatedWallet = await this.model.findByIdAndUpdate(
                new Types.ObjectId(walletId),
                { $inc: { balance: -amount } },
                { new: true }
            );
            
            return updatedWallet;
        } catch (error) {
            logger.error('Error decrementing balance:', error);
            throw error;
        }
    }

    async getBalance(walletId: string): Promise<number> {
        try {
            const wallet = await this.findById(walletId);
            const balance = wallet ? wallet.balance : 0;
            return balance;
        } catch (error) {
            logger.error('Error getting wallet balance:', error);
            throw new Error("Error getting wallet balance");
        }
    }
}
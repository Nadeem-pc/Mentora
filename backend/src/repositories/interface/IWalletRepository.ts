import { IWalletModel } from "@/models/interface/wallet.model.interface";

export interface IWalletRepository {
    create(data: Partial<IWalletModel>): Promise<IWalletModel>;
    findById(id: string): Promise<IWalletModel | null>;
    findByOwnerId(ownerId: string, ownerType: 'client' | 'therapist' | 'admin'): Promise<IWalletModel | null>;
    findByOwner(ownerId: string, ownerType: string): Promise<IWalletModel | null>;
    createWallet(ownerId: string, ownerType: string): Promise<IWalletModel>;
    getOrCreateWallet(ownerId: string, ownerType: 'client' | 'therapist' | 'admin'): Promise<IWalletModel>;
    updateBalance(walletId: string, amount: number, type: 'credit' | 'debit'): Promise<IWalletModel>;
    incrementBalance(walletId: string, amount: number): Promise<IWalletModel | null>;
    decrementBalance(walletId: string, amount: number): Promise<IWalletModel | null>;
    getBalance(walletId: string): Promise<number>;
}
import { IWalletModel } from "@/models/interface/wallet.model.interface";

export interface IWalletRepository {
    findByOwner(ownerId: string, ownerType: string): Promise<IWalletModel | null>;
    createWallet(ownerId: string, ownerType: string): Promise<IWalletModel>;
    incrementBalance(walletId: string, amount: number): Promise<IWalletModel | null>;
    decrementBalance(walletId: string, amount: number): Promise<IWalletModel | null>;
    getOrCreateWallet(ownerId: string, ownerType: string): Promise<IWalletModel>;
}
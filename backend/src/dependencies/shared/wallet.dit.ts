import { WalletController } from "@/controllers/shared/implementation/wallet.controller";
import { WalletRepository } from "@/repositories/implementation/wallet.repository";
import { TransactionRepository } from "@/repositories/implementation/transaction.repository";
import { WalletService } from "@/services/shared/implementation/wallet.service";

const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();
const walletService = new WalletService(walletRepository, transactionRepository);

export const walletController = new WalletController(walletService);
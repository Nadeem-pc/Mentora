// dependencies/client/profile.di.ts

import { AppointmentRepository } from "@/repositories/implementation/appointment.repository";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import { WalletRepository } from "@/repositories/implementation/wallet.repository";
import { TransactionRepository } from "@/repositories/implementation/transaction.repository";
import { ClientProfileController } from "@/controllers/client/implementation/profile.controller";
import { ClientProfileService } from "@/services/client/implementation/profile.service";
import { UserRepository } from "@/repositories/implementation/client.repository";

// Initialize repositories
const userRepository = new UserRepository();
const appointmentRepository = new AppointmentRepository();
const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();

// Initialize service with all repositories
const clientProfileService = new ClientProfileService(
    userRepository,
    appointmentRepository,
    slotRepository,
    walletRepository,
    transactionRepository
);

// Initialize controller
export const clientProfileController = new ClientProfileController(clientProfileService);
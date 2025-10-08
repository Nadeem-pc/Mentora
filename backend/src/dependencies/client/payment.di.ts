import { PaymentController } from "@/controllers/client/implementation/payment.controller";
import { PaymentService } from "@/services/client/implementation/payment.service";
import { SlotRepository } from "@/repositories/implementation/slot.repository";
import { WalletRepository } from "@/repositories/implementation/wallet.repository";
import { TransactionRepository } from "@/repositories/implementation/transaction.repository";
import { AppointmentRepository } from "@/repositories/implementation/appointment.repository";

const slotRepository = new SlotRepository();
const walletRepository = new WalletRepository();
const transactionRepository = new TransactionRepository();
const appointmentRepository = new AppointmentRepository();

const paymentService = new PaymentService(
    slotRepository,
    walletRepository,
    transactionRepository,
    appointmentRepository
);

export const paymentController = new PaymentController(paymentService);
import { IUserRepository } from "@/repositories/interface/IUserRepository";
import { IAppointmentRepository } from "@/repositories/interface/IAppointmentRepository";
import { ISlotRepository } from "@/repositories/interface/ISlotRepository";
import { IClientProfileService } from "../interface/IProfileService";
import { IUserModel } from "@/models/interface/user.model.interface";
import { IAppointment } from "@/models/interface/appointment.model.interface";
import { HttpResponse } from "@/constants/response-message.constant";
import { getObjectURL, putObjectURl } from "@/config/s3Bucket.config";
import { HttpStatus } from "@/constants/status.constant";
import { createHttpError } from "@/utils/http-error.util";
import logger from "@/config/logger.config";
import { Types } from "mongoose";
import { ITransactionRepository } from "@/repositories/interface/ITransactionRepository";
import { IWalletRepository } from "@/repositories/interface/IWalletRepository";

export class ClientProfileService implements IClientProfileService {
    private readonly _clientRepository: IUserRepository;
    private readonly _appointmentRepository?: IAppointmentRepository;
    private readonly _slotRepository?: ISlotRepository;

    constructor(
        clientRepository: IUserRepository,
        appointmentRepository?: IAppointmentRepository,
        slotRepository?: ISlotRepository,   
        walletRepository?: IWalletRepository,
        transactionRepository?: ITransactionRepository
    ) {
        this._clientRepository = clientRepository;
        this._appointmentRepository = appointmentRepository;
        this._slotRepository = slotRepository;
        this._walletRepository = walletRepository;
        this._transactionRepository = transactionRepository;
    }

    getClientData = async (clientId: string): Promise<IUserModel | null> => {
        return await this._clientRepository.findUserById(clientId);
    };

    updateProfile = async (clientId: string, updateData: Partial<IUserModel>): Promise<{ success: boolean, message: string }> => {
        await this._clientRepository.updateUserById(clientId, updateData);
        return { success: true, message: HttpResponse.PROFILE_UPDATED };
    };

    generatePresignedUploadUrl = async (fileName: string, fileType: string): Promise<{ uploadURL: string; fileURL: string }> => {
        const { uploadURL, fileURL } = await putObjectURl(fileName, fileType);
        if (!uploadURL || !fileURL) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                HttpResponse.SERVER_ERROR,
            );
        }
        return { uploadURL, fileURL };
    };

    generatePresignedGetUrl = async (fileName: string): Promise<string> => {
        const getURL = await getObjectURL(fileName);
        if (!getURL) {
            throw createHttpError(HttpStatus.INTERNAL_SERVER_ERROR, HttpResponse.SERVER_ERROR);
        }
        return getURL;
    };

    updateProfileImage = async (clientId: string, fileKey: string): Promise<{ imageUrl: string }> => {
        try {
            let cleanKey = fileKey;
            if (fileKey.startsWith('http')) {
                const urlParts = fileKey.split('/');
                cleanKey = urlParts.slice(-2).join('/'); 
            }

            const imageUrl = await this.generatePresignedGetUrl(cleanKey);
            
            await this._clientRepository.updateUserById(clientId, { 
                profileImg: cleanKey 
            });

            return { imageUrl };
        } catch (error) {
            logger.error("Error in updateProfileImage service:", error);
            throw new Error("Failed to update profile image");
        }
    };

    getClientAppointments = async (
        clientId: string, 
        status?: string,
        skip?: number,
        limit?: number
    ): Promise<any[]> => {
        try {
            if (!this._appointmentRepository) {
                throw createHttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Appointment repository not initialized"
                );
            }

            if (!this._slotRepository) {
                throw createHttpError(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Slot repository not initialized"
                );
            }

            let appointments: IAppointment[];

            if (status === 'upcoming') {
                appointments = await this._appointmentRepository.findUpcomingAppointments(clientId, 'client');
            } else if (status === 'past') {
                appointments = await this._appointmentRepository.findPastAppointments(clientId, 'client');
            } else {
                appointments = await this._appointmentRepository.findByClientId(clientId, skip, limit);
            }

            const enrichedAppointments = await Promise.all(
                appointments.map(async (appointment) => {
                    try {
                        const weeklySchedule = await this._slotRepository!.getWeeklyScheduleByTherapistId(
                            appointment.therapistId._id as Types.ObjectId
                        );

                        if (!weeklySchedule) {
                            logger.warn(`No weekly schedule found for therapist ${appointment.therapistId._id}`);
                            return {
                                ...appointment.toObject(),
                                slotId: {
                                    _id: appointment.slotId.toString(),
                                    time: 'N/A',
                                    fees: 0,
                                    consultationModes: []
                                }
                            };
                        }

                        let slotDetails = null;
                        for (const daySchedule of weeklySchedule.schedule) {
                            const slot = daySchedule.slots.find(
                                (s: any) => s._id.toString() === appointment.slotId.toString()
                            );
                            if (slot) {
                                slotDetails = {
                                    _id: slot._id.toString(),
                                    time: slot.startTime,
                                    fees: slot.price,
                                    consultationModes: slot.modes
                                };
                                break;
                            }
                        }

                        if (!slotDetails) {
                            logger.warn(`Slot ${appointment.slotId} not found in weekly schedule`);
                            slotDetails = {
                                _id: appointment.slotId.toString(),
                                time: 'N/A',
                                fees: 0,
                                consultationModes: []
                            };
                        }

                        return {
                            ...appointment.toObject(),
                            slotId: slotDetails
                        };
                    } catch (error) {
                        logger.error(`Error enriching appointment ${appointment._id}:`, error);
                        return {
                            ...appointment.toObject(),
                            slotId: {
                                _id: appointment.slotId.toString(),
                                time: 'N/A',
                                fees: 0,
                                consultationModes: []
                            }
                        };
                    }
                })
            );

            return enrichedAppointments;
        } catch (error) {
            logger.error("Error fetching client appointments:", error);
            throw error;
        }
    };

   cancelAppointment = async (
    clientId: string,
    appointmentId: string,
    cancelReason: string
): Promise<{
    success: boolean;
    message: string;
    refundAmount: number;
    refundPercentage: number;
}> => {
    try {
        // 1. Validate repositories
        if (!this._appointmentRepository) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Appointment repository not initialized"
            );
        }

        if (!this._slotRepository) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Slot repository not initialized"
            );
        }

        if (!this._walletRepository) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Wallet repository not initialized"
            );
        }

        if (!this._transactionRepository) {
            throw createHttpError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Transaction repository not initialized"
            );
        }

        // 2. Get appointment details
        const appointment = await this._appointmentRepository.findByIdWithoutPopulate(appointmentId);
        
        if (!appointment) {
            throw createHttpError(
                HttpStatus.NOT_FOUND,
                "Appointment not found"
            );
        }

        // 3. Verify ownership
        if (appointment.clientId.toString() !== clientId) {
            throw createHttpError(
                HttpStatus.FORBIDDEN,
                "You are not authorized to cancel this appointment"
            );
        }

        // 4. Check if already cancelled
        if (appointment.status === 'cancelled') {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Appointment is already cancelled"
            );
        }

        // 5. Check if already completed
        if (appointment.status === 'completed') {
            throw createHttpError(
                HttpStatus.BAD_REQUEST,
                "Cannot cancel a completed appointment"
            );
        }

        // 6. Get slot details to fetch the fee
        const weeklySchedule = await this._slotRepository.getWeeklyScheduleByTherapistId(
            appointment.therapistId as Types.ObjectId
        );

        if (!weeklySchedule) {
            throw createHttpError(
                HttpStatus.NOT_FOUND,
                "Slot details not found"
            );
        }

        let slotFee = 0;
        for (const daySchedule of weeklySchedule.schedule) {
            const slot = daySchedule.slots.find(
                (s: any) => s._id.toString() === appointment.slotId.toString()
            );
            if (slot) {
                slotFee = slot.price;
                break;
            }
        }

        if (slotFee === 0) {
            throw createHttpError(
                HttpStatus.NOT_FOUND,
                "Slot fee information not found"
            );
        }

        // 7. Calculate refund based on cancellation policy
        const now = new Date();
        const appointmentDateTime = new Date(appointment.appointmentDate);
        const bookingTime = new Date(appointment.createdAt);
        
        const hoursFromBooking = (now.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
        const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        let refundPercentage = 0;
        let refundReason = "";

        // Refund Logic:
        // 1. Cancel within 1 hour of booking - Full refund (100%)
        if (hoursFromBooking <= 1) {
            refundPercentage = 100;
            refundReason = "Cancelled within 1 hour of booking";
        }
        // 2. Cancel more than 24 hours before session - Full refund (100%)
        else if (hoursUntilAppointment > 24) {
            refundPercentage = 100;
            refundReason = "Cancelled more than 24 hours before session";
        }
        // 3. Cancel less than 24 hours before session - 50% refund
        else if (hoursUntilAppointment > 0) {
            refundPercentage = 50;
            refundReason = "Cancelled less than 24 hours before session";
        }
        // 4. Cancel after appointment time - No refund
        else {
            refundPercentage = 0;
            refundReason = "Cancellation after appointment time - no refund";
        }

        const refundAmount = Math.round((slotFee * refundPercentage) / 100);

        // 8. Update appointment status
        await this._appointmentRepository.updateAppointmentStatus(
            appointmentId,
            'cancelled',
            cancelReason
        );

        // 9. Process refund if applicable
        if (refundAmount > 0) {
            const PLATFORM_FEE_PERCENTAGE = 10; // 10% platform fee
            const THERAPIST_PERCENTAGE = 90; // 90% goes to therapist
            
            // Calculate the split amounts for refund
            const adminRefundAmount = Math.round((refundAmount * PLATFORM_FEE_PERCENTAGE) / 100);
            const therapistRefundAmount = refundAmount - adminRefundAmount; // Remaining amount

            logger.info(`Processing refund: Total=${refundAmount}, Admin=${adminRefundAmount}, Therapist=${therapistRefundAmount}`);

            // ===== STEP 1: Credit refund to client wallet =====
            let clientWallet = await this._walletRepository.findByOwnerId(
                clientId,
                'client'
            );

            if (!clientWallet) {
                clientWallet = await this._walletRepository.create({
                    ownerId: new Types.ObjectId(clientId),
                    ownerType: 'client',
                    balance: 0
                });
            }

            await this._walletRepository.updateBalance(
                clientWallet._id.toString(),
                refundAmount,
                'credit'
            );

            // Create transaction record for client credit
            await this._transactionRepository.create({
                walletId: clientWallet._id,
                type: 'credit',
                amount: refundAmount,
                description: `Refund for cancelled appointment (${refundPercentage}% refund)`,
                status: 'completed',
                metadata: {
                    appointmentId: appointmentId,
                    originalAmount: slotFee,
                    refundPercentage: refundPercentage,
                    cancelReason: cancelReason,
                    refundReason: refundReason
                }
            });

            logger.info(`✓ Client refund: ₹${refundAmount} credited to client ${clientId}`);

            // ===== STEP 2: Deduct refund from therapist wallet =====
            const therapistId = appointment.therapistId.toString();
            let therapistWallet = await this._walletRepository.findByOwnerId(
                therapistId,
                'therapist'
            );

            if (!therapistWallet) {
                logger.error(`Therapist wallet not found for therapist ${therapistId}`);
                throw createHttpError(
                    HttpStatus.NOT_FOUND,
                    "Therapist wallet not found"
                );
            }

            // Check if therapist has sufficient balance
            if (therapistWallet.balance < therapistRefundAmount) {
                logger.warn(`Insufficient balance in therapist wallet. Balance: ₹${therapistWallet.balance}, Required: ₹${therapistRefundAmount}`);
                // You might want to handle this differently based on your business logic
                // For now, we'll proceed but log the warning
            }

            await this._walletRepository.updateBalance(
                therapistWallet._id.toString(),
                therapistRefundAmount,
                'debit'
            );

            // Create transaction record for therapist debit
            await this._transactionRepository.create({
                walletId: therapistWallet._id,
                type: 'debit',
                amount: therapistRefundAmount,
                description: `Refund deduction for cancelled appointment (${refundPercentage}% of Session Fee)`,
                status: 'completed',
                metadata: {
                    appointmentId: appointmentId,
                    clientId: clientId,
                    originalAmount: slotFee,
                    therapistShare: therapistRefundAmount,
                    refundPercentage: refundPercentage,
                    cancelReason: cancelReason
                }
            });

            logger.info(`✓ Therapist deduction: ₹${therapistRefundAmount} debited from therapist ${therapistId}`);

            // ===== STEP 3: Deduct refund from admin wallet =====
            const ADMIN_ID = 'admin'; // Use your actual admin identifier
            let adminWallet = await this._walletRepository.findByOwnerId(
                ADMIN_ID,
                'admin'
            );

            if (!adminWallet) {
                // Create admin wallet if it doesn't exist
                adminWallet = await this._walletRepository.create({
                    ownerId: ADMIN_ID,
                    ownerType: 'admin',
                    balance: 0
                });
                logger.info(`Admin wallet created for ${ADMIN_ID}`);
            }

            // Check if admin has sufficient balance
            if (adminWallet.balance < adminRefundAmount) {
                logger.warn(`Insufficient balance in admin wallet. Balance: ₹${adminWallet.balance}, Required: ₹${adminRefundAmount}`);
            }

            await this._walletRepository.updateBalance(
                adminWallet._id.toString(),
                adminRefundAmount,
                'debit'
            );

            // Create transaction record for admin debit
            await this._transactionRepository.create({
                walletId: adminWallet._id,
                type: 'debit',
                amount: adminRefundAmount,
                description: `Platform fee refund for cancelled appointment (${refundPercentage}% of platform fee)`,
                status: 'completed',
                metadata: {
                    appointmentId: appointmentId,
                    clientId: clientId,
                    therapistId: therapistId,
                    originalAmount: slotFee,
                    platformFeeShare: adminRefundAmount,
                    refundPercentage: refundPercentage,
                    cancelReason: cancelReason
                }
            });

            logger.info(`✓ Admin deduction: ₹${adminRefundAmount} debited from admin wallet`);
            logger.info(`✓ Refund processing completed successfully for appointment ${appointmentId}`);
        }

        // 10. Return success response
        return {
            success: true,
            message: refundAmount > 0 
                ? `Appointment cancelled successfully. ₹${refundAmount} (${refundPercentage}%) has been refunded to your wallet.`
                : `Appointment cancelled successfully. ${refundReason}.`,
            refundAmount,
            refundPercentage
        };

    } catch (error) {
        logger.error("Error in cancelAppointment service:", error);
        throw error;
    }
};

}
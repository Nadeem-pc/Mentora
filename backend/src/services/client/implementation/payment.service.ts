import { IPaymentService } from "../interface/IPaymentService";
import { ISlotRepository } from "@/repositories/interface/ISlotRepository";
import { IWalletRepository } from "@/repositories/interface/IWalletRepository";
import { ITransactionRepository } from "@/repositories/interface/ITransactionRepository";
import { IAppointmentRepository } from "@/repositories/interface/IAppointmentRepository";
import Stripe from 'stripe';
import logger from "@/config/logger.config";
import { env } from "@/config/env.config";
import { Types } from "mongoose";

const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

export class PaymentService implements IPaymentService {
    constructor(
        private readonly _slotRepository: ISlotRepository,
        private readonly _walletRepository: IWalletRepository,
        private readonly _transactionRepository: ITransactionRepository,
        private readonly _appointmentRepository: IAppointmentRepository
    ) {}

    async createCheckoutSession(
        therapistId: string,
        userId: string,
        consultationMode: string,
        selectedDate: string,
        selectedTime: string,
        price: number
    ): Promise<{ sessionId: string; url: string | null }> {
        try {
            const weeklySchedule = await this._slotRepository.getWeeklyScheduleByTherapistId(
                new Types.ObjectId(therapistId)
            );

            if (!weeklySchedule || !weeklySchedule.schedule) {
                throw new Error('Therapist schedule not found');
            }

            const date = new Date(selectedDate);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = days[date.getDay()];

            const daySchedule = weeklySchedule.schedule.find((d: any) => d.day === dayOfWeek);
            if (!daySchedule) {
                throw new Error('No schedule found for this day');
            }

            const slot = daySchedule.slots.find((s: any) => s.startTime === selectedTime);
            if (!slot) {
                throw new Error('Slot not found in schedule');
            }

            const slotId = slot._id.toString();

            const normalizedModes = slot.modes.map((m: string) => m.toLowerCase());
            if (!normalizedModes.includes(consultationMode.toLowerCase())) {
                throw new Error('Selected consultation mode not available for this slot');
            }

            if (slot.price !== price) {
                logger.warn('Price mismatch:', { slotPrice: slot.price, providedPrice: price });
            }

            const amount = slot.price;

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Therapy Session',
                                description: `${consultationMode} consultation on ${selectedDate} at ${selectedTime}`,
                            },
                            unit_amount: amount * 100,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
                metadata: {
                    slotId,
                    therapistId,
                    userId,
                    consultationMode,
                    selectedDate,
                    selectedTime,
                    amount: amount.toString(),
                },
            });

            return {
                sessionId: session.id,
                url: session.url,
            };
        } catch (error) {
            logger.error('Error creating checkout session:', error);
            throw error;
        }
    }

    async handleWebhook(body: Buffer, signature: string): Promise<{ received: boolean }> {
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                env.WEBHOOK_SECRET_KEY!
            );
            
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object as Stripe.Checkout.Session;
                await this.fulfillOrder(session);
            }

            return { received: true };
        } catch (error) {
            logger.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
            logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
            throw error;
        }
    }

    async fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
        try {
            const metadata = session.metadata;
            
            if (!metadata) {
                throw new Error('No metadata found in session');
            }

            const totalAmount = parseFloat(metadata.amount);
            const platformFee = totalAmount * 0.1; 
            const therapistAmount = totalAmount - platformFee;


            const adminWallet = await this._walletRepository.getOrCreateWallet('admin', 'admin');
            
            const therapistWallet = await this._walletRepository.getOrCreateWallet(
                metadata.therapistId, 
                'therapist'
            );
            
            const [updatedAdminWallet, updatedTherapistWallet] = await Promise.all([
                this._walletRepository.incrementBalance(adminWallet._id.toString(), platformFee),
                this._walletRepository.incrementBalance(therapistWallet._id.toString(), therapistAmount),
            ]);
            

            const [adminTransaction, therapistTransaction] = await Promise.all([
                this._transactionRepository.createTransaction({
                    walletId: adminWallet._id,
                    type: 'credit',
                    amount: platformFee,
                    description: 'Platform fee from therapy session',
                    status: 'completed',
                    metadata: {
                        sessionId: session.id,
                        slotId: metadata.slotId,
                        therapistId: metadata.therapistId,
                        userId: metadata.userId,
                    },
                }),
                this._transactionRepository.createTransaction({
                    walletId: therapistWallet._id,
                    type: 'credit',
                    amount: therapistAmount,
                    description: `Payment for ${metadata.consultationMode} session on ${metadata.selectedDate}`,
                    status: 'completed',
                    metadata: {
                        sessionId: session.id,
                        slotId: metadata.slotId,
                        userId: metadata.userId,
                        consultationMode: metadata.consultationMode,
                        selectedDate: metadata.selectedDate,
                        selectedTime: metadata.selectedTime,
                    },
                }),
            ]);
            
            const appointmentDate = new Date(metadata.selectedDate);
            
            const appointmentData = {
                therapistId: new Types.ObjectId(metadata.therapistId),
                clientId: new Types.ObjectId(metadata.userId),
                slotId: new Types.ObjectId(metadata.slotId),
                appointmentDate: appointmentDate,
                appointmentTime: metadata.selectedTime,  
                consultationMode: metadata.consultationMode.toLowerCase(),
                status: 'scheduled' as const,
                transactionId: therapistTransaction._id,
                notes: `${metadata.consultationMode} consultation at ${metadata.selectedTime}`,
            };

            const appointment = await this._appointmentRepository.createAppointment(appointmentData);

        } catch (error) {
            logger.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
            logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        }
    }

    async getPaymentReceipt(sessionId: string): Promise<any> {
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (!session || session.payment_status !== 'paid') {
                throw new Error('Payment session not found or not completed');
            }

            const metadata = session.metadata!;
            const amount = parseFloat(metadata.amount);
            const platformFee = amount * 0.1;

            return {
                sessionId: session.id,
                amount: amount,
                platformFee: platformFee,
                therapistAmount: amount - platformFee,
                consultationMode: metadata.consultationMode,
                selectedDate: metadata.selectedDate,
                selectedTime: metadata.selectedTime,
                status: 'Completed',
                createdAt: new Date(session.created * 1000).toISOString(),
            };
        } catch (error) {
            logger.error('Error fetching payment receipt:', error);
            throw error;
        }
    }
}
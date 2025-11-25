import { ITherapistRepository } from "@/repositories/interface/ITherapistRepository";
import { IClientTherapistService } from "../interface/IClientTherapistService";
import { ISlotRepository } from "@/repositories/interface/ISlotRepository";
import { IAppointmentRepository } from "@/repositories/interface/IAppointmentRepository";
import { Types } from "mongoose";
import logger from "@/config/logger.config";

export class ClientTherapistService implements IClientTherapistService {
    constructor(
        private readonly _therapistRepository: ITherapistRepository,
        private readonly _weeklyScheduleRepository: ISlotRepository,
        private readonly _appointmentRepository: IAppointmentRepository
    ) {}
  
    getTherapists = async (): Promise<any> => {
        const therapists = await this._therapistRepository.findApprovedTherapists();
            
        const transformedTherapists = therapists.map(therapist => ({
            id: therapist._id.toString(),
            name: `${therapist.firstName} ${therapist.lastName}`,
            image: therapist.profileImg,
            rating: 4.5, 
            experience: therapist.experience || 'N/A',
            price: parseInt(therapist.fee || '1500'),
            expertise: therapist.specializations || [],
            languages: therapist.languages || [],
            availableVia: ['Video', 'Voice'], 
            nextSlot: {
                date: 'Today',
                time: '2:00 PM'
            },
            gender: therapist.gender || 'Other',
            email: therapist.email,
            phone: therapist.phone,
            about: therapist.about,
            qualification: therapist.qualification
        }));

        return transformedTherapists;
    };

    getTherapistDetails = async (therapistId: string): Promise<any> => {
        try {
            const therapist = await this._therapistRepository.findTherapistById(therapistId);
            
            if (!therapist) {
                throw new Error('Therapist not found');
            }

            return {
                id: therapist._id.toString(),
                name: `${therapist.firstName} ${therapist.lastName}`,
                image: therapist.profileImg,
                rating: 4.5,
                experience: therapist.experience || 'N/A',
                price: parseInt(therapist.fee || '1500'),
                expertise: therapist.specializations || [],
                languages: therapist.languages || [],
                availableVia: ['Video', 'Audio'],
                gender: therapist.gender || 'Other',
                email: therapist.email,
                phone: therapist.phone,
                about: therapist.about,
                qualification: therapist.qualification,
            };
        } catch (error) {
            logger.error('Error fetching therapist by ID:', error);
            throw error;
        }
    };

    getTherapistSlots = async (therapistId: string): Promise<any> => {
        try {
            const weeklySchedule = await this._weeklyScheduleRepository.getWeeklyScheduleByTherapistId(
                new Types.ObjectId(therapistId)
            );

            if (!weeklySchedule) {
                return {
                    hasSchedule: false,
                    schedule: []
                };
            }

            const transformedSchedule = weeklySchedule.schedule.map(day => ({
                day: day.day,
                slots: day.slots.map(slot => ({
                    _id: slot._id.toString(),
                    startTime: slot.startTime,
                    modes: slot.modes.map(mode => mode.toLowerCase()),
                    price: slot.price
                }))
            }));

            return {
                hasSchedule: true,
                schedule: transformedSchedule
            };
        } catch (error) {
            logger.error('Error fetching therapist weekly schedule:', error);
            throw error;
        }
    };

    getAvailableSlots = async (therapistId: string, date: string): Promise<any> => {
        try {
            const weeklySchedule = await this._weeklyScheduleRepository.getWeeklyScheduleByTherapistId(
                new Types.ObjectId(therapistId)
            );

            if (!weeklySchedule) {
                return {
                    hasSlots: false,
                    slots: []
                };
            }

            const dateObj = new Date(date);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayOfWeek = days[dateObj.getDay()];

            const daySchedule = weeklySchedule.schedule.find(d => d.day === dayOfWeek);
            
            if (!daySchedule || !daySchedule.slots.length) {
                return {
                    hasSlots: false,
                    slots: []
                };
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const appointments = await this._appointmentRepository.find({
                therapistId: new Types.ObjectId(therapistId),
                appointmentDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: { $ne: 'cancelled' }
            });

            const bookedSlotIds = new Set(
                appointments.map(apt => apt.slotId.toString())
            );

            const now = new Date();
            const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const selectedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            
            const isToday = currentDate.getTime() === selectedDate.getTime();

            const availableSlots = daySchedule.slots
                .filter(slot => {
                    if (bookedSlotIds.has(slot._id.toString())) {
                        return false;
                    }

                    if (isToday) {
                        const [time, period] = slot.startTime.split(' ');
                        let [hours, minutes] = time.split(':').map(Number);
                        
                        if (period) {
                            if (period.toUpperCase() === 'PM' && hours !== 12) {
                                hours += 12;
                            } else if (period.toUpperCase() === 'AM' && hours === 12) {
                                hours = 0;
                            }
                        }

                        const slotTime = new Date(dateObj);
                        slotTime.setHours(hours, minutes, 0, 0);

                        return slotTime > now;
                    }

                    return true;
                })
                .map(slot => ({
                    _id: slot._id.toString(),
                    startTime: slot.startTime,
                    modes: slot.modes.map(mode => mode.toLowerCase()),
                    price: slot.price
                }));

            return {
                hasSlots: availableSlots.length > 0,
                date,
                dayOfWeek,
                slots: availableSlots
            };
        } catch (error) {
            logger.error('Error checking slot availability for date:', error);
            throw error;
        }
    };
}
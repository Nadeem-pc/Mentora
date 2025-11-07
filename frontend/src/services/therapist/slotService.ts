import { axiosInstance } from "@/config/axios.config";
import { API } from "@/constants/api.constant";

interface WeeklySlot {
    startTime: string;
    modes: string[];
    price: number;
}

interface DaySchedule {
    day: string;
    slots: WeeklySlot[];
}

interface CreateWeeklySchedulePayload {
    schedule: DaySchedule[];
}

export const slotService = {
    createWeeklySchedule: async (payload: CreateWeeklySchedulePayload) => {
        const response = await axiosInstance.post(API.THERAPIST.CREATE_WEEKLY_SCHEDULE, payload);
        return response.data;
    },

    getWeeklySchedule: async () => {
        const response = await axiosInstance.get(API.THERAPIST.GET_WEEKLY_SCHEDULE);
        return response.data;
    },

    updateWeeklySchedule: async (payload: CreateWeeklySchedulePayload) => {
        const response = await axiosInstance.put(API.THERAPIST.UPDATE_WEEKLY_SCHEDULE, payload);
        return response.data;
    }
};
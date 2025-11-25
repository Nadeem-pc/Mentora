export const API = {
    CLIENT: {
        PUT_PRESIGNED_URL: "/client/s3-presigned-url",
        GET_PRESIGNED_URL: "/client/s3-getPresigned-url",
        GET_THERAPISTS_LIST: "/client/therapists",
        GET_THERAPIST_DETAILS: (therapistId: string) => `/client/therapist/${therapistId}`,
        GET_THERAPIST_SLOTS: (therapistId: string) => `/client/therapist/${therapistId}/slots`,
        GET_AVAILABLE_SLOTS_FOR_DATE: (therapistId: string, date: string) => 
            `/client/therapist/${therapistId}/slots/available?date=${date}`,
        CREATE_CHECKOUT_SESSION: '/api/v1/payment/create-checkout-session',
        GET_PAYMENT_RECEIPT: (sessionId: string) => `/api/v1/payment/receipt/${sessionId}`,
        CANCEL_APPOINTMENT: (appointmentId: string) => `/client/appointment/${appointmentId}`
    },
    THERAPIST: {
        GET_THERAPIST_PROFILE: "/therapist/profile",
        UPDATE_THERAPIST_PROFILE: "/therapist/profile",
        PUT_PRESIGNED_URL: "/therapist/s3-presigned-url",
        GET_PRESIGNED_URL: "/therapist/s3-getPresigned-url",
        CREATE_WEEKLY_SCHEDULE: "/therapist/slot",
        GET_WEEKLY_SCHEDULE: "/therapist/slot",
        UPDATE_WEEKLY_SCHEDULE: "/therapist/slot",
        GET_APPOINTMENTS: '/therapist/appointments',
        GET_APPROVALSTATUS: '/therapist/approvalStatus',
    },
    ADMIN: {
        GET_USERS: "/admin/users",
        GET_USER_DETAILS: (userId: string) => `/admin/users/${userId}`,
        BLOCK_USER: (userId: string) => `/admin/users/${userId}/block`,
        UNBLOCK_USER: (userId: string) => `/admin/users/${userId}/unblock`,
        GET_JOB_APPLICATIONS: "/admin/job-applications",
        UPDATE_APPLICATION_STATUS: "/admin/job-applications",
        GET_JOB_APPLICATION_DETAILS: (applicationId: string) => `/admin/job-applications/${applicationId}`,
    }
};
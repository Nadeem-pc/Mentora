export const API = {
    CLIENT: {
        PUT_PRESIGNED_URL: "/client/s3-presigned-url",
        GET_PRESIGNED_URL: "/client/s3-getPresigned-url",
        GET_THERAPISTS_LIST: "/client/therapists",
        GET_THERAPIST_SLOTS: (therapistId: string) => `/client/therapist/${therapistId}/slots`,
        CREATE_CHECKOUT_SESSION: '/api/v1/payment/create-checkout-session',
        GET_PAYMENT_RECEIPT: (sessionId: string) => `/api/v1/payment/receipt/${sessionId}`,
    },
    THERAPIST: {
        GET_THERAPIST_PROFILE: "/therapist/profile",
        UPDATE_THERAPIST_PROFILE: "/therapist/profile",
        PUT_PRESIGNED_URL: "/therapist/s3-presigned-url",
        GET_PRESIGNED_URL: "/therapist/s3-getPresigned-url",
        CREATE_SLOT: "/therapist/slot",
        GET_SLOTS: "/therapist/slots",
        DELETE_SLOT: (id: string) => `/therapist/slot/${id}`,
    },
    ADMIN: {
        GET_JOB_APPLICATIONS: "/admin/job-applications",
        UPDATE_APPLICATION_STATUS: "/admin/job-applications",
        GET_JOB_APPLICATION_DETAILS: (id: string) => `/admin/job-applications/detail/${id}`,
    }
}
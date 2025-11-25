export interface IPaymentService {
    createCheckoutSession(
        therapistId: string,
        userId: string,
        consultationMode: string,
        selectedDate: string,
        selectedTime: string,
        price: number
    ): Promise<{ sessionId: string; url: string | null }>;
    
    handleWebhook(body: Buffer, signature: string): Promise<{ received: boolean }>;
    
    getPaymentReceipt(sessionId: string): Promise<any>;
}
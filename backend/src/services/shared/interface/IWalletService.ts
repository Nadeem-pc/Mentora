export interface IWalletService {
    getUserWallet(
        userId: string, 
        userType: 'client' | 'therapist' | 'admin'
    ): Promise<{
        wallet: {
            id: any;
            balance: number;
            ownerId: any;
            ownerType: string;
        };
        statistics: {
            totalRevenue: number;
            thisMonthRevenue: number;
            platformFee: number;
            balance: number;
        };
        transactions: Array<{
            id: any;
            type: 'credit' | 'debit';
            amount: number;
            description: string;
            status: string;
            date: Date;
            metadata?: any;
        }>;
    }>;
}
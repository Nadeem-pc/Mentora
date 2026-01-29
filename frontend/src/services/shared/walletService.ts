import { axiosInstance } from "@/config/axios.config";

interface WalletResponse {
    success: boolean;
    message: string;
    data: {
        wallet: {
            id: string;
            balance: number;
            ownerId: string;
            ownerType: string;
        };
        statistics: {
            totalRevenue: number;
            thisMonthRevenue: number;
            platformFee: number;
            balance: number;
        };
        transactions: Array<{
            id: string;
            type: 'credit' | 'debit';
            amount: number;
            description: string;
            status: string;
            date: string;
            metadata?: unknown;
        }>;
        pagination: {
            currentPage: number;
            limit: number;
            totalItems: number;
            totalPages: number;
        };
    };
}

export interface WalletQueryOptions {
    page?: number;
    limit?: number;
    type?: 'credit' | 'debit';
    status?: string;
    startDate?: string;
    endDate?: string;
}

export const walletService = {
    getUserWallet: async (options?: WalletQueryOptions): Promise<WalletResponse['data']> => {
        try {
            const response = await axiosInstance.get<WalletResponse>('/wallet/getWallet', {
                params: options
            });
            return response.data.data;
        } catch (error) {
            console.error('Error fetching wallet:', error);
            throw error;
        }
    },
};
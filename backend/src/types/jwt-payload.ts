export interface AuthJwtPayload {
    id: string,
    firstName?: string,
    lastName?: string,
    email: string,
    role: string,
    iat?: number;
    exp?: number;
}
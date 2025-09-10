export interface AuthJwtPayload {
    id: string,
    firstName?: string,
    lastName?: string,
    role: string,
    iat?: number;
    exp?: number;
}
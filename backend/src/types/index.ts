export interface IUser {
    _id: string;
    firstName: string,
    lastName: string,
    email: string,
    password: string;
    status: "Active" | "Blocked";
    role: "User" | "Therapist";
    dateOfBirth?: Date;
    accessToken: string,
    isAuthenticated: boolean
}

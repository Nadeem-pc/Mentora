export interface IUser {
    _id: string;
    firstName: string,
    lastName: string,
    email: string,
    password: string;
    status: "Active" | "Blocked";
    role: "Client" | "Therapist" | "Admin";
    dob?: Date;
    accessToken: string,
    isAuthenticated: boolean
}
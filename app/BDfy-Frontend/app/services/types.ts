export type RegisterUserPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    ci: string;
    reputation: number;
    phone: string;
    role: number;
    direction: {
        street: string;
        streetNumber: number;
        zipCode: number;
        department: string;
    };
    details: {
        IsAdmin: boolean;
    };
};

export type RegisterAuctioneerPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    ci: string;
    reputation: number;
    phone: string;
    role: number;
    direction: {
        street: string;
        streetNumber: number;
        zipCode: number;
        department: string;
    };
    details: {
        plate: number;
    };
};
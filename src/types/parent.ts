export interface Parent {
    id: number;
    nama_ayah?: string;
    nama_ibu?: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    occupation: string;
    education: string;
    registrationDate: string;
    lastVisit: string;
    notes: string;
    emergencyContact: {
        name: string;
        phone: string;
        relation: string;
    };
}
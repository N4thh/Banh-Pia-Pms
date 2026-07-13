export type CheckoutFormValues = {
    phone: string;
    fullName: string;
    shippingMethod: string;
    paymentMethod: string;
    receiveDate: string;
    newAddress: {
        houseNumber: string;
        street: string;
        ward: string;
        district: string;
    };
    items: any[];
    note: string;
};
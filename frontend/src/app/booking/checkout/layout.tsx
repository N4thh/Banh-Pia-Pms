"use client"; 
import { useState, createContext, useContext } from "react"
import { FormProvider, useForm } from "react-hook-form";


const StepContext = createContext<{
    step: 1 | 2; 
    setStep: (step: 1 | 2) => void; 
}>({step: 1, setStep: () => {}}); 

export const useCheckoutStep = () => useContext(StepContext);

export default function CheckoutLayout({children,} : {
    children: React.ReactNode;
}) { 
    const methods = useForm({
        defaultValues: {
            phone: "",
            fullName: "",
            shippingMethod: "",
            paymentMethod: "",
            receiveDate: "",
            newAddress: {
                houseNumber: "",
                street: "",
                ward: "",
                district: "",
            }, 
            items: [],
            note: "", 
        }
    })

    const [step, setStep] = useState <1 | 2>(1); 

    return (
        <FormProvider {...methods}>
            <StepContext.Provider value={{step, setStep}}>
                <div className="w-full mx-auto">
                    <div className="flex justify-around  font-medium text-center gap-4">
                        <div className={`w-1/2 pb-2 border-b-2 transition-all duration-300 border-[#3D2008] text-[#3D2008] ${
                            step === 2 ? "opacity-50" : ""
                        }`}>
                            <p>Thông tin người nhận</p>
                        </div>

                        <div className={`w-1/2 pb-2 border-b-2 transition-all duration-300 border-[#3D2008] text-[#3D2008] ${
                            step === 1 ? "opacity-50" : ""
                        }`}>
                            <p>Thông tin nhận bánh</p>
                        </div>
                    </div>

                    <main>
                        {children}
                    </main>
                </div>
            </StepContext.Provider>

        </FormProvider>
    );
}
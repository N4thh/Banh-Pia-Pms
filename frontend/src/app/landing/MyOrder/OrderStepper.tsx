import { Check, ReceiptText } from "lucide-react";

const steps = ["Đơn bánh đã được gửi", "Xác nhận đơn bánh", "Nhận bánh thành công"];
type OrderStatus = "NEW" | "PROCESSING" | "COMPLETED" | "CANCELLED";

type OrderStepperProps = {
  status: OrderStatus;
};

function getStepFromStatus(status: OrderStatus): number { 
    switch(status) { 
        case "NEW": 
            return 0; 
        case "PROCESSING":
            return 1; 
        case "COMPLETED": 
            return 2; 
        default: 
            return 0;
    }
}

export default function OrderStepper({ status }: OrderStepperProps) {
    const currentStep = getStepFromStatus(status);

  return (
    <div className="w-full mt-3">
      <div className="flex items-center">
            {steps.map((label, index) => {
                const isActive = index <= currentStep; 
                const isLastStep = index === steps.length - 1; 

                return (
                    <div key={index} className="relative flex-1 flex flex-col items-center">
                        {!isLastStep && (
                            <div className={`absolute top-3.5 left-1/2 w-full h-[0.3vh] -translate-y-1/2 z-0 transition-colors duration-300
                            ${index < currentStep ? "bg-[#34C759]" : "bg-[#A7A7A7]"}`} />
                        )}

                        <div className={`relative z-10 w-8 h-8  rounded-full transition-colors duration-300 flex items-center justify-center
                        ${isActive ? "bg-[#34C759]" : "bg-[#A7A7A7]"}`}>
                            {
                                !isLastStep ? (
                                    <ReceiptText 
                                    className="w-5 h-5" 
                                    color={isActive ? "white" : "black"} 
                                    />
                                ) : (
                                    <Check className="w-5 h-5" color={isActive ? "white" : "black"}/>
                                )
                            }
                        </div>

                        <span className={`mt-1 transition-colors duration-300 text-center
                        text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px]
                        ${isActive ? "text-[#34C759]" : "text-[#848484]"}`}
                        > {label}</span>
                    </div>
                );
            })}
      </div>
    </div>
  );
}
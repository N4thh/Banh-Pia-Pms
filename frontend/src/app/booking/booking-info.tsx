import CartCard from "./bookingCartCart";
import CheckoutLayout from "./checkout/layout";
import Customer from "./checkout/customer/page";
import Order from "./checkout/order/page";

export default function BoookingInfo() {
    return (
        <div>
            <div className="min-h-screen flex mt-[5vh] justify-center">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Info */}
                    <div className="order-2 lg:order-0 lg:col-span-2 max-h-[70vh]">
                        <CheckoutLayout>
                            <Customer />
                            <Order />
                        </CheckoutLayout>
                    </div>

                    {/* Cart */}
                    <div className="order-1 lg:order-0 lg:col-span-2">
                        <CartCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
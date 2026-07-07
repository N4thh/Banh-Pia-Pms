import CartCard from "./CartCard";

export default function BoookingInfo() {
    return (
        <div>
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Info */}
                    <div className="lg:col-span-2 min-h-[70vh] border rounded-lg p-6">
                    <h2 className="text-2xl font-bold">Info</h2>
                    </div>

                    {/* Cart */}
                    <div className="lg:col-span-2">
                    <CartCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
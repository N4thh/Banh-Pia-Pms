"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { axiosClient } from "@/src/api/axios-client";
import { getAdminAccessToken, setAdminTokens } from "@/src/utils/adminAuth";

type FormValues = {
  username: string;
  password: string;
};

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const { register, handleSubmit } = useForm<FormValues>();

    useEffect(() => {
        const token = getAdminAccessToken();
        if (token) {
            router.replace("/admin/dashboard");
            return;
        }
        setCheckingAuth(false);
    }, [router]);

    if (checkingAuth) return null;

    const onSubmit = async (data: FormValues) => {
        setLoading(true);
        try {
            const response = await axiosClient.post("/auth/admin/login", data);
            const tokens = response as unknown as { accessToken: string; refreshToken: string };
            setAdminTokens(tokens);
            router.push("/admin/dashboard");
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Đăng nhập thất bại";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDF6E8]">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-4"
            >
                <h1 className="text-2xl font-bold text-center text-[#3D2008]">
                    Đăng nhập
                </h1>

                {error && (
                    <div className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <input
                    {...register("username", { required: "Nhập tài khoản" })}
                    placeholder="Tài khoản"
                    className="border p-3 rounded-lg"
                />

                <input
                    {...register("password", { required: "Nhập mật khẩu" })}
                    type="password"
                    placeholder="Mật khẩu"
                    className="border p-3 rounded-lg"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="text-[#FDF6E8] bg-[#C01F1F] hover:bg-[#D62424] active:bg-[#A61B1B] transition-colors py-3 rounded-lg font-semibold disabled:opacity-50"
                >
                    {loading ? "Đang Đăng nhập..." : "Đăng nhập"}
                </button>
            </form>
        </div>
    );
}

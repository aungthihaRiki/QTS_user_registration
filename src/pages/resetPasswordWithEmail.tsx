import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { set } from "zod"
import { Vote } from "lucide-react";
import { formSchema } from "@/lib/schema/resetform.schema";

export default function resetPassword() {
    const router = useRouter();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const token = router.query.token as string | undefined;
    useEffect(() => {
        if (!router.isReady) return;
        if (!token) {
            router.replace("/noToken");
        }
    }, [router.isReady, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {}
        // if (!formData.phone) newErrors.phone = "* Phone is required"
        // if (!formData.password) newErrors.password = "* Password is required"
        // if (!formData.confirmPassword) newErrors.confirmPassword = "* Confirm Password"

        // if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "* Passwords do not match"
        const result = formSchema.safeParse(formData);

        if (!result.success) {
            result.error.issues.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0] as string] = err.message;
                }
            });

            //console.log(result.error);
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            const res = await fetch("http://localhost:3000/api/auth/resetPasswordWithEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: formData.phone,
                    password: formData.password,
                    token: token,
                }),
            });

            const data = await res.json();

            if (res.status === 200) {
                setSuccess(true);
                setErrors({});
                setFormData({ phone: "", password: "", confirmPassword: "" });
                return;
            }else{
                setErrors({ general: data.message || "Something went wrong" });
            }

        } catch (err) {
            setErrors({ general: "Network error. Please try again." });
        }


    }

    return (
        <main className="w-full h-screen bg-[url('/images/bg-img-3.png')] bg-cover bg-center">
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-full lg:w-1/4 md:w-2/4 md:px-0 px-5">
                    {success ? (
                        <div className="">
                            <Vote size={80} className="text-cyan-500 mx-auto" />
                            <div className="bg-cyan-100 p-6 rounded shadow text-center mt-5">
                                <h2 className="text-cyan-700 font-bold text-xl mb-2">Password Reset Successful</h2>
                                <p className="text-cyan-600">You can now log in with your new password.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl text-blue-900 font-bold mb-3">Reset Password</h1>
                            {
                                errors.general && <div className="bg-red-200 p-3 rounded mb-3">
                                    <p className="text-red-500">{errors.general}</p>
                                </div>
                            }
                            <form onSubmit={handleSubmit} className="w-full bg-blue-200 p-7 rounded-sm shadow-md">
                                <div className="mb-4 text-blue-900">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full border mt-2 p-2 rounded-sm focus:ring-3 focus:border-0 focus:ring-blue-400 focus:outline-none"
                                    />
                                    {errors.phone && <p className="text-red-500 mt-2 text-sm">{errors.phone}</p>}
                                </div>
                                <div className="mb-4 text-blue-900">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border mt-2 p-2 rounded-sm focus:ring-3 focus:border-0 focus:ring-blue-400 focus:outline-none"
                                    />
                                    {errors.password && <p className="text-red-500 mt-2 text-sm">{errors.password}</p>}
                                </div>
                                <div className="mb-4 text-blue-900">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full border mt-2 p-2 rounded-sm focus:ring-3 focus:border-0 focus:ring-blue-400 focus:outline-none"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 mt-2 text-sm">{errors.confirmPassword}</p>
                                    )}
                                </div>
                                <div>
                                    <button className="px-3 py-2 bg-blue-900 rounded-sm text-white hover:bg-blue-950">Submit</button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

        </main>
    )
}
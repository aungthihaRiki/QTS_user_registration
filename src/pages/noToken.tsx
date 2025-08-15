import { CircleQuestionMark } from "lucide-react"
export default function noToken() {
    return (
        <main className="w-full h-screen bg-[url('/images/bg-img-3.png')] bg-cover bg-center">
            <div className="w-full h-full flex justify-center items-center">
                <div className="w-full lg:w-1/4 md:w-2/4 md:px-0 px-5">
                    <CircleQuestionMark size={70} className="text-red-400 mx-auto" />
                    <div className="px-3 py-4 text-center bg-red-200 text-red-500 rounded mt-5">
                        <p className="text-2xl font-bold mb-2">Sorry!</p>
                        <p>You have no token to reset your password</p>
                    </div>
                </div>
            </div>
        </main>
    )
}
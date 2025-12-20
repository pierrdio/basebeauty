import { LoginForm } from "@/components/login-form";
import { ShaderRipple } from "@/components/shader-ripple";

export default function AdminLogin() {
    return (
        <div className="h-screen flex items-center justify-center relative">
            <div className="w-full z-10 relative max-w-sm px-5">
                <LoginForm />
            </div>
            <ShaderRipple className="absolute z-0 inset-0 h-screen" />
        </div>
    )
}
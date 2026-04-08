"use client";

import { LoginForm } from "./login-form";
import { authClient } from "@/server/better-auth/auth.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({
      email: email, // required
      password: password, // required
      rememberMe: true,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Login successful!");
    router.push("/learning-center/dashboard");
  };
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              onSubmit={(values) => handleSignIn(values.email, values.password)}
            />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/assets/learning-page.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

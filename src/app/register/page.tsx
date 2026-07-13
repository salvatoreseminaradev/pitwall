import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign up — PitWall" };

export default function RegisterPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center py-12">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}

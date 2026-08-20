import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your ÉLANÉ account password.",
};

export default async function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
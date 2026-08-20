import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your ÉLANÉ account for faster checkout, order tracking and saved wishlists.",
};

export default async function RegisterPage() {
  return <RegisterForm />;
}
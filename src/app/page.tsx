import { auth } from "@/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "./landing";

export const metadata: Metadata = {
  title: "Social Farm — панель публикаций TikTok и YouTube",
  description:
    "Официальный OAuth, очередь публикаций, шифрование токенов. Политика конфиденциальности и условия использования.",
};

export default async function Home() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return <LandingPage />;
}

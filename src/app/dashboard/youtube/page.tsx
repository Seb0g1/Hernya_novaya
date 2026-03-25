import { redirect } from "next/navigation";

/** Единая страница «Аккаунты» (TikTok + YouTube) */
export default function YoutubeLegacyPage() {
  redirect("/dashboard/accounts");
}

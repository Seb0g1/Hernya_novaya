"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ApiPath = "/api/accounts" | "/api/youtube/accounts";

export function AccountActiveSwitch({
  id,
  active,
  apiPath,
}: {
  id: string;
  active: boolean;
  apiPath: ApiPath;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(apiPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !active }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      disabled={loading}
      onClick={toggle}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 ${
        active ? "bg-indigo-500" : "bg-zinc-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform ${
          active ? "translate-x-7" : "translate-x-1"
        }`}
      />
      <span className="sr-only">{active ? "Активен" : "Отключён"}</span>
    </button>
  );
}

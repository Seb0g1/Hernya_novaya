"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RetryJob({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function retry() {
    setLoading(true);
    await fetch(`/api/jobs/${id}/retry`, { method: "POST" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={retry}
      disabled={loading}
      className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-50"
    >
      {loading ? "…" : "Повторить"}
    </button>
  );
}

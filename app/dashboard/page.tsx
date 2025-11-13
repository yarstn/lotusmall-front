"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">لوحة التحكم</h1>
      <div className="rounded-xl border p-4">
        <p className="mb-2">Token المخزن محليًا:</p>
        <code className="block text-xs break-all bg-gray-100 p-2 rounded">
          {token ?? "لا يوجد توكن — سجّلي الدخول من /login"}
        </code>
      </div>
    </div>
  );
}

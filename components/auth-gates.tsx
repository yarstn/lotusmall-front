"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function Loader() {
  return (
    <div className="min-h-[40vh] grid place-items-center text-gray-500">
      جاري التحقق…
    </div>
  );
}

export function useAuthState() {
  const [checked, setChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const s = typeof window !== "undefined" ? localStorage.getItem("isSeller") : null;
    setToken(t);
    setIsSeller(s === "true");
    setChecked(true);
  }, [pathname]);

  return { checked, token, isSeller };
}

/** أي مستخدم مسجّل دخول */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { checked, token } = useAuthState();

  useEffect(() => {
    if (!checked) return;
    if (!token) router.replace("/login");
  }, [checked, token, router]);

  if (!checked) return <Loader />;
  if (!token) return null; // تم التحويل

  return <>{children}</>;
}

/** بائع فقط */
export function SellerGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { checked, token, isSeller } = useAuthState();

  useEffect(() => {
    if (!checked) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isSeller) {
      // لو مشترٍ حاول يدخل صفحة بائع
      router.replace("/my/inquiries");
    }
  }, [checked, token, isSeller, router]);

  if (!checked) return <Loader />;
  if (!token || !isSeller) return null;

  return <>{children}</>;
}

/** مشتري فقط */
export function BuyerGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { checked, token, isSeller } = useAuthState();

  useEffect(() => {
    if (!checked) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (isSeller) {
      // لو بائع حاول يدخل صفحة مشتري
      router.replace("/my/listings");
    }
  }, [checked, token, isSeller, router]);

  if (!checked) return <Loader />;
  if (!token || isSeller) return null;

  return <>{children}</>;
}

"use client";

import Link, { LinkProps } from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function hrefToString(href: LinkProps["href"]): string {
  if (typeof href === "string") return href;
  const path = href.pathname ?? "";
  const qs =
    href.query && Object.keys(href.query).length
      ? "?" + new URLSearchParams(href.query as Record<string, string>).toString()
      : "";
  const hash = href.hash ? `#${href.hash}` : "";
  return `${path}${qs}${hash}`;
}

function NavLink({
  href,
  exact = false,
  className,
  children,
  ...rest
}: LinkProps & { exact?: boolean; className?: string; children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const hrefStr = useMemo(() => hrefToString(href), [href]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isActive = mounted ? (exact ? pathname === hrefStr : pathname.startsWith(hrefStr)) : false;

  const base = "relative px-3 py-2 rounded-md font-medium transition-all duration-200";
  const active =
    "text-gray-900 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-[#f9d67a] after:via-[#f5cd82] after:to-[#f2b564]";
  const idle =
    "text-gray-700 hover:text-gray-900 hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] after:rounded-full hover:after:bg-gradient-to-r hover:from-[#f9d67a] hover:via-[#f5cd82] hover:to-[#f2b564]";

  return (
    <Link
      href={href}
      key={hrefStr}
      className={[base, isActive ? active : idle, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("token");
    const sellerFlag = localStorage.getItem("isSeller");
    const adminFlag = localStorage.getItem("isAdmin");
    const name = localStorage.getItem("name");
    setToken(t);
    setIsSeller(sellerFlag === "true");
    setIsAdmin(adminFlag === "true");
    setDisplayName(name || "");
    setOpen(false);
  }, [pathname]);

  const isAuthed = !!token;
  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || "U";

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setIsSeller(false);
    setIsAdmin(false);
    setDisplayName("");
    setOpen(false);
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[rgb(252,240,210)] shadow-[0_2px_8px_rgba(180,120,20,0.12)]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <NavLink href="/" exact className="flex items-center gap-2">
            <span className="bg-gradient-to-br from-[#f9d67a] via-[#f5cd82] to-[#f2b564] p-[2px] rounded-full">
              <span className="bg-white rounded-full p-1 block">
                <img src="/smartmall-logo.png" alt="Lotus Mall" className="h-8 w-8 rounded-full object-cover" />
              </span>
            </span>
            <span className="font-extrabold text-lg tracking-tight">
              <span className="bg-gradient-to-br from-[#f9d67a] via-[#f5cd82] to-[#f2b564] bg-clip-text text-transparent">
                Lotus
              </span>
              <span className="text-gray-900">Mall</span>
            </span>
          </NavLink>

          {/* زر همبرغر للجوال */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden rounded-md p-2 text-[#b48a2a] hover:bg-white/60 transition"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <NavLink href="/" exact>Home</NavLink>
          <NavLink href="/start-business">Start Your Business</NavLink>
          <NavLink href="/vietnam-news">What's New in Vietnam</NavLink>

          {isAuthed ? (
            <>
              <NavLink href="/account">Account</NavLink>

              {isAdmin && (
                <>
                  <NavLink href="/admin" className="text-green-800 font-semibold hover:opacity-80">Dashboard</NavLink>
                  <NavLink href="/admin/contacts" className="text-blue-700 font-semibold hover:opacity-80">Contacts</NavLink>
                           <NavLink href="/admin/news">News CMS</NavLink>

                </>
              )}

              {isSeller ? (
                <>
                  <NavLink href="/my/listings">My ads</NavLink>
                  <NavLink href="/seller/inquiries">Inquiries</NavLink>
                  <NavLink href="/listings/new" className="font-semibold text-amber-700 hover:text-amber-900">
                    + New Ad
                  </NavLink>
                </>
              ) : (
                <NavLink href="/my/inquiries">My Inquiries</NavLink>
              )}

              <button
                onClick={logout}
                className="rounded-full bg-gradient-to-r from-[#f5cd82] via-[#f2b564] to-[#e6a93a] text-gray-900 font-semibold px-4 py-1.5 shadow-sm hover:shadow-md transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <NavLink href="/register" className="font-semibold text-amber-700 hover:text-amber-900">
                New Account
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-amber-200/30 bg-[rgb(252,240,210)]">
          <div className="px-4 py-3 flex flex-col gap-2 text-sm">
            <NavLink href="/" exact onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink href="/start-business" onClick={() => setOpen(false)}>Start Your Business</NavLink>

            {isAuthed ? (
              <>
                <NavLink href="/account" onClick={() => setOpen(false)}>Account</NavLink>

                {isAdmin && (
                  <>
                    <NavLink href="/admin" onClick={() => setOpen(false)}>Dashboard</NavLink>
                    <NavLink href="/admin/contacts" onClick={() => setOpen(false)}>Contacts</NavLink>
                  </>
                )}

                {isSeller ? (
                  <>
                    <NavLink href="/my/listings" onClick={() => setOpen(false)}>My ads</NavLink>
                    <NavLink href="/seller/inquiries" onClick={() => setOpen(false)}>Inquiries</NavLink>
                    <NavLink href="/listings/new" onClick={() => setOpen(false)}>+ New Ad</NavLink>
                  </>
                ) : (
                  <NavLink href="/my/inquiries" onClick={() => setOpen(false)}>My Inquiries</NavLink>
                )}

                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="mt-2 rounded-full bg-gradient-to-r from-[#f5cd82] via-[#f2b564] to-[#e6a93a] text-gray-900 font-semibold px-4 py-1.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink href="/login" onClick={() => setOpen(false)}>Login</NavLink>
                <NavLink href="/register" onClick={() => setOpen(false)}>New Account</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

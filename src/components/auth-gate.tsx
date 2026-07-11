"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-store";

/** ログインなしでアクセスできるパス。 */
const PUBLIC_PATHS = ["/login"];

/**
 * ログイン状態に応じて画面表示・遷移先を制御する。
 * 未ログイン時は保護ページを表示せずログイン画面へ、
 * ログイン済みの場合はログイン画面を表示せずトップへ遷移する。
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      router.replace("/login");
    } else if (user && isPublicPath) {
      router.replace("/");
    }
  }, [loading, user, isPublicPath, router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-stone-50">
        <p className="text-sm font-medium text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  if (user && isPublicPath) {
    return null;
  }

  return <>{children}</>;
}

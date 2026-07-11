"use client";

import Link from "next/link";
import { useThemeStore } from "@/lib/theme-store";
import { useAuth } from "@/lib/auth-store";
import {
  selectActiveThemes,
  selectContinuingThemes,
  selectDoneThemes,
} from "@/lib/themes";
import { NewThemeButton } from "@/components/new-theme-button";

export default function Home() {
  const { themes } = useThemeStore();
  const { logout } = useAuth();

  const topEntries = [
    {
      href: "/now",
      label: "今やっていること",
      count: selectActiveThemes(themes).length,
    },
    {
      href: "/continuing",
      label: "継続していること",
      count: selectContinuingThemes(themes).length,
    },
    {
      href: "/done",
      label: "終了したこと",
      count: selectDoneThemes(themes).length,
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-stone-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-5 py-10 pb-28">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-zinc-900">タスク管理アプリ</h1>
          <button
            type="button"
            onClick={() => logout()}
            className="text-sm font-medium text-zinc-500"
          >
            ログアウト
          </button>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          {topEntries.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-6 py-8 shadow-sm transition-colors active:bg-zinc-100"
            >
              <span className="text-lg font-semibold text-zinc-900">
                {entry.label}
              </span>
              <span className="flex items-baseline text-3xl font-bold text-zinc-900">
                {entry.count}
                <span className="ml-1 text-sm font-normal text-zinc-500">
                  件
                </span>
              </span>
            </Link>
          ))}
        </div>
      </main>
      <NewThemeButton />
    </div>
  );
}

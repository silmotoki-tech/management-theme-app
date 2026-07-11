"use client";

import Link from "next/link";
import { useThemeStore } from "@/lib/theme-store";
import { selectActiveThemes } from "@/lib/themes";
import { getDueDateStatus, dueDateStatusClassName } from "@/lib/due-date-status";
import { ThemeListItem } from "@/components/theme-list-item";
import { NewThemeButton } from "@/components/new-theme-button";

export default function NowListPage() {
  const { themes } = useThemeStore();
  const activeThemes = selectActiveThemes(themes);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10 pb-28">
        <Link href="/" className="text-sm font-medium text-zinc-500">
          ← トップへ戻る
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">今やっていること</h1>

        {activeThemes.length === 0 ? (
          <p className="text-sm text-zinc-500">まだ項目はありません</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activeThemes.map((theme) => (
              <ThemeListItem
                key={theme.id}
                id={theme.id}
                title={theme.title}
                accentClassName={dueDateStatusClassName(
                  getDueDateStatus(theme.dueDate)
                )}
              />
            ))}
          </div>
        )}
      </main>
      <NewThemeButton />
    </div>
  );
}

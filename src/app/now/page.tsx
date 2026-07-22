"use client";

import Link from "next/link";
import { useThemeStore } from "@/lib/theme-store";
import { selectActiveThemes } from "@/lib/themes";
import { getDueDateStatus, dueDateStatusClassName } from "@/lib/due-date-status";
import { SortableThemeList } from "@/components/sortable-theme-list";
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

        <SortableThemeList
          themes={activeThemes}
          orderField="activeOrder"
          getAccentClassName={(theme) =>
            dueDateStatusClassName(getDueDateStatus(theme.dueDate))
          }
        />
      </main>
      <NewThemeButton />
    </div>
  );
}

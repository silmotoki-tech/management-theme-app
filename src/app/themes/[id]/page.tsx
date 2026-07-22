"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useThemeStore } from "@/lib/theme-store";
import { selectThemeById } from "@/lib/themes";
import { ThemeComments } from "@/components/theme-comments";

export default function ThemeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { themes } = useThemeStore();
  const theme = selectThemeById(themes, id);

  if (!theme) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-zinc-500">
            ← トップへ戻る
          </Link>
          <Link
            href={`/themes/${theme.id}/edit`}
            className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-semibold text-zinc-700 active:bg-zinc-100"
          >
            編集
          </Link>
        </div>

        <h1 className="text-xl font-bold text-zinc-900">{theme.title}</h1>

        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-500">現在の状況</h2>
          <p className="text-base text-zinc-900">{theme.currentStatus}</p>
        </section>

        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-500">次にすること</h2>
          <p className="text-base text-zinc-900">{theme.nextAction}</p>
        </section>

        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-500">期限</h2>
          <p className="text-base text-zinc-900">
            {theme.dueDate ?? "設定なし"}
          </p>
        </section>

        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-500">次回確認日</h2>
          <p className="text-base text-zinc-900">
            {theme.nextCheckDate ?? "設定なし"}
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-zinc-500">状態</h2>
          <div className="flex flex-col gap-2">
            <StatusRow label="今取り組んでいる" value={theme.isActive} />
            <StatusRow label="継続して確認する" value={theme.isContinuing} />
            <StatusRow label="終了した" value={theme.isDone} />
          </div>
        </section>

        <ThemeComments key={theme.id} themeId={theme.id} />
      </main>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <span className="text-sm text-zinc-700">{label}</span>
      <span
        className={`text-sm font-semibold ${
          value ? "text-zinc-900" : "text-zinc-400"
        }`}
      >
        {value ? "ON" : "OFF"}
      </span>
    </div>
  );
}

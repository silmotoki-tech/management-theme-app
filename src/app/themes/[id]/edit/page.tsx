"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ThemeForm, type ThemeFormInputValues } from "@/components/theme-form";
import { useThemeStore } from "@/lib/theme-store";
import { selectThemeById } from "@/lib/themes";

export default function EditThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { themes, updateTheme } = useThemeStore();
  const theme = selectThemeById(themes, id);

  if (!theme) {
    notFound();
  }

  const initialValues: ThemeFormInputValues = {
    title: theme.title,
    currentStatus: theme.currentStatus,
    nextAction: theme.nextAction,
    dueDate: theme.dueDate ?? "",
    nextCheckDate: theme.nextCheckDate ?? "",
    isActive: theme.isActive,
    isContinuing: theme.isContinuing,
    isDone: theme.isDone,
  };

  const handleSubmit = (values: ThemeFormInputValues) => {
    updateTheme(theme.id, {
      title: values.title,
      currentStatus: values.currentStatus,
      nextAction: values.nextAction,
      dueDate: values.dueDate === "" ? null : values.dueDate,
      nextCheckDate: values.nextCheckDate === "" ? null : values.nextCheckDate,
      isActive: values.isActive,
      isContinuing: values.isContinuing,
      isDone: values.isDone,
    });

    router.push(`/themes/${theme.id}`);
  };

  return (
    <div className="flex flex-1 flex-col bg-stone-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10">
        <Link
          href={`/themes/${theme.id}`}
          className="text-sm font-medium text-zinc-500"
        >
          ← 詳細へ戻る
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">タスクを編集</h1>

        <ThemeForm
          initialValues={initialValues}
          showDoneToggle
          submitLabel="保存"
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}

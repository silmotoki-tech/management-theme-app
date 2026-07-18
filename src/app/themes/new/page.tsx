"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeForm, type ThemeFormInputValues } from "@/components/theme-form";
import { toJapaneseFirestoreError } from "@/lib/firestore-themes";
import { useThemeStore } from "@/lib/theme-store";

const initialValues: ThemeFormInputValues = {
  title: "",
  currentStatus: "",
  nextAction: "",
  dueDate: "",
  nextCheckDate: "",
  isActive: true,
  isContinuing: false,
  isDone: false,
};

export default function NewThemePage() {
  const router = useRouter();
  const { addTheme } = useThemeStore();
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (values: ThemeFormInputValues) => {
    if (submitting) return;

    setSubmitting(true);
    setSaveError(null);

    try {
      const id = await addTheme({
        title: values.title,
        currentStatus: values.currentStatus,
        nextAction: values.nextAction,
        dueDate: values.dueDate === "" ? null : values.dueDate,
        nextCheckDate: values.nextCheckDate === "" ? null : values.nextCheckDate,
        isActive: values.isActive,
        isContinuing: values.isContinuing,
      });

      router.push(`/themes/${id}`);
    } catch (error: unknown) {
      setSaveError(toJapaneseFirestoreError(error, "write"));
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-stone-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10">
        <Link href="/" className="text-sm font-medium text-zinc-500">
          ← トップへ戻る
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">新しいタスク</h1>

        <ThemeForm
          initialValues={initialValues}
          showDoneToggle={false}
          submitLabel="保存"
          submitting={submitting}
          onSubmit={handleSubmit}
        />

        {saveError && <p className="text-sm text-red-500">{saveError}</p>}
      </main>
    </div>
  );
}

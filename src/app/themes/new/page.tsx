"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeForm, type ThemeFormInputValues } from "@/components/theme-form";
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

  const handleSubmit = (values: ThemeFormInputValues) => {
    addTheme({
      title: values.title,
      currentStatus: values.currentStatus,
      nextAction: values.nextAction,
      dueDate: values.dueDate === "" ? null : values.dueDate,
      nextCheckDate: values.nextCheckDate === "" ? null : values.nextCheckDate,
      isActive: values.isActive,
      isContinuing: values.isContinuing,
    });

    router.push("/now");
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
          onSubmit={handleSubmit}
        />
      </main>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { ToggleSwitch } from "@/components/toggle-switch";

export type ThemeFormInputValues = {
  title: string;
  currentStatus: string;
  nextAction: string;
  /** input type="date"用。日付なしは空文字。 */
  dueDate: string;
  nextCheckDate: string;
  isActive: boolean;
  isContinuing: boolean;
  isDone: boolean;
};

type ThemeFormProps = {
  initialValues: ThemeFormInputValues;
  /** 「終了した」の切り替えを表示するか（新規作成時はfalse、編集時はtrue）。 */
  showDoneToggle: boolean;
  submitLabel: string;
  /** 保存処理中はtrue。二重送信防止とボタン表示に使う。 */
  submitting?: boolean;
  onSubmit: (values: ThemeFormInputValues) => void;
};

export function ThemeForm({
  initialValues,
  showDoneToggle,
  submitLabel,
  submitting = false,
  onSubmit,
}: ThemeFormProps) {
  const [values, setValues] = useState(initialValues);
  const [titleError, setTitleError] = useState(false);

  const handleDoneChange = (isDone: boolean) => {
    setValues((prev) => ({
      ...prev,
      isDone,
      // 終了したをONにした場合は、他の2つを自動でOFFにする。
      isActive: isDone ? false : prev.isActive,
      isContinuing: isDone ? false : prev.isContinuing,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (submitting) return;

    if (values.title.trim() === "") {
      setTitleError(true);
      return;
    }

    onSubmit({ ...values, title: values.title.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-semibold text-zinc-700">
          タイトル（必須）
        </label>
        <input
          id="title"
          type="text"
          value={values.title}
          onChange={(event) => {
            setValues((prev) => ({ ...prev, title: event.target.value }));
            setTitleError(false);
          }}
          className={`h-12 rounded-xl border bg-white px-4 text-base text-zinc-900 ${
            titleError ? "border-red-400" : "border-zinc-200"
          }`}
        />
        {titleError && (
          <p className="text-sm text-red-500">タイトルを入力してください</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="currentStatus"
          className="text-sm font-semibold text-zinc-700"
        >
          現在の状況
        </label>
        <textarea
          id="currentStatus"
          value={values.currentStatus}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              currentStatus: event.target.value,
            }))
          }
          rows={3}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="nextAction" className="text-sm font-semibold text-zinc-700">
          次にすること
        </label>
        <textarea
          id="nextAction"
          value={values.nextAction}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, nextAction: event.target.value }))
          }
          rows={3}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="dueDate" className="text-sm font-semibold text-zinc-700">
          期限
        </label>
        <input
          id="dueDate"
          type="date"
          value={values.dueDate}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, dueDate: event.target.value }))
          }
          className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nextCheckDate"
          className="text-sm font-semibold text-zinc-700"
        >
          次回確認日
        </label>
        <input
          id="nextCheckDate"
          type="date"
          value={values.nextCheckDate}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              nextCheckDate: event.target.value,
            }))
          }
          className="h-12 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-3">
        <ToggleSwitch
          label="今取り組んでいる"
          checked={values.isActive}
          disabled={values.isDone}
          onChange={(checked) =>
            setValues((prev) => ({ ...prev, isActive: checked }))
          }
        />
        <ToggleSwitch
          label="継続して確認する"
          checked={values.isContinuing}
          disabled={values.isDone}
          onChange={(checked) =>
            setValues((prev) => ({ ...prev, isContinuing: checked }))
          }
        />
        {showDoneToggle && (
          <ToggleSwitch
            label="終了した"
            checked={values.isDone}
            onChange={handleDoneChange}
          />
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-14 rounded-full bg-zinc-900 text-base font-semibold text-white shadow-sm active:bg-zinc-700 disabled:opacity-50"
      >
        {submitting ? "保存中..." : submitLabel}
      </button>
    </form>
  );
}

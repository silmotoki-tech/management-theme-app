"use client";

import { useState } from "react";
import Link from "next/link";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { toJapaneseFirestoreError } from "@/lib/firestore-themes";
import { useThemeStore } from "@/lib/theme-store";
import type { Theme } from "@/lib/themes";

type SortableThemeListProps = {
  themes: Theme[];
  orderField: "activeOrder" | "continuingOrder";
  getAccentClassName: (theme: Theme) => string;
};

function DragHandleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 fill-current"
    >
      <circle cx="7" cy="5" r="1.5" />
      <circle cx="13" cy="5" r="1.5" />
      <circle cx="7" cy="10" r="1.5" />
      <circle cx="13" cy="10" r="1.5" />
      <circle cx="7" cy="15" r="1.5" />
      <circle cx="13" cy="15" r="1.5" />
    </svg>
  );
}

function SortableThemeItem({
  theme,
  index,
  accentClassName,
  sortableEnabled,
}: {
  theme: Theme;
  index: number;
  accentClassName: string;
  sortableEnabled: boolean;
}) {
  const { ref, handleRef, isDragSource } = useSortable({
    id: theme.id,
    index,
    disabled: !sortableEnabled,
  });

  return (
    <div
      ref={ref}
      className={`flex items-stretch rounded-xl border-l-4 shadow-sm ${accentClassName} ${
        isDragSource ? "opacity-60 ring-2 ring-zinc-400" : ""
      }`}
    >
      <Link
        href={`/themes/${theme.id}`}
        className="flex min-w-0 flex-1 items-center px-4 py-4 transition-colors active:bg-zinc-100/80"
      >
        <span className="text-base font-medium text-zinc-900">{theme.title}</span>
      </Link>

      {sortableEnabled && (
        <button
          type="button"
          ref={handleRef}
          aria-label={`${theme.title}を並び替え`}
          className="flex w-11 shrink-0 touch-none items-center justify-center text-zinc-400 active:text-zinc-600"
        >
          <DragHandleIcon />
        </button>
      )}
    </div>
  );
}

/**
 * 「今やっていること」「継続していること」用の並び替え可能な一覧。
 * 右端のドラッグハンドルだけで並び替え、カード本体タップは詳細へ遷移する。
 */
export function SortableThemeList({
  themes,
  orderField,
  getAccentClassName,
}: SortableThemeListProps) {
  const { reorderThemes, reordering } = useThemeStore();
  /** ドラッグ中・保存直前だけ使う下書き。nullのときはpropsのthemesを表示する。 */
  const [draftItems, setDraftItems] = useState<Theme[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const items = draftItems ?? themes;
  const sortableEnabled = themes.length > 1 && !reordering;

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">まだ項目はありません</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <DragDropProvider
        onDragStart={() => {
          if (!sortableEnabled) return;
          setSaveError(null);
          setDraftItems(themes);
        }}
        onDragOver={(event) => {
          if (!sortableEnabled) return;
          setDraftItems((current) => move(current ?? themes, event));
        }}
        onDragEnd={async (event) => {
          if (event.canceled || !sortableEnabled) {
            setDraftItems(null);
            return;
          }

          const nextItems = move(draftItems ?? themes, event);
          const orderChanged = nextItems.some(
            (item, index) => item.id !== themes[index]?.id
          );

          if (!orderChanged) {
            setDraftItems(null);
            return;
          }

          setDraftItems(nextItems);

          try {
            await reorderThemes(
              nextItems.map((item) => item.id),
              orderField
            );
            setDraftItems(null);
          } catch (error: unknown) {
            setDraftItems(null);
            setSaveError(toJapaneseFirestoreError(error, "write"));
          }
        }}
      >
        {items.map((theme, index) => (
          <SortableThemeItem
            key={theme.id}
            theme={theme}
            index={index}
            accentClassName={getAccentClassName(theme)}
            sortableEnabled={sortableEnabled}
          />
        ))}
      </DragDropProvider>

      {reordering && (
        <p className="text-sm font-medium text-zinc-500">順番を保存中...</p>
      )}
      {saveError && <p className="text-sm text-red-500">{saveError}</p>}
    </div>
  );
}

export type DueDateStatus = "overdue" | "soon" | "none";

/** この日数以内であれば「期限が近い」とみなす。 */
const SOON_THRESHOLD_DAYS = 7;

export function getDueDateStatus(dueDate: string | null): DueDateStatus {
  if (!dueDate) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${dueDate}T00:00:00`);

  const diffDays = Math.floor(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "overdue";
  if (diffDays <= SOON_THRESHOLD_DAYS) return "soon";
  return "none";
}

/**
 * タイトル左端の細い線とカード背景の色クラス。色の意味は期限だけに限定する。
 * 背景はごく薄い色にとどめ、警告が強すぎないようにする。
 */
export function dueDateStatusClassName(status: DueDateStatus): string {
  switch (status) {
    case "overdue":
      return "border-l-red-500 bg-red-50";
    case "soon":
      return "border-l-yellow-400 bg-yellow-50";
    case "none":
      return "border-l-transparent bg-white";
  }
}

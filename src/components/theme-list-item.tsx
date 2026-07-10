import Link from "next/link";

type ThemeListItemProps = {
  id: string;
  title: string;
  /** 期限表示用の左端の線と背景の色クラス（例: "border-l-red-500 bg-red-50"）。色なしの場合は"border-l-transparent bg-white"。 */
  accentClassName: string;
};

export function ThemeListItem({
  id,
  title,
  accentClassName,
}: ThemeListItemProps) {
  return (
    <Link
      href={`/themes/${id}`}
      className={`flex items-center rounded-xl border-l-4 px-4 py-4 shadow-sm transition-colors active:bg-zinc-100 ${accentClassName}`}
    >
      <span className="text-base font-medium text-zinc-900">{title}</span>
    </Link>
  );
}

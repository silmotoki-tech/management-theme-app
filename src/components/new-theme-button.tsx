import Link from "next/link";

/**
 * iPhoneで片手操作しやすいよう、画面下部に固定表示する新規追加ボタン。
 * 一覧の内容がこのボタンの下に隠れないよう、呼び出し側でmainにpb-28程度の余白を確保する。
 */
export function NewThemeButton() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent px-5 pb-6 pt-10">
      <Link
        href="/themes/new"
        className="flex h-14 w-full max-w-md items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white shadow-lg active:bg-zinc-700"
      >
        ＋ 新しいタスク
      </Link>
    </div>
  );
}

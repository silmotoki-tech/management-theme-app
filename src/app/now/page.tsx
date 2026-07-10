import Link from "next/link";

export default function NowListPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-10">
        <Link href="/" className="text-sm font-medium text-zinc-500">
          ← トップへ戻る
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">今やっていること</h1>
        <p className="text-sm text-zinc-500">まだ項目はありません</p>
      </main>
    </div>
  );
}

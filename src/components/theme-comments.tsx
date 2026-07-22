"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-store";
import {
  COMMENT_MAX_LENGTH,
  createThemeComment,
  fetchThemeComments,
  formatCommentCreatedAt,
  type ThemeComment,
} from "@/lib/firestore-comments";
import { toJapaneseFirestoreError } from "@/lib/firestore-themes";

type ThemeCommentsProps = {
  themeId: string;
};

export function ThemeComments({ themeId }: ThemeCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<ThemeComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchThemeComments(themeId)
      .then((loadedComments) => {
        if (cancelled) return;
        setComments(loadedComments);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(toJapaneseFirestoreError(error, "read"));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [themeId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting || !user) return;

    const trimmed = text.trim();
    if (trimmed === "") {
      setSubmitError("コメントを入力してください");
      return;
    }
    if (trimmed.length > COMMENT_MAX_LENGTH) {
      setSubmitError(
        `コメントは${COMMENT_MAX_LENGTH}文字以内で入力してください`
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createThemeComment(themeId, trimmed, user.uid);
      const loadedComments = await fetchThemeComments(themeId);
      setComments(loadedComments);
      setText("");
    } catch (error: unknown) {
      setSubmitError(toJapaneseFirestoreError(error, "write"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 border-t border-zinc-200 pt-6">
      <h2 className="text-sm font-semibold text-zinc-500">コメント</h2>

      {loading ? (
        <p className="text-sm text-zinc-500">読み込み中...</p>
      ) : loadError ? (
        <p className="text-sm text-red-500">{loadError}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-zinc-500">コメントはまだありません</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-900">
                  {comment.authorName || "不明なユーザー"}
                </span>
                <span className="shrink-0 text-xs text-zinc-400">
                  {formatCommentCreatedAt(comment.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-zinc-800">
                {comment.text}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="comment-text" className="sr-only">
          コメント本文
        </label>
        <textarea
          id="comment-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="コメントを入力"
          disabled={submitting || !user}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 disabled:opacity-50"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-zinc-400">
            {text.length}/{COMMENT_MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={submitting || !user}
            className="h-11 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm active:bg-zinc-700 disabled:opacity-50"
          >
            {submitting ? "投稿中..." : "投稿"}
          </button>
        </div>
        {submitError && <p className="text-sm text-red-500">{submitError}</p>}
      </form>
    </section>
  );
}

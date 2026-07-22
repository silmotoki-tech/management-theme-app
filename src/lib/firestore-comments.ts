import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";

export const COMMENT_MAX_LENGTH = 1000;

export type ThemeComment = {
  id: string;
  authorUid: string;
  authorName: string;
  text: string;
  /** serverTimestamp反映前はnullになりうる。 */
  createdAt: Timestamp | null;
};

function toThemeComment(id: string, data: DocumentData): ThemeComment {
  return {
    id,
    authorUid: typeof data.authorUid === "string" ? data.authorUid : "",
    authorName: typeof data.authorName === "string" ? data.authorName : "",
    text: typeof data.text === "string" ? data.text : "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
  };
}

/** コメントの投稿日時を表示用の日本語文字列にする。未確定時は壊れない文言を返す。 */
export function formatCommentCreatedAt(createdAt: Timestamp | null): string {
  if (!createdAt) {
    return "投稿時刻を取得中...";
  }

  return createdAt.toDate().toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * themes/{themeId}/comments を createdAt の昇順で取得する。
 */
export async function fetchThemeComments(
  themeId: string
): Promise<ThemeComment[]> {
  const commentsQuery = query(
    collection(firestoreDb, "themes", themeId, "comments"),
    orderBy("createdAt", "asc")
  );
  const commentsSnap = await getDocs(commentsQuery);

  return commentsSnap.docs.map((commentDoc) =>
    toThemeComment(commentDoc.id, commentDoc.data())
  );
}

/**
 * コメントを投稿する。authorNameはusers/{uid}.nameをそのまま使う
 * （Security Rulesの照合と一致させるため）。
 */
export async function createThemeComment(
  themeId: string,
  text: string,
  uid: string
): Promise<void> {
  const trimmed = text.trim();
  if (trimmed === "") {
    throw new Error("コメントを入力してください");
  }
  if (trimmed.length > COMMENT_MAX_LENGTH) {
    throw new Error(
      `コメントは${COMMENT_MAX_LENGTH}文字以内で入力してください`
    );
  }

  const userSnap = await getDoc(doc(firestoreDb, "users", uid));
  if (!userSnap.exists()) {
    throw new Error("ユーザー情報が見つかりません");
  }

  const authorName = userSnap.data().name;
  if (typeof authorName !== "string" || authorName === "") {
    throw new Error("ユーザー名が設定されていません");
  }

  await addDoc(collection(firestoreDb, "themes", themeId, "comments"), {
    authorUid: uid,
    authorName,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
}

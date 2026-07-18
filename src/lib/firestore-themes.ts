import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import type { Theme } from "@/lib/themes";

/**
 * Firestoreのthemeドキュメントを既存のTheme型へ変換する。
 * ドキュメントIDをTheme.idとして使う。
 */
export function toTheme(id: string, data: DocumentData): Theme {
  return {
    id,
    title: typeof data.title === "string" ? data.title : "",
    currentStatus:
      typeof data.currentStatus === "string" ? data.currentStatus : "",
    nextAction: typeof data.nextAction === "string" ? data.nextAction : "",
    dueDate: typeof data.dueDate === "string" ? data.dueDate : null,
    nextCheckDate:
      typeof data.nextCheckDate === "string" ? data.nextCheckDate : null,
    isActive: Boolean(data.isActive),
    isContinuing: Boolean(data.isContinuing),
    isDone: Boolean(data.isDone),
    activeOrder: typeof data.activeOrder === "number" ? data.activeOrder : null,
    continuingOrder:
      typeof data.continuingOrder === "number" ? data.continuingOrder : null,
  };
}

/**
 * ログイン中ユーザーの所属グループ（初期版は先頭のgroupId）で
 * themesを絞り込んで取得する。書き込みは行わない。
 */
export async function fetchThemesForUser(uid: string): Promise<Theme[]> {
  const userSnap = await getDoc(doc(firestoreDb, "users", uid));

  if (!userSnap.exists()) {
    throw new Error("ユーザー情報が見つかりません");
  }

  const groupIds = userSnap.data().groupIds;
  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    throw new Error("所属グループが設定されていません");
  }

  const groupId = groupIds[0];
  if (typeof groupId !== "string" || groupId === "") {
    throw new Error("所属グループが正しく設定されていません");
  }

  const themesQuery = query(
    collection(firestoreDb, "themes"),
    where("groupId", "==", groupId)
  );
  const themesSnap = await getDocs(themesQuery);

  return themesSnap.docs.map((themeDoc) =>
    toTheme(themeDoc.id, themeDoc.data())
  );
}

/** Firestore読み取りエラーを画面表示用の日本語メッセージに変換する。 */
export function toJapaneseFirestoreError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "データへのアクセス権限がありません";
      case "unavailable":
        return "ネットワークに接続できません。しばらくしてから再度お試しください";
      case "not-found":
        return "データが見つかりません";
      default:
        return "データの読み込みに失敗しました";
    }
  }

  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  return "データの読み込みに失敗しました";
}

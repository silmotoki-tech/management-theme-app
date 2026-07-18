import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";
import type { Theme } from "@/lib/themes";

/** 既存テーマ更新時にFirestoreへ送る編集可能項目。groupId等は含めない。 */
export type ThemeUpdatePayload = {
  title: string;
  currentStatus: string;
  nextAction: string;
  dueDate: string | null;
  nextCheckDate: string | null;
  isActive: boolean;
  isContinuing: boolean;
  isDone: boolean;
  activeOrder: number | null;
  continuingOrder: number | null;
};

/** 新規テーマ作成時にFirestoreへ送る項目。groupIdは関数内でusersから取得する。 */
export type ThemeCreatePayload = ThemeUpdatePayload;

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

/** users/{uid} から初期版用の先頭groupIdを取得する。 */
async function getPrimaryGroupId(uid: string): Promise<string> {
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

  return groupId;
}

/**
 * ログイン中ユーザーの所属グループ（初期版は先頭のgroupId）で
 * themesを絞り込んで取得する。
 */
export async function fetchThemesForUser(uid: string): Promise<Theme[]> {
  const groupId = await getPrimaryGroupId(uid);

  const themesQuery = query(
    collection(firestoreDb, "themes"),
    where("groupId", "==", groupId)
  );
  const themesSnap = await getDocs(themesQuery);

  return themesSnap.docs.map((themeDoc) =>
    toTheme(themeDoc.id, themeDoc.data())
  );
}

/**
 * 新規テーマをaddDocで作成する。ドキュメントIDはFirestoreが自動発行する。
 * groupIdはusers/{uid}.groupIdsの先頭を使う。
 */
export async function createThemeInFirestore(
  values: ThemeCreatePayload,
  uid: string
): Promise<string> {
  const groupId = await getPrimaryGroupId(uid);

  const docRef = await addDoc(collection(firestoreDb, "themes"), {
    title: values.title,
    currentStatus: values.currentStatus,
    nextAction: values.nextAction,
    dueDate: values.dueDate,
    nextCheckDate: values.nextCheckDate,
    isActive: values.isActive,
    isContinuing: values.isContinuing,
    isDone: values.isDone,
    activeOrder: values.activeOrder,
    continuingOrder: values.continuingOrder,
    groupId,
    createdBy: uid,
    updatedBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * 既存テーマを更新する。編集可能な項目だけをupdateDocで更新し、
 * groupId / createdBy / createdAt は変更しない。
 */
export async function updateThemeInFirestore(
  themeId: string,
  values: ThemeUpdatePayload,
  uid: string
): Promise<void> {
  await updateDoc(doc(firestoreDb, "themes", themeId), {
    title: values.title,
    currentStatus: values.currentStatus,
    nextAction: values.nextAction,
    dueDate: values.dueDate,
    nextCheckDate: values.nextCheckDate,
    isActive: values.isActive,
    isContinuing: values.isContinuing,
    isDone: values.isDone,
    activeOrder: values.activeOrder,
    continuingOrder: values.continuingOrder,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  });
}

/** Firestoreエラーを画面表示用の日本語メッセージに変換する。 */
export function toJapaneseFirestoreError(
  error: unknown,
  action: "read" | "write" = "read"
): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "permission-denied":
        return "データへのアクセス権限がありません";
      case "unavailable":
        return "ネットワークに接続できません。しばらくしてから再度お試しください";
      case "not-found":
        return "データが見つかりません";
      default:
        return action === "write"
          ? "データの保存に失敗しました"
          : "データの読み込みに失敗しました";
    }
  }

  if (error instanceof Error && error.message !== "") {
    return error.message;
  }

  return action === "write"
    ? "データの保存に失敗しました"
    : "データの読み込みに失敗しました";
}

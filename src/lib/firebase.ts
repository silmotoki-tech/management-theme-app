import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Next.jsの開発サーバーはホットリロード時にモジュールを再評価することがあるため、
 * 既にFirebaseアプリが初期化済みならそれを再利用し、二重初期化を防ぐ。
 */
export const firebaseApp: FirebaseApp =
  getApps()[0] ?? initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);

/**
 * Firestoreインスタンス。この段階では接続の土台のみを用意し、
 * 実データの読み書きは行わない（既存の仮データ機能はThemeStoreのまま維持する）。
 */
export const firestoreDb: Firestore = getFirestore(firebaseApp);

/**
 * Firestoreの実データへは触れず、SDKの初期化が例外なく完了したことだけを
 * ブラウザのコンソールで確認するための最小限の処理。
 */
if (typeof window !== "undefined") {
  console.log(
    "[firebase] Firestore initialized for project:",
    firestoreDb.app.options.projectId
  );
}

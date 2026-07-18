"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-store";
import {
  createThemeInFirestore,
  fetchThemesForUser,
  toJapaneseFirestoreError,
  updateThemeInFirestore,
} from "@/lib/firestore-themes";
import type { Theme } from "@/lib/themes";

export type ThemeFormValues = {
  title: string;
  currentStatus: string;
  nextAction: string;
  dueDate: string | null;
  nextCheckDate: string | null;
  isActive: boolean;
  isContinuing: boolean;
  isDone: boolean;
};

type ThemeStoreContextValue = {
  themes: Theme[];
  /** 新規テーマをFirestoreへ作成し、発行したドキュメントIDを返す。 */
  addTheme: (values: Omit<ThemeFormValues, "isDone">) => Promise<string>;
  /** 既存テーマをFirestoreへ更新し、一覧を再取得する。 */
  updateTheme: (id: string, values: ThemeFormValues) => Promise<void>;
};

const ThemeStoreContext = createContext<ThemeStoreContextValue | null>(null);

function nextOrder(themes: Theme[], key: "activeOrder" | "continuingOrder"): number {
  const max = themes.reduce((acc, theme) => {
    const value = theme[key];
    return value !== null && value > acc ? value : acc;
  }, 0);
  return max + 1;
}

function buildCreateThemeFields(
  values: Omit<ThemeFormValues, "isDone">,
  themes: Theme[]
) {
  // 新規作成画面ではisDoneトグルを出さないため、常にfalseで作成する。
  const isDone = false;
  const isActive = values.isActive;
  const isContinuing = values.isContinuing;

  return {
    title: values.title,
    currentStatus: values.currentStatus,
    nextAction: values.nextAction,
    dueDate: values.dueDate,
    nextCheckDate: values.nextCheckDate,
    isActive,
    isContinuing,
    isDone,
    activeOrder: isActive ? nextOrder(themes, "activeOrder") : null,
    continuingOrder: isContinuing
      ? nextOrder(themes, "continuingOrder")
      : null,
  };
}

function buildUpdatedThemeFields(
  theme: Theme,
  values: ThemeFormValues,
  themes: Theme[]
) {
  // 終了したをONにした場合は、今取り組んでいる・継続して確認するを自動でOFFにする。
  const isDone = values.isDone;
  const isActive = isDone ? false : values.isActive;
  const isContinuing = isDone ? false : values.isContinuing;

  return {
    title: values.title,
    currentStatus: values.currentStatus,
    nextAction: values.nextAction,
    dueDate: values.dueDate,
    nextCheckDate: values.nextCheckDate,
    isActive,
    isContinuing,
    isDone,
    activeOrder: isActive
      ? theme.activeOrder ?? nextOrder(themes, "activeOrder")
      : null,
    continuingOrder: isContinuing
      ? theme.continuingOrder ?? nextOrder(themes, "continuingOrder")
      : null,
  };
}

/**
 * ログイン済みユーザー向け。マウント時にFirestoreからthemesを読み取る。
 * uidが変わると親側で再マウントされる想定。
 */
function LoggedInThemeStoreProvider({
  uid,
  children,
}: {
  uid: string;
  children: ReactNode;
}) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchThemesForUser(uid)
      .then((loadedThemes) => {
        if (cancelled) return;
        setThemes(loadedThemes);
        setLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setThemes([]);
        setError(toJapaneseFirestoreError(fetchError, "read"));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const addTheme: ThemeStoreContextValue["addTheme"] = async (values) => {
    const payload = buildCreateThemeFields(values, themes);
    const id = await createThemeInFirestore(payload, uid);
    const loadedThemes = await fetchThemesForUser(uid);
    setThemes(loadedThemes);
    return id;
  };

  const updateTheme: ThemeStoreContextValue["updateTheme"] = async (
    id,
    values
  ) => {
    const theme = themes.find((item) => item.id === id);
    if (!theme) {
      throw new Error("更新対象のテーマが見つかりません");
    }

    const payload = buildUpdatedThemeFields(theme, values, themes);
    await updateThemeInFirestore(id, payload, uid);
    const loadedThemes = await fetchThemesForUser(uid);
    setThemes(loadedThemes);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-stone-50">
        <p className="text-sm font-medium text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-stone-50 px-5">
        <p className="text-center text-sm font-medium text-red-500">{error}</p>
        <p className="text-center text-sm text-zinc-500">
          ページを再読み込みするか、再度ログインしてください
        </p>
      </div>
    );
  }

  return (
    <ThemeStoreContext.Provider value={{ themes, addTheme, updateTheme }}>
      {children}
    </ThemeStoreContext.Provider>
  );
}

export function ThemeStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // 未ログイン時（ログイン画面など）はFirestore読み取りを行わない。
  if (!user) {
    const addTheme: ThemeStoreContextValue["addTheme"] = async () => {
      throw new Error("ログインが必要です");
    };
    const updateTheme: ThemeStoreContextValue["updateTheme"] = async () => {
      throw new Error("ログインが必要です");
    };

    return (
      <ThemeStoreContext.Provider
        value={{ themes: [], addTheme, updateTheme }}
      >
        {children}
      </ThemeStoreContext.Provider>
    );
  }

  return (
    <LoggedInThemeStoreProvider key={user.uid} uid={user.uid}>
      {children}
    </LoggedInThemeStoreProvider>
  );
}

export function useThemeStore() {
  const context = useContext(ThemeStoreContext);
  if (!context) {
    throw new Error("useThemeStore must be used within a ThemeStoreProvider");
  }
  return context;
}

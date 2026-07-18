"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useAuth } from "@/lib/auth-store";
import {
  fetchThemesForUser,
  toJapaneseFirestoreError,
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
  /** 新規テーマを追加し、発行したidを返す。isDoneは常にfalseで作成する。 */
  addTheme: (values: Omit<ThemeFormValues, "isDone">) => string;
  /** 既存テーマを更新する。終了したがONの場合は他の2状態を自動でOFFにする。 */
  updateTheme: (id: string, values: ThemeFormValues) => void;
};

const ThemeStoreContext = createContext<ThemeStoreContextValue | null>(null);

function nextOrder(themes: Theme[], key: "activeOrder" | "continuingOrder"): number {
  const max = themes.reduce((acc, theme) => {
    const value = theme[key];
    return value !== null && value > acc ? value : acc;
  }, 0);
  return max + 1;
}

function createThemeId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function useThemeMutations(setThemes: Dispatch<SetStateAction<Theme[]>>) {
  const addTheme: ThemeStoreContextValue["addTheme"] = (values) => {
    const id = createThemeId();

    setThemes((prev) => [
      ...prev,
      {
        id,
        title: values.title,
        currentStatus: values.currentStatus,
        nextAction: values.nextAction,
        dueDate: values.dueDate,
        nextCheckDate: values.nextCheckDate,
        isActive: values.isActive,
        isContinuing: values.isContinuing,
        isDone: false,
        activeOrder: values.isActive ? nextOrder(prev, "activeOrder") : null,
        continuingOrder: values.isContinuing
          ? nextOrder(prev, "continuingOrder")
          : null,
      },
    ]);

    return id;
  };

  const updateTheme: ThemeStoreContextValue["updateTheme"] = (id, values) => {
    setThemes((prev) =>
      prev.map((theme) => {
        if (theme.id !== id) return theme;

        // 終了したをONにした場合は、今取り組んでいる・継続して確認するを自動でOFFにする。
        const isDone = values.isDone;
        const isActive = isDone ? false : values.isActive;
        const isContinuing = isDone ? false : values.isContinuing;

        return {
          ...theme,
          title: values.title,
          currentStatus: values.currentStatus,
          nextAction: values.nextAction,
          dueDate: values.dueDate,
          nextCheckDate: values.nextCheckDate,
          isActive,
          isContinuing,
          isDone,
          activeOrder: isActive
            ? theme.activeOrder ?? nextOrder(prev, "activeOrder")
            : null,
          continuingOrder: isContinuing
            ? theme.continuingOrder ?? nextOrder(prev, "continuingOrder")
            : null,
        };
      })
    );
  };

  return { addTheme, updateTheme };
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
  const { addTheme, updateTheme } = useThemeMutations(setThemes);

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
        setError(toJapaneseFirestoreError(fetchError));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

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
  const [themes, setThemes] = useState<Theme[]>([]);
  const { addTheme, updateTheme } = useThemeMutations(setThemes);

  // 未ログイン時（ログイン画面など）はFirestore読み取りを行わない。
  if (!user) {
    return (
      <ThemeStoreContext.Provider value={{ themes, addTheme, updateTheme }}>
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

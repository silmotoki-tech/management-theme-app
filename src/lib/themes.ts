export type Theme = {
  id: string;
  title: string;
  currentStatus: string;
  nextAction: string;
  /** YYYY-MM-DD形式。「今やっていること」の期限として使う。 */
  dueDate: string | null;
  /** YYYY-MM-DD形式。「継続していること」の次回確認日として使う。 */
  nextCheckDate: string | null;
  isActive: boolean;
  isContinuing: boolean;
  isDone: boolean;
  activeOrder: number | null;
  continuingOrder: number | null;
};

/**
 * 仮の経営テーマデータ（Firebase未導入のため、ここに1か所にまとめて管理する）。
 * 画面上で新規追加・編集をしても、ここで定義した初期値自体は変わらない
 * （state（状態）としてコピーを持ち、ブラウザ再読み込みでこの初期値に戻る）。
 * 同じテーマが「今やっていること」と「継続していること」の両方に表示されるケースも含む。
 */
export const initialThemes: Theme[] = [
  {
    id: "vet-education",
    title: "獣医師教育制度の見直し",
    currentStatus: "新人向け教育プログラムの骨子を検討中",
    nextAction: "次回の院長・副院長ミーティングでカリキュラム案を確認する",
    dueDate: "2026-07-14",
    nextCheckDate: "2026-07-14",
    isActive: true,
    isContinuing: true,
    isDone: false,
    activeOrder: 1,
    continuingOrder: 1,
  },
  {
    id: "staffing-busy-season",
    title: "繁忙期の人員配置",
    currentStatus: "夏の繁忙期に向けたシフト調整案を作成中",
    nextAction: "各スタッフの希望シフトを集めて調整する",
    dueDate: "2026-07-08",
    nextCheckDate: null,
    isActive: true,
    isContinuing: false,
    isDone: false,
    activeOrder: 2,
    continuingOrder: null,
  },
  {
    id: "new-hospital-facility",
    title: "新病院の設備計画",
    currentStatus: "設備選定が完了し、導入作業も完了済み",
    nextAction: "特になし",
    dueDate: null,
    nextCheckDate: null,
    isActive: false,
    isContinuing: false,
    isDone: true,
    activeOrder: null,
    continuingOrder: null,
  },
];

export function selectActiveThemes(themes: Theme[]): Theme[] {
  return themes
    .filter((theme) => theme.isActive)
    .sort((a, b) => (a.activeOrder ?? 0) - (b.activeOrder ?? 0));
}

export function selectContinuingThemes(themes: Theme[]): Theme[] {
  return themes
    .filter((theme) => theme.isContinuing)
    .sort((a, b) => (a.continuingOrder ?? 0) - (b.continuingOrder ?? 0));
}

export function selectDoneThemes(themes: Theme[]): Theme[] {
  return themes.filter((theme) => theme.isDone);
}

export function selectThemeById(themes: Theme[], id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id);
}

export type Theme = {
  id: string;
  title: string;
  currentStatus: string;
  nextAction: string;
  /** YYYY-MM-DD形式。「今やっていること」では期限、「継続していること」では次回確認日として扱う。 */
  dueDate: string | null;
  isActive: boolean;
  isContinuing: boolean;
  isDone: boolean;
  activeOrder: number | null;
  continuingOrder: number | null;
};

/**
 * 仮の経営テーマデータ（Firebase未導入のため、ここに1か所にまとめて管理する）。
 * 同じテーマが「今やっていること」と「継続していること」の両方に表示されるケースも含む。
 */
export const themes: Theme[] = [
  {
    id: "vet-education",
    title: "獣医師教育制度の見直し",
    currentStatus: "新人向け教育プログラムの骨子を検討中",
    nextAction: "次回の院長・副院長ミーティングでカリキュラム案を確認する",
    dueDate: "2026-07-14",
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
    isActive: false,
    isContinuing: false,
    isDone: true,
    activeOrder: null,
    continuingOrder: null,
  },
];

export function getActiveThemes(): Theme[] {
  return themes
    .filter((theme) => theme.isActive)
    .sort((a, b) => (a.activeOrder ?? 0) - (b.activeOrder ?? 0));
}

export function getContinuingThemes(): Theme[] {
  return themes
    .filter((theme) => theme.isContinuing)
    .sort((a, b) => (a.continuingOrder ?? 0) - (b.continuingOrder ?? 0));
}

export function getDoneThemes(): Theme[] {
  return themes.filter((theme) => theme.isDone);
}

export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id);
}

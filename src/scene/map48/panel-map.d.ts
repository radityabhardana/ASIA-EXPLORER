export interface PanelMapInstance {
  setVisited: (codes: string[]) => void;
  resize: () => void;
  destroy: () => void;
}

export interface MountPanelMapOptions {
  visited?: string[];
  today?: string | null;
  onSelect?: (code: string) => void;
  interactive?: boolean;
}

export function mountPanelMap(
  stage: HTMLElement,
  options?: MountPanelMapOptions,
): Promise<PanelMapInstance>;

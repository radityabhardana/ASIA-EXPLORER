export {};

export interface Map48Ink {
  left: number;
  right: number;
  top: number;
  bottom: number;
  widthPx: number;
  heightPx: number;
  viewportWidth: number;
  widthVw: number;
}

export interface Map48Debug {
  ready: boolean;
  countryCount: number;
  measureInk: () => Map48Ink | null;
  projected: (code: string) => { x: number; y: number } | null;
  setAutoRotate?: (on: boolean) => void;
  setPaused?: (on: boolean) => void;
}

declare global {
  interface Window {
    __asiakin_map48?: Map48Debug;
  }
}

import rawThemes from './themes.json';

export interface ThemeContrast {
  inkVsBase: number;
  inkMutedVsBase: number;
}

export interface CountryTheme {
  base: string;
  soil: string;
  accent: string;
  contourStroke: string;
  contourOpacity: number;
  contrast: ThemeContrast;
}

export interface ThemesData {
  version: number;
  countries: Record<string, CountryTheme>;
}

export const themes: ThemesData = rawThemes as ThemesData;

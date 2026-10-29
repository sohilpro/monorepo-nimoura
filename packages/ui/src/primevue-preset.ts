export const nimouraPalette = {
  50: '#fbf4f5',
  100: '#f5e4e6',
  200: '#eccad0',
  300: '#e0a7b1',
  400: '#ce7f8d',
  500: '#b76e79',
  600: '#a15661',
  700: '#87444f',
  800: '#713a43',
  900: '#5e333a',
  950: '#341a1e',
} as const;

export const nimouraThemePreset = {
  semantic: {
    nimoura: nimouraPalette,
    primary: nimouraPalette,
  },
};

// @legalgen-ignore-scan
export interface AccentGradient {
  on: boolean;
  color2: string;
  direction: string;
}

export interface AccentState {
  color: string;
  gradient?: AccentGradient | null;
}

export const ACCENT_PRESETS = [
  { name: 'Blau', value: '#0284c7' },
  { name: 'Türkis', value: '#0d9488' },
  { name: 'Grün', value: '#16a34a' },
  { name: 'Lila', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Rot', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Schiefer', value: '#475569' }
];

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].value;

export const GRADIENT_PRESETS = [
  { name: 'Goldgelb & Bernstein', color1: '#d97706', color2: '#facc15' },
  { name: 'Warmes Orange & Pfirsich', color1: '#ea580c', color2: '#fb923c' },
  { name: 'Himmelblau & Türkis', color1: '#0284c7', color2: '#14b8a6' },
  { name: 'Königsblau & Cyan', color1: '#1d4ed8', color2: '#06b6d4' },
  { name: 'Wald- & Apfelgrün', color1: '#15803d', color2: '#84cc16' },
  { name: 'Lila & Pink', color1: '#7c3aed', color2: '#ec4899' },
  { name: 'Erdbeerrot & Koralle', color1: '#e11d48', color2: '#f97316' },
  { name: 'Ozean & Petrol', color1: '#0f766e', color2: '#0284c7' }
];

export const GRADIENT_DIRECTIONS = [
  { main: '90deg', back: '270deg', mainLabel: 'Links nach Rechts', backLabel: 'Rechts nach Links', title: 'Horizontaler Verlauf' },
  { main: '180deg', back: '0deg', mainLabel: 'Oben nach Unten', backLabel: 'Unten nach Oben', title: 'Vertikaler Verlauf' },
  { main: '135deg', back: '315deg', mainLabel: 'Diagonal nach unten', backLabel: 'Diagonal nach oben', title: 'Diagonale nach unten rechts' },
  { main: '45deg', back: '225deg', mainLabel: 'Diagonal nach rechts', backLabel: 'Diagonal nach links', title: 'Diagonale nach oben rechts' }
];

const SHADES: Record<number, [string, number] | null> = {
  50: ['white', 7],
  100: ['white', 14],
  200: ['white', 28],
  300: ['white', 48],
  400: ['white', 72],
  500: ['white', 88],
  600: null,
  700: ['black', 18],
  800: ['black', 34],
  900: ['black', 50]
};

const STORAGE_KEY = 'legalgen_accent_v1';

export const loadAccentState = (): AccentState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        color: parsed.color || DEFAULT_ACCENT,
        gradient: parsed.gradient || { on: false, color2: '#14b8a6', direction: '135deg' }
      };
    }
  } catch {
    // ignore
  }
  return {
    color: DEFAULT_ACCENT,
    gradient: { on: false, color2: '#14b8a6', direction: '135deg' }
  };
};

export const saveAccentState = (state: AccentState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  applyAccent(state.color, state.gradient);
};

export const applyAccent = (color?: string, gradient?: AccentGradient | null) => {
  const root = document.documentElement;
  if (gradient?.on) {
    const c1 = color || DEFAULT_ACCENT;
    const c2 = gradient.color2 || '#14b8a6';
    const dir = gradient.direction || '135deg';
    root.style.setProperty('--app-accent-gradient', `linear-gradient(${dir}, ${c1}, ${c2})`);
    root.style.setProperty('--app-accent-gradient-soft', `linear-gradient(${dir}, color-mix(in oklab, ${c1} 16%, white), color-mix(in oklab, ${c2} 22%, white))`);
    root.style.setProperty('--app-accent-gradient-text', `linear-gradient(${dir}, color-mix(in oklab, ${c1}, black 15%), color-mix(in oklab, ${c2}, black 25%))`);
    root.classList.add('app-accent-grad');
  } else {
    ['--app-accent-gradient', '--app-accent-gradient-soft', '--app-accent-gradient-text'].forEach(n => root.style.removeProperty(n));
    root.classList.remove('app-accent-grad');
  }

  const custom = Boolean(color && color.toLowerCase() !== DEFAULT_ACCENT);
  const names = ['--color-primary', '--color-primary-hover', ...Object.keys(SHADES).map(k => `--color-sky-${k}`)];
  if (!custom) {
    names.forEach(n => root.style.removeProperty(n));
    root.classList.remove('app-accent');
    return;
  }

  root.style.setProperty('--color-primary', color!);
  root.style.setProperty('--color-primary-hover', `color-mix(in oklab, ${color}, black 18%)`);
  for (const [k, mix] of Object.entries(SHADES)) {
    root.style.setProperty(
      `--color-sky-${k}`,
      mix ? `color-mix(in oklab, ${color} ${mix[0] === 'white' ? mix[1] : 100 - mix[1]}%, ${mix[0]})` : color!
    );
  }
  root.classList.add('app-accent');
};


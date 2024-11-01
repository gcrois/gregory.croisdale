import type { APIRoute } from 'astro';
import { 
  argbFromHex, 
  themeFromSourceColor, 
  hexFromArgb,
  type Theme,
  type CustomColor
} from "@material/material-color-utilities";

// Your base colors as argb numbers
const baseColors = {
  base: argbFromHex('#d8e6ea'),
  bright: argbFromHex('#c1dbe3'),
  brighter: argbFromHex('#f6feaa'),
  dark: argbFromHex('#373737'),
  red: argbFromHex('#fcb495')
};

const generateColorSystem = (): string => {
  // Define custom colors using the proper CustomColor interface
  const customColors: CustomColor[] = [
    {
      name: "neutral",
      value: baseColors.base,
      blend: true,
    },
    {
      name: "accent",
      value: baseColors.brighter,
      blend: true,
    },
    {
      name: "error",
      value: baseColors.red,
      blend: true,
    }
  ];

  // Generate theme using the properly typed function
  const theme: Theme = themeFromSourceColor(baseColors.base);

  // Extract schemes
  const { light: lightScheme, dark: darkScheme } = theme.schemes;

  // Generate CSS variables for light mode
  const lightModeCSS = [
    `  --md-primary: ${hexFromArgb(lightScheme.primary)};`,
    `  --md-on-primary: ${hexFromArgb(lightScheme.onPrimary)};`,
    `  --md-primary-container: ${hexFromArgb(lightScheme.primaryContainer)};`,
    `  --md-on-primary-container: ${hexFromArgb(lightScheme.onPrimaryContainer)};`,
    `  --md-secondary: ${hexFromArgb(lightScheme.secondary)};`,
    `  --md-on-secondary: ${hexFromArgb(lightScheme.onSecondary)};`,
    `  --md-secondary-container: ${hexFromArgb(lightScheme.secondaryContainer)};`,
    `  --md-on-secondary-container: ${hexFromArgb(lightScheme.onSecondaryContainer)};`,
    `  --md-tertiary: ${hexFromArgb(lightScheme.tertiary)};`,
    `  --md-on-tertiary: ${hexFromArgb(lightScheme.onTertiary)};`,
    `  --md-tertiary-container: ${hexFromArgb(lightScheme.tertiaryContainer)};`,
    `  --md-on-tertiary-container: ${hexFromArgb(lightScheme.onTertiaryContainer)};`,
    `  --md-error: ${hexFromArgb(lightScheme.error)};`,
    `  --md-on-error: ${hexFromArgb(lightScheme.onError)};`,
    `  --md-error-container: ${hexFromArgb(lightScheme.errorContainer)};`,
    `  --md-on-error-container: ${hexFromArgb(lightScheme.onErrorContainer)};`,
    `  --md-background: ${hexFromArgb(lightScheme.background)};`,
    `  --md-on-background: ${hexFromArgb(lightScheme.onBackground)};`,
    `  --md-surface: ${hexFromArgb(lightScheme.surface)};`,
    `  --md-on-surface: ${hexFromArgb(lightScheme.onSurface)};`,
    `  --md-surface-variant: ${hexFromArgb(lightScheme.surfaceVariant)};`,
    `  --md-on-surface-variant: ${hexFromArgb(lightScheme.onSurfaceVariant)};`,
    `  --md-outline: ${hexFromArgb(lightScheme.outline)};`,
    `  --md-outline-variant: ${hexFromArgb(lightScheme.outlineVariant)};`
  ].join('\n');

  // Generate CSS variables for dark mode
  const darkModeCSS = [
    `  --md-primary: ${hexFromArgb(darkScheme.primary)};`,
    `  --md-on-primary: ${hexFromArgb(darkScheme.onPrimary)};`,
    `  --md-primary-container: ${hexFromArgb(darkScheme.primaryContainer)};`,
    `  --md-on-primary-container: ${hexFromArgb(darkScheme.onPrimaryContainer)};`,
    `  --md-secondary: ${hexFromArgb(darkScheme.secondary)};`,
    `  --md-on-secondary: ${hexFromArgb(darkScheme.onSecondary)};`,
    `  --md-secondary-container: ${hexFromArgb(darkScheme.secondaryContainer)};`,
    `  --md-on-secondary-container: ${hexFromArgb(darkScheme.onSecondaryContainer)};`,
    `  --md-tertiary: ${hexFromArgb(darkScheme.tertiary)};`,
    `  --md-on-tertiary: ${hexFromArgb(darkScheme.onTertiary)};`,
    `  --md-tertiary-container: ${hexFromArgb(darkScheme.tertiaryContainer)};`,
    `  --md-on-tertiary-container: ${hexFromArgb(darkScheme.onTertiaryContainer)};`,
    `  --md-error: ${hexFromArgb(darkScheme.error)};`,
    `  --md-on-error: ${hexFromArgb(darkScheme.onError)};`,
    `  --md-error-container: ${hexFromArgb(darkScheme.errorContainer)};`,
    `  --md-on-error-container: ${hexFromArgb(darkScheme.onErrorContainer)};`,
    `  --md-background: ${hexFromArgb(darkScheme.background)};`,
    `  --md-on-background: ${hexFromArgb(darkScheme.onBackground)};`,
    `  --md-surface: ${hexFromArgb(darkScheme.surface)};`,
    `  --md-on-surface: ${hexFromArgb(darkScheme.onSurface)};`,
    `  --md-surface-variant: ${hexFromArgb(darkScheme.surfaceVariant)};`,
    `  --md-on-surface-variant: ${hexFromArgb(darkScheme.onSurfaceVariant)};`,
    `  --md-outline: ${hexFromArgb(darkScheme.outline)};`,
    `  --md-outline-variant: ${hexFromArgb(darkScheme.outlineVariant)};`
  ].join('\n');

  return `:root {\n${lightModeCSS}\n}

.dark-mode {\n${darkModeCSS}\n}`;
};

export const GET: APIRoute = () => {
  const css = generateColorSystem();
  return new Response(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'public, max-age=31536000, immutable'
    },
  });
};
import { ok, err, Result } from "neverthrow";
import type { ThemeConfig, FontSize, BorderRadius } from "./entities";
import { VizoraInvalidThemeTokenError } from "./errors";
import type { VizoraDomainError } from "./errors";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const VALID_FONT_SIZES: FontSize[] = ["sm", "md", "lg"];
const VALID_BORDER_RADIUS: BorderRadius[] = [8, 12, 16];
const MAX_PALETTE_SIZE = 8;
const MIN_PALETTE_SIZE = 3;

export function validateTheme(theme: ThemeConfig): Result<void, VizoraDomainError> {
  const errors: string[] = [];

  if (!HEX_COLOR_RE.test(theme.primaryColor)) {
    errors.push(`primaryColor must be a valid 6-digit hex color (e.g. #06b6d4), got "${theme.primaryColor}"`);
  }

  if (!Array.isArray(theme.chartPalette)) {
    errors.push("chartPalette must be an array of hex colors");
  } else {
    if (theme.chartPalette.length < MIN_PALETTE_SIZE) {
      errors.push(`chartPalette must have at least ${MIN_PALETTE_SIZE} colors, got ${theme.chartPalette.length}`);
    }
    if (theme.chartPalette.length > MAX_PALETTE_SIZE) {
      errors.push(`chartPalette must have at most ${MAX_PALETTE_SIZE} colors, got ${theme.chartPalette.length}`);
    }
    for (const [i, color] of theme.chartPalette.entries()) {
      if (!HEX_COLOR_RE.test(color)) {
        errors.push(`chartPalette[${i}] must be a valid 6-digit hex color, got "${color}"`);
      }
    }
  }

  if (!VALID_FONT_SIZES.includes(theme.fontSize)) {
    errors.push(`fontSize must be one of ${VALID_FONT_SIZES.join(", ")}, got "${theme.fontSize}"`);
  }

  if (!VALID_BORDER_RADIUS.includes(theme.borderRadius)) {
    errors.push(`borderRadius must be one of ${VALID_BORDER_RADIUS.join(", ")}, got ${theme.borderRadius}`);
  }

  if (errors.length > 0) {
    return err(new VizoraInvalidThemeTokenError(errors.join("; ")));
  }

  return ok(undefined);
}

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.js';

/**
 * Skeuomorphic-Clean is dark-only, but we keep a manual toggle for accessibility.
 * The dark class is kept on <html>; toggling only swaps the CSS variable schema.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="btn-ghost h-9 w-9 !p-0"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

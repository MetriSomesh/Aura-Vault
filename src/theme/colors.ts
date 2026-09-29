/**
 * Sovereign Vault Design Tokens
 * Extracted directly from DESIGN.md and Stitch Design System specifications.
 */

export const colors = {
  // Canvas & Surfaces
  canvas: '#08090C',
  card: '#10131A',
  elevated: '#161B26',
  input: '#0D1117',
  dialog: '#161B26',

  // Hairline Borders
  border: {
    subtle: '#1E2430',
    interactive: '#2A3245',
    active: '#3A455A',
    gold: 'rgba(212, 175, 55, 0.35)',
    silver: 'rgba(203, 213, 225, 0.25)',
    danger: 'rgba(244, 63, 94, 0.35)',
  },

  // Precious Metals
  gold: {
    primary: '#D4AF37',   // 24K pure metallic gold
    hover: '#F3C64F',     // Bright gold highlight
    pale: '#F3E5AB',      // Secondary gold text
    muted: '#3A2E0F',     // Dark gold background container
    glow: 'rgba(212, 175, 55, 0.15)',
  },
  silver: {
    primary: '#CBD5E1',   // 999 Fine Silver / Platinum
    refined: '#E2E8F0',   // High-contrast bright silver
    muted: '#1E293B',     // Cool slate/silver container
    slate: '#94A3B8',     // Secondary silver tone
    glow: 'rgba(203, 213, 225, 0.12)',
  },

  // Financial Indicators (Restrained, non-neon)
  profit: {
    text: '#10B981',      // Subdued emerald
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  loss: {
    text: '#F43F5E',      // Subdued coral crimson
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.25)',
  },

  // Typography
  text: {
    primary: '#F8FAFC',   // 98% off-white
    secondary: '#94A3B8', // Slate grey
    tertiary: '#64748B',  // Muted labels
    inverse: '#08090C',   // Deep obsidian on gold button
  },
} as const;

export type ThemeColors = typeof colors;

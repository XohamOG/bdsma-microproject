/**
 * Art Nouveau Florido Recharts Visual Theme
 * Defined in docs/design-system.md
 */

export const NOUVEAU_CHART_THEME = {
  sentiment: {
    positive: '#008080', // Deep Teal
    neutral: '#CFB53B',  // Old Gold
    negative: '#800020', // Burgundy
  },
  brands: {
    'Virgin America': '#008080', // Deep Teal
    'Delta': '#005F9E',          // Peacock Blue
    'Southwest': '#CFB53B',      // Old Gold
    'United': '#808000',         // Olive Green
    'American': '#A0522D',       // Sienna / Bronze
    'US Airways': '#800020',     // Burgundy
  } as Record<string, string>,
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFF0',
      border: '1.5px solid #CFB53B',
      borderRadius: '12px',
      boxShadow: '0 6px 20px rgba(207, 181, 59, 0.22)',
      fontFamily: 'Quattrocento, serif',
      color: '#1A1A18',
      padding: '10px 14px',
    },
    itemStyle: {
      color: '#1A1A18',
      fontFamily: 'Quattrocento, serif',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    labelStyle: {
      color: '#008080',
      fontFamily: 'Quattrocento, serif',
      fontWeight: 700,
      marginBottom: '4px',
      borderBottom: '1px solid #CFB53B40',
      paddingBottom: '4px',
    },
  },
  grid: {
    stroke: '#E6E4D8',
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#CFB53B',
    tick: { fill: '#1A1A18', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
  },
};

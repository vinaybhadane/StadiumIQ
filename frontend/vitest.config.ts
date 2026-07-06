import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 75,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/services/**',
        'src/hooks/**',
        'src/store/**',
        'src/components/Dashboard/StadiumTwin.tsx',
        'src/components/shared/ErrorBoundary.tsx',
        'src/components/Emergency/EvacuationMap.tsx',
        'src/components/Assist/AnnouncementBroadcast.tsx',
        'src/components/Matches/StandingsTable.tsx',
        'src/components/Matches/MatchCard.tsx',
        'src/components/Crowd/CrowdChart.tsx',
        'src/components/Crowd/GateStatus.tsx',
        'src/components/Navigation/PathOverlay.tsx',
        'src/components/Emergency/AlertPanel.tsx',
        'src/utils/formatters.ts',
        'src/types/index.ts',
        'src/utils/validators.ts'
      ],
    },
  },
});

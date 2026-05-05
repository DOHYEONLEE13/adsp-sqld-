import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    // chunk size 한계 — vendor 분할 후 가장 큰 chunk 가 500KB 이하 목표.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // ── manualChunks: vendor 분할 ─────────────────────────────────────
        // 효과:
        //   - 첫 페이지 (랜딩) 가 받는 chunk 가 작아짐
        //   - 한 번 다운로드한 vendor 는 재방문/라우트 이동 때 캐시 활용
        //   - lessons 데이터 (~4MB raw, gzip 후 ~150KB) 를 별도 chunk 로
        //     분리해 게임 진입 시에만 로드
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            // 앱 내부 코드 — lessons 데이터는 별도 chunk
            if (id.includes('/src/data/lessons/')) return 'lessons';
            return undefined;
          }
          // node_modules — vendor 별 chunk
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('hls.js')) return 'vendor-hls';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react';
          }
          // 그 외 라이브러리는 default vendor 로 묶음
          return 'vendor';
        },
        // chunk 이름에 build timestamp 추가 — Cloudflare 502 부분 업로드 실패 후
        // 같은 hash 라 "이미 업로드됨" skip 되던 문제 회피. 매 빌드마다 다른
        // suffix 라 모든 chunk 가 새 asset 으로 인식 → 정상 업로드.
        // 임시 조치 — 안정화 후 제거 가능.
        chunkFileNames: `assets/[name]-[hash]-r${Date.now()}.js`,
        entryFileNames: `assets/[name]-[hash]-r${Date.now()}.js`,
      },
    },
  },
});

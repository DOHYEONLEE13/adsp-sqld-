# Bottom Nav Redesign — Duolingo Style Microinteractions

> **2026-05-01** · `src/game/components/MobileGameNav.tsx` · 디자인 개선만, 라우팅/구조 변경 0.

---

## 한 줄 요약

> 평면적 사각 박스 테두리 → **알약(pill) 배경 + spring 위로 떠오름 + 라벨 노출** 의 살아 움직이는 탭바로 교체.

---

## Before / After

### Before — 평면적·정적
- 활성 표시: `2px solid {accent}` 사각 테두리
- 라벨: prop 으로 받지만 **렌더하지 않음** (`학습`/`퀘스트`/`친구`/`프로필` 미노출)
- 위치 변화: 0 (제자리 색만 변함)
- 전환: CSS `transition active:scale-95` press 만
- 사용자 인상: "그냥 색 바뀌었네" — 클릭감/피드백 미약

### After — 도우어듀오 톤
- 활성 표시: 둥근 알약 배경 (`rounded-full`, `{accent} 14% alpha`) + 사각 테두리 제거
- 라벨: 항상 노출, 활성 시 `font-weight 500 → 700`
- 위치 변화: `translateY -3px` + `scale 1.08` (활성), `y -2px` (라벨)
- 전환: framer-motion **spring(stiffness 400, damping 17)** — 살짝 over-shoot
- Press 피드백: `whileTap scale 0.92` (CSS active 보다 부드러움)
- 사용자 인상: "캐릭터처럼 반응함" — 클릭이 즐겁고 활성 탭이 명확

---

## 4가지 도우어듀오 핵심 — 적용 매핑

| 핵심 | 적용 |
|---|---|
| **1. Spring 바운스** | `transition={{ type: 'spring', stiffness: 400, damping: 17 }}` — 이미 EnergyBlockModal·Ques 가 쓰던 동일 톤. 사이트 전체 microinteraction 일관 |
| **2. 위로 살짝 떠오름** | `animate.y: isActive ? -3 : 0` + `scale: 1.08` — 활성 탭이 명확히 부각 |
| **3. 채도 변화** | 색상 토큰은 그대로 (adsp `#67e8f9` / sqld `#c084fc`). pill 배경의 alpha 를 `1f → 24` (12% → 14%) 로 살짝 더 vivid 하게 |
| **4. 즉각 터치 반응** | `whileTap={{ scale: 0.92 }}` — framer-motion 이 transform 을 GPU 가속, 1프레임 내 반응 |

---

## 사용한 토큰 — 다른 컴포넌트와 통일성

| 토큰 | 출처 | 다른 사용처 | 통일 가능 |
|---|---|---|---|
| `SUBJECT_ACCENT.adsp` `#67e8f9` | `MobileGameNav.tsx` | 전 game 화면 헤더/배지 | 이미 통일 |
| `SUBJECT_ACCENT.sqld` `#c084fc` | 동일 | 동일 | 이미 통일 |
| spring `stiffness 400 / damping 17` | 본 작업 | EnergyBlockModal, Ques pose, FeedbackSheet | ✅ 일관 |
| pill 배경 alpha `0x24` (14%) | 본 작업 | — | 향후 다른 active indicator (Zone 노드 등) 에도 같은 alpha 권장 |

---

## 향후 비슷한 microinteraction 작업 체크리스트

작업 전 자기 점검:

- [ ] **Spring 바운스 적용?** `type: 'spring'` 사용 여부. CSS `transition` 만으론 over-shoot 안 남.
- [ ] **Press 피드백 (whileTap) 적용?** scale 0.92 정도. 사용자 클릭이 살아있음을 알려줌.
- [ ] **색상만 바꾼 게 아니라 위치·크기까지 변하나?** 도우어듀오 스타일은 `y/scale` 변화가 핵심.
- [ ] **접근성 빠뜨리지 않았나?**
  - [ ] `aria-label` 명시 (각 인터랙티브 요소)
  - [ ] 활성 시 `aria-current="page"` (네비) 또는 `aria-pressed` (토글)
  - [ ] focus-visible 링 (키보드 접근)
  - [ ] 최소 터치 타겟 44×44 (모바일)
- [ ] **다른 비슷한 컴포넌트와 spring 톤 일치?** stiffness·damping 동일 유지.
- [ ] **vendor-motion chunk 부풀지 않음?** framer-motion 은 이미 vendor 분할됨.

---

## 검증 (STEP 4 6가지 증거)

| # | 증거 | 결과 |
|---|---|---|
| 1 | **Git** | commit + push 별도 항목 |
| 2 | **빌드/배포** | Cloudflare auto-deploy on push to main. CI 가드 (.github/workflows/ci.yml) 가 npm install → typecheck → test → audit → build → grep verify 자동 수행 |
| 3 | **번들** | `index-*.js` 85.91 KB (gzip 28.85 KB) — A-9 분할 후 첨 진입 사이즈 유지. framer-motion 은 vendor-motion chunk 에 이미 존재 → 추가 KB 0 |
| 4 | **시각** | 사용자 직접 production URL 확인 (Cloudflare deploy 완료 후) |
| 5 | **접근성** | `aria-label`, `aria-current="page"`, `focus-visible` ring, 터치 타겟 ~72×97 (모바일 4-등분) — 모두 OK |
| 6 | **회귀** | Playwright smoke 14/14 통과 (test 6 모바일 nav 단독 통과). typecheck + 161 unit tests + audit 631문항 결함 0 + build 8.70s |

---

## 스코프 엄수

| 변경 | 미변경 |
|---|---|
| `MobileGameNav.tsx` 의 `Tab` 컴포넌트 (1개 파일, ~50줄 영역) | 라우팅, 페이지 내용, 다른 컴포넌트 0 |
| framer-motion 1개 import 추가 | 새 의존성 0 (이미 설치됨) |
| 새 색상/폰트/아이콘 라이브러리 도입 | 0 |
| 라벨 노출 (이미 prop 으로 들어오던 것) | 라벨 텍스트 자체 변경 0 |

진행 중이던 task (캐릭터 미리보기, progressSync, friend stub 등) 어느 것도 손대지 않음.

---

마지막 갱신: 2026-05-01.

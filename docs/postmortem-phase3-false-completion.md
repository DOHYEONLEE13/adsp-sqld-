# Postmortem — Phase 3 "수정 완료" False Completion (2026-04-30)

## 한 줄 요약

> **Phase 3 의 PR-1~10 코드는 정상 작성됐고 origin/main 에 push 됐지만, Cloudflare Pages 의 `npm ci` 가 lock 파일 sync 결손으로 첫 단계부터 실패. 사이트는 옛 빌드 그대로 노출되어 "단 하나도 동작 안 함" 사용자 보고로 이어짐.**

---

## 사건 타임라인

| 시점 | 사건 |
|---|---|
| 22:23 | PR-2 (vitest 설치) — `npm install --save-dev vitest @vitest/ui jsdom` 실행 |
| 22:23 | commit `08a518e` — package.json + package-lock.json + vitest.config.ts add |
| 22:23 | push 성공. 이후 PR-3~10 모두 같은 sequence 로 push 성공 |
| 22:23 ~ | **Cloudflare Pages — 매 push 마다 build 실패. 직전 성공 build 그대로 노출 (사이트 동결)** |
| 23:31 | "검증 완료, 다기기 동기화 결함 구조적 해결" 라고 사용자에게 보고 |
| 다음날 13:20 | 사용자 검증: "단 하나도 동작 안 함" — 같은 계정으로도 태그 다름·닉네임 안 됨·진행 상황 안 보임 |
| 13:30 | STEP 1 reality check 시작 — Git 일치 ✅ DB 마이그 적용 ✅ 사용자 user_id 정상 ✅ |
| 13:35 | 프로덕션 번들 검사 — **새 심볼 0건, 옛 빌드 그대로** 발견 |
| 13:38 | Cloudflare build log 확보 — `npm error Missing: esbuild@0.28.0 from lock file` 결정적 증거 |

---

## 근본 원인

### 직접 원인
PR-2 commit (`08a518e`) 의 `package-lock.json` 이 `package.json` 과 sync 가 안 된 상태로 origin 에 push됨.

```
package.json:
  "@vitest/ui": "^4.1.5",
  "vitest": "^4.1.5"   ← 새 의존성

package-lock.json:
  "esbuild": "^0.21.3"  ← vite 가 쓰던 esbuild
  ❌ esbuild@0.28.0 (vitest 가 요구하는) entry 누락
  ❌ @esbuild/aix-ppc64@0.28.0 ~ @esbuild/win32-x64@0.28.0 (27개 플랫폼별 entry) 누락
```

### Cloudflare Pages 의 동작 방식
- build command 첫 단계: `npm clean-install` (= `npm ci`)
- `npm ci` 의 정의: package.json 과 package-lock.json 이 **정확히 일치할 때만** 동작. 한 entry 라도 missing 면 즉시 exit code 1.
- 빌드 실패 시 Cloudflare 의 정책: **직전 성공 deployment 의 build artifact 를 production 에 그대로 유지**.

이 정책이 사고를 키운 핵심:
- 사이트는 멀쩡히 떠 있음 (옛 빌드)
- 사용자는 어떤 에러도 보지 못함
- 개발자는 "푸시했고 자동 배포되니 됐겠지" 라고 착각

### 왜 lock 이 sync 안 된 채 push 됐나
- 로컬에서 `npm install` 실행 → package-lock.json 갱신
- 갱신은 됐지만 vitest 의 일부 의존성 (esbuild 0.28.x 플랫폼별 entry) 이 누락된 상태로 lock 이 작성된 듯
- 가능성:
  1. npm 의 워크스페이스/peer 처리 결함
  2. 로컬 npm 버전 (Cloudflare = 10.9.2 vs 로컬 = ?) 차이
  3. install 도중 abort
- 어쨌든 **Cloudflare 동일 명령(`npm ci`) 으로 검증하지 않고 push 한 게 결정적 누락**

---

## 무엇을 잘못 보고했는가

### 잘못 보고한 내용 (2026-04-30 23:31)
> "Phase 3·4·5 완료 — 다기기 동기화 결함 구조적 해결"
>
> 최종 검증 결과:
> - npm run typecheck ✅ pass
> - npm test ✅ 12/12 pass
> - npm run audit ✅ 결함 0
> - npm run build ✅ 9.0s

### 누락된 검증
1. ❌ `npm ci` (Cloudflare 와 동일 명령) 미실행
2. ❌ Cloudflare deployment status 확인 안 함
3. ❌ 프로덕션 URL 의 번들에서 새 심볼 검색 안 함
4. ❌ End-to-end 테스트 (실제 두 기기 시나리오) 미실행

→ "코드를 작성했다 ≠ 수정 완료" 의 정확한 사례.

---

## 수정한 것

### 1. lock 재생성 + 로컬 `npm ci` 재현 (2026-04-30)
```bash
npm install                   # lock 완전 재생성 (esbuild 0.28.x 27개 entry 추가)
rm -rf node_modules
npm ci                        # Cloudflare 와 동일 — pass 확인
npm run build                 # production build pass
```

### 2. GitHub Actions CI 가드 도입 (`.github/workflows/ci.yml`)
- main push / PR 시 자동 실행:
  - npm ci → typecheck → test → audit → build
  - **빌드 산출물에서 새 sync 식별자 (`pendingServerSync`·`lastUserId`·`오프라인 — 풀이는`) 가 실제로 포함됐는지 grep 검증**
- 한 번이라도 실패하면 알림. Cloudflare 만 의존하던 단일 검증 지점 → 두 단계 가드.

### 3. CLAUDE.md 영구 규칙 추가
"수정 완료" 보고 전 반드시 통과해야 하는 5단계 (아래 5절).

---

## 영구 규칙 — "수정 완료" 보고 전 5단계

### 절대 원칙
- "코드를 작성했다" ≠ 수정 완료
- "git commit 했다" ≠ 배포 완료
- "내가 보기엔 맞다" ≠ 실제 동작
- **"사이트가 떠 있음" ≠ 배포 성공** (Cloudflare 는 빌드 실패 시 옛 빌드 동결)
- 사용자에게 "완료" 라고 말하기 전, 다음 5가지 증거 모두 확보

### 5단계 증거
1. **Git 증거**: 머지된 commit SHA + `git log questdp/main --oneline` 출력
2. **Local CI 증거**: `npm ci && npm run typecheck && npm test && npm run build` 모두 pass (Cloudflare 와 동일 sequence)
3. **CI workflow 증거** (push 후): GitHub Actions 의 build job 이 status=success
4. **배포 증거**: Cloudflare Pages → Deployments 의 가장 최근 status=Success + commit SHA 일치
5. **번들 증거**: `curl <prod-url>/assets/index-*.js` 받아서 새 식별자 grep — 1건 이상

### 그 다음에야 사용자에게 검증 시나리오 요청 가능

---

## 이 사고에서 배운 것

### 1. 빌드 실패 ≠ 사이트 다운, 빌드 실패 = 사이트 동결
Cloudflare Pages (Vercel·Netlify 도 유사) 는 build 실패 시 직전 deployment 를 그대로 유지함. 이 정책은 안전성 측면에선 맞지만, **"사이트가 정상으로 보인다 = 배포 성공" 이라는 직관을 깨뜨림**.

### 2. `npm install` ≠ `npm ci`
- `npm install` = lock 파일을 갱신해가며 package.json 만족하는 트리 만듦 (관용적)
- `npm ci` = lock 파일과 package.json 이 정확히 일치할 때만 동작 (엄격)
- production CI 는 `npm ci` 권장 — 재현성 보장
- 로컬 `npm install` 만 통과해서 push 하면 production CI 가 실패할 수 있음

### 3. 단일 검증 지점은 위험
Cloudflare 한 곳만 빌드 검증하면, 거기가 침묵으로 실패할 때 못 알아챈다. **2중 가드** (GitHub Actions + Cloudflare) 가 최소.

### 4. 자동 배포의 함정
"자동 배포니까 push 만 하면 됨" 의 진실: 자동 배포는 빌드가 성공할 때만 의미가 있음. push 자체는 배포 보장이 아님.

### 5. 검증의 단위
- 단위 테스트 통과 → 함수 로직만 보장
- 빌드 통과 → 컴파일 가능만 보장
- 로컬 빌드 통과 → 로컬 환경에서만 보장
- production 빌드 통과 → CI 환경에서만 보장
- production deployment 성공 → CDN 에 배포만 보장
- **production 번들에 새 심볼 grep 통과** → 실제로 코드가 사용자에게 닿았다는 보장
- 모든 단계가 다 필요. 하나만 통과해선 "완료" 못 함.

---

## 회고 체크리스트 (다음번 작업 시작 전 자기 점검)

- [ ] 로컬 `npm ci` 가 통과하는가? (단순 `npm install` 만으로 검증 X)
- [ ] 로컬 `npm run build` 가 통과하는가?
- [ ] push 후 GitHub Actions CI 가 status=success 인가?
- [ ] Cloudflare Pages deployment 가 status=Success 이며 commit SHA 가 일치하는가?
- [ ] 프로덕션 URL 의 번들에 새 식별자가 grep 으로 나오는가?
- [ ] 사용자가 보는 화면에서 실제 동작이 확인되었는가?

위 6개 모두 ✅ 일 때만 "완료" 라고 말한다.

---

마지막 갱신: 2026-04-30 · Phase 3 false completion 사고 직후 작성.

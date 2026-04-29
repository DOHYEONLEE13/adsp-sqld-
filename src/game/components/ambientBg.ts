/**
 * ambientBg.ts — 게임 섹션 공용 배경 비디오 ON/OFF 컨트롤러.
 *
 * 왜 필요한가?
 *   기존엔 각 페이지가 `<PageAmbientBg />` 안에서 직접 `<video>` 를 새로
 *   마운트했음. 라우트 전환 (Planet → Zone → Lesson …) 마다 video 가 unmount
 *   → remount 되며 HLS manifest 를 다시 로드해 영상이 매번 처음부터 시작.
 *
 *   해결책: 비디오 element 는 App 루트에 한 번만 마운트(`GlobalAmbientBg`)하고,
 *   각 페이지는 `<PageAmbientBg />` 로 "지금 ambient 켜줘 / blur 적용해줘" 만
 *   refcount 로 알린다. 페이지가 바뀌어도 video 는 끊김 없이 흘러간다.
 *
 *   refcount + 단일 blur 플래그 패턴:
 *     - 한 페이지에 한 PageAmbientBg 만 살아있다고 가정 (현재 코드의 사실).
 *     - mount 시 push → count++. unmount 시 pop → count--.
 *     - count > 0 = 화면에 노출, count === 0 = 페이드아웃 (요소는 DOM 유지).
 *     - blur 는 마지막 push 의 값으로 기록. 같은 시점엔 한 페이지뿐이라 안전.
 *
 *   React 18 의 effect cleanup → next effect 사이의 두 번 알림은 같은 commit
 *   안에서 setState batching 으로 묶이기 때문에 깜빡임이 나타나지 않는다.
 */

export interface AmbientBgState {
  /** 현재 ambient 를 원하는 페이지가 1개 이상인가? */
  active: boolean;
  /** 가장 최근 mount 페이지가 요청한 blur 적용 여부. */
  blur: boolean;
}

let activeCount = 0;
let currentBlur = false;
const listeners = new Set<(s: AmbientBgState) => void>();

function snapshot(): AmbientBgState {
  return { active: activeCount > 0, blur: currentBlur };
}

function notify(): void {
  const s = snapshot();
  for (const cb of listeners) cb(s);
}

/** 페이지 mount 시 호출. blur 는 그 페이지가 원하는 값. */
export function pushAmbient(blur: boolean): void {
  activeCount += 1;
  currentBlur = blur;
  notify();
}

/** 페이지 unmount 시 호출. */
export function popAmbient(): void {
  activeCount = Math.max(0, activeCount - 1);
  notify();
}

/** GlobalAmbientBg 가 구독해 자기 상태 갱신. cb 즉시 1회 호출 후 unsubscribe 반환. */
export function subscribeAmbientBg(cb: (s: AmbientBgState) => void): () => void {
  listeners.add(cb);
  cb(snapshot());
  return () => {
    listeners.delete(cb);
  };
}

export function getAmbientBg(): AmbientBgState {
  return snapshot();
}

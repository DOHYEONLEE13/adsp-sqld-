/**
 * NotificationSettings — 설정 → 학습 리마인더 섹션.
 *
 * 상태 분기:
 *  - 미지원 브라우저 (iOS Safari 미설치 포함) → 안내
 *  - 미로그인 → 로그인 유도
 *  - 권한 차단(denied) → 브라우저 설정 안내
 *  - 정상 → 토글 + 시각 선택 (KST, 계정 단위)
 */

import { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Clock } from 'lucide-react';
import { useAuthSession } from '@/lib/auth/sessionStore';
import {
  disablePush,
  enablePush,
  getPushSnapshot,
  isIosDevice,
  setReminderHour,
  type PushSnapshot,
} from '@/lib/push';

/** 선택 가능한 리마인더 시각 (KST) — 학습 리마인더로 현실적인 범위만. */
const HOUR_CHOICES = [7, 8, 9, 12, 18, 19, 20, 21, 22, 23];

export default function NotificationSettings() {
  const auth = useAuthSession();
  const isSignedIn = Boolean(auth.session?.user.id);

  const [snap, setSnap] = useState<PushSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getPushSnapshot().then((s) => {
      if (alive) setSnap(s);
    });
    return () => {
      alive = false;
    };
  }, [isSignedIn]);

  if (!snap) {
    return (
      <Card>
        <p className="kr-body text-[12.5px] text-cream/55">상태 확인 중…</p>
      </Card>
    );
  }

  if (!snap.supported) {
    return (
      <Card>
        <Header icon={BellOff} title="이 브라우저에서는 사용할 수 없어요" />
        <p className="kr-body mt-2 text-[12.5px] leading-relaxed text-cream/60">
          {isIosDevice()
            ? 'iPhone·iPad 에서는 Safari 공유 버튼 → "홈 화면에 추가" 로 앱을 설치한 뒤, 설치된 앱에서 알림을 켤 수 있어요. (iOS 16.4 이상)'
            : '푸시 알림을 지원하는 브라우저(Chrome, Edge, Samsung Internet 등)에서 다시 시도해주세요.'}
        </p>
      </Card>
    );
  }

  if (!isSignedIn) {
    return (
      <Card>
        <Header icon={Bell} title="로그인 후 사용할 수 있어요" />
        <p className="kr-body mt-2 text-[12.5px] leading-relaxed text-cream/60">
          학습 리마인더는 계정 단위로 저장돼요. 설정 → 계정에서 로그인한 뒤 다시
          켜주세요.
        </p>
      </Card>
    );
  }

  if (snap.permission === 'denied') {
    return (
      <Card>
        <Header icon={BellOff} title="알림 권한이 차단되어 있어요" />
        <p className="kr-body mt-2 text-[12.5px] leading-relaxed text-cream/60">
          브라우저 주소창 옆 자물쇠(사이트 설정) → 알림을 "허용" 으로 바꾼 뒤
          다시 시도해주세요.
        </p>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      if (snap.enabled) {
        await disablePush();
        setSnap({ ...snap, enabled: false });
        setNotice('알림을 껐어요.');
      } else {
        const result = await enablePush();
        if (result.ok) {
          setSnap({
            ...snap,
            permission: 'granted',
            enabled: true,
            reminderHour: result.reminderHour,
          });
          setNotice(
            `매일 ${formatHour(result.reminderHour)} 에 학습 리마인더를 보내드릴게요.`,
          );
        } else if (result.reason === 'denied') {
          setSnap({ ...snap, permission: 'denied' });
        } else {
          setNotice('알림을 켜지 못했어요. 잠시 뒤 다시 시도해주세요.');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleHourChange = async (hour: number) => {
    if (busy || hour === snap.reminderHour) return;
    const prev = snap.reminderHour;
    setSnap({ ...snap, reminderHour: hour }); // 낙관적 반영
    const ok = await setReminderHour(hour);
    if (!ok) {
      setSnap((s) => (s ? { ...s, reminderHour: prev } : s));
      setNotice('시각 변경에 실패했어요. 잠시 뒤 다시 시도해주세요.');
    } else {
      setNotice(`매일 ${formatHour(hour)} 에 알려드릴게요.`);
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {snap.enabled ? (
              <BellRing size={19} strokeWidth={2.1} className="shrink-0 text-[#7DD850]" />
            ) : (
              <Bell size={19} strokeWidth={2.1} className="shrink-0 text-cream/82" />
            )}
            <span className="min-w-0">
              <span className="kr-body block text-[14px] font-bold text-cream/90">
                학습 리마인더
              </span>
              <span className="kr-body mt-0.5 block text-[11.5px] font-medium text-cream/48">
                {snap.enabled
                  ? `매일 ${formatHour(snap.reminderHour)} · 스트릭이 끊기기 전에 알림`
                  : '오늘 학습을 안 했으면 정해진 시각에 알림'}
              </span>
            </span>
          </div>
          <ToggleSwitch on={snap.enabled} busy={busy} onClick={handleToggle} />
        </div>
      </Card>

      {snap.enabled ? (
        <Card>
          <Header icon={Clock} title="알림 시각 (한국 시간)" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {HOUR_CHOICES.map((h) => {
              const active = h === snap.reminderHour;
              return (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourChange(h)}
                  className="kr-num rounded-full px-3 py-1.5 text-[11.5px] font-bold transition active:scale-95"
                  style={
                    active
                      ? {
                          background: 'rgba(125,216,80,0.16)',
                          border: '1px solid rgba(125,216,80,0.45)',
                          color: '#7DD850',
                        }
                      : {
                          background: 'rgba(239,244,255,0.06)',
                          border: '1px solid rgba(239,244,255,0.12)',
                          color: 'rgba(239,244,255,0.7)',
                        }
                  }
                >
                  {formatHour(h)}
                </button>
              );
            })}
          </div>
          <p className="kr-body mt-3 text-[11px] leading-relaxed text-cream/45">
            그날 이미 문제를 풀었다면 알림을 보내지 않아요. 시각은 계정의 모든
            기기에 함께 적용돼요.
          </p>
        </Card>
      ) : null}

      {notice ? (
        <p className="kr-body px-1 text-[11.5px] font-medium text-cream/60">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '자정 12시';
  if (hour === 12) return '낮 12시';
  return hour < 12 ? `오전 ${hour}시` : `오후 ${hour - 12}시`;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="rounded-[14px] px-4 py-4"
      style={{
        background: 'rgba(239,244,255,0.075)',
        border: '1px solid rgba(239,244,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </section>
  );
}

function Header({
  icon: Icon,
  title,
}: {
  icon: typeof Bell;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={17} strokeWidth={2.2} className="text-cream/82" />
      <span className="kr-body text-[13.5px] font-bold text-cream/90">{title}</span>
    </div>
  );
}

function ToggleSwitch({
  on,
  busy,
  onClick,
}: {
  on: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label="학습 리마인더 켜기/끄기"
      disabled={busy}
      onClick={onClick}
      className="relative h-[26px] w-[46px] shrink-0 rounded-full transition disabled:opacity-50"
      style={{
        background: on ? 'rgba(125,216,80,0.85)' : 'rgba(239,244,255,0.14)',
        border: '1px solid rgba(239,244,255,0.14)',
      }}
    >
      <span
        className="absolute top-[2px] h-[20px] w-[20px] rounded-full bg-cream transition-all"
        style={{ left: on ? 22 : 2 }}
      />
    </button>
  );
}

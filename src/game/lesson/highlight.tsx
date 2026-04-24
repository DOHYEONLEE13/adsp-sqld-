/**
 * highlight.tsx — 대사 텍스트의 [키워드] 브래킷을 과목색 + 점선 밑줄 스팬으로 변환.
 *
 *   "DIKW는 [데이터]에서 시작해"
 *     → [ 'DIKW는 ', <span.dialogue-keyword>데이터</span>, '에서 시작해' ]
 *
 * `\[` 로 이스케이프 가능. 배열 반환이라 React.Fragment 로 감싸서 바로 사용.
 */

import { Fragment } from 'react';

/**
 * 브래킷 기반 하이라이트. 매칭되지 않은 `[` 나 `]` 는 리터럴로 유지.
 */
export function renderHighlighted(text: string) {
  const parts: Array<string | { kw: string }> = [];
  let i = 0;
  let buf = '';
  while (i < text.length) {
    const c = text[i];
    if (c === '\\' && text[i + 1] === '[') {
      buf += '[';
      i += 2;
      continue;
    }
    if (c === '[') {
      const close = text.indexOf(']', i + 1);
      if (close === -1) {
        buf += c;
        i += 1;
        continue;
      }
      if (buf) {
        parts.push(buf);
        buf = '';
      }
      parts.push({ kw: text.slice(i + 1, close) });
      i = close + 1;
      continue;
    }
    buf += c;
    i += 1;
  }
  if (buf) parts.push(buf);

  return (
    <>
      {parts.map((p, idx) =>
        typeof p === 'string' ? (
          <Fragment key={idx}>{p}</Fragment>
        ) : (
          <span key={idx} className="dialogue-keyword">
            {p.kw}
          </span>
        ),
      )}
    </>
  );
}

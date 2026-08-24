# Internal Link Map

기준일: 2026-08-24 KST

## 공통 구조

```text
Home / About
  → Subject curriculum
    → Study pillar
      → Urgent / Comparison / Practice cluster
        → Representative lesson / FAQ / product action
      ← 각 cluster에서 pillar로 복귀
```

## SQLD 목표 링크

| Source | 자연스러운 anchor 예 | Target |
|---|---|---|
| `/curriculum/sqld/` | SQLD 공부 순서 | `/blog/sqld-공부법/` (로컬 초안; 승인 후 연결) |
| `/blog/sqld-공부법/` | 시험 1주 전 압축 순서 | `/blog/sqld-7일-압축-로드맵/` |
| `/blog/sqld-공부법/` | 노랭이를 쓰는 시점 | `/blog/sqld-노랭이-vs-questdp/` |
| `/blog/sqld-공부법/` | SQLD 시험시간과 과락 | `/faq/sqld/` |
| 7일 글 | 처음부터 잡는 SQLD 공부법 | `/blog/sqld-공부법/` |
| 노랭이 글 | 비전공자 SQLD 학습 순서 | `/blog/sqld-공부법/` |
| SQL 개념 lesson | 전체 SQLD 범위 보기 | `/curriculum/sqld/` |

## ADsP 목표 링크

| Source | 자연스러운 anchor 예 | Target |
|---|---|---|
| `/curriculum/adsp/` | 비전공자 ADsP 공부 순서 | `/blog/adsp-비전공자-가이드/` |
| 비전공자 guide | 시험 2주 전 일정 | `/blog/adsp-2주-합격-로드맵/` |
| 비전공자 guide | 독학과 인강 선택 기준 | `/blog/adsp-독학-vs-인강/` |
| 2주 글 | 통계·R이 처음인 사람의 기본 순서 | `/blog/adsp-비전공자-가이드/` |
| 독학 vs 인강 | ADsP 전체 공부 순서 | `/blog/adsp-비전공자-가이드/` |
| ADsP vs SQLD | ADsP 커리큘럼 | `/curriculum/adsp/` |
| 모든 ADsP 글 | 시험시간·과락 확인 | `/faq/adsp/` |

## 컴활 목표 링크

| Source | 자연스러운 anchor 예 | Target |
|---|---|---|
| `/curriculum/comhwal/` | 컴활 필기 비전공자 공부 순서 | `/blog/comhwal-필기-비전공자-공부법/` |
| 공부법 pillar | 1급과 2급 선택 기준 | `/blog/comhwal-1급-vs-2급/` |
| 공부법 pillar | 시험 7일 전 첫 회독 | `/blog/comhwal-7일-필기-플랜/` |
| 공부법 pillar | 기출 오답 복습법 | `/blog/comhwal-기출-복습법/` |
| 1급 vs 2급 | 컴활 필기 공부 순서 | 공부법 pillar |
| 7일 글 | 노베이스 기본 순서 | 공부법 pillar |
| 기출 복습 글 | 관련 개념으로 돌아가기 | `/curriculum/comhwal/` 또는 대표 topic |
| 모든 컴활 글 | 상시시험 공식 안내 | `/faq/comhwal/` + KCCI official |

## 현재 링크 그래프 판정

- 블로그 12편은 모두 `/blog/`에서 발견 가능하고 related link도 있어 orphan 0.
- 정적 snapshot의 slash 없는 링크 1,637건은 로컬 generator에서 canonical slash로 수정했다.
- noindex lesson으로의 링크는 사용자 학습 흐름에는 필요하지만, SEO 허브에서 373개를 한꺼번에 노출하는 구조는 crawl 분산을 만들 수 있다. 대표 indexable lesson 링크를 우선 표시하는 개선을 MEDIUM backlog로 둔다.

## Anchor 원칙

- `여기`, `자세히` 대신 목적을 설명한다.
- exact-match anchor를 모든 페이지에서 반복하지 않는다.
- pillar→cluster, cluster→pillar의 양방향 링크를 만든다.
- 외부 공식 일정 링크는 `KDATA 공식 일정`, `대한상공회의소 상시시험 조회`처럼 출처를 명시한다.

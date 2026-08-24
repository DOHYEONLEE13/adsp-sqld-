# Brand Entity Audit

기준일: 2026-08-24 KST

## 기준 엔터티

- Brand: `QuestDP`
- Korean name: `퀘스트디피`
- Domain: `https://quest-dp.com/`
- Category: `게임형 자격증 학습 플랫폼`
- Subjects: `SQLD / ADsP / 컴퓨터활용능력`

## 공개 상태

- Production home·About·metadata에서 QuestDP와 학습 과목을 확인할 수 있다.
- Naver 브랜드 검색에서 공식 사이트와 Google Play 앱이 확인된다.
- 공개 Google 계열 결과에서는 `QuestDP`가 “Quest Data Protection” 문맥과 충돌한다.
- Naver `퀘스트디피`에서는 앱이 공식 사이트보다 먼저 나타나는 결과가 확인됐다.

## 위험

- 외부 프로필의 카테고리·한글명·과목 표기가 다르면 이름 충돌을 해소하기 어렵다.
- 존재하지 않는 LinkedIn/Disquiet/RocketPunch 프로필을 있다고 가정하면 안 된다.
- 실제 운영자가 검증하지 않은 창업자 경력·자격·사용자 수를 쓰지 않는다.

## 일관 문구

짧은 설명: `QuestDP(퀘스트디피)는 SQLD·ADsP·컴퓨터활용능력을 작은 개념과 바로 푸는 문제로 학습하는 게임형 자격증 학습 플랫폼입니다.`

외부 채널마다 문장을 그대로 복제하지 않되 다음 네 값은 바꾸지 않는다: 이름, 도메인, category, subjects.

## Phase 3 확인 목록

- [ ] Google Play 설명과 사이트 설명 비교
- [ ] Naver Blog 프로필 존재·URL 확인
- [ ] Instagram·Threads 프로필 존재·URL 확인
- [ ] LinkedIn·Disquiet·RocketPunch 실제 프로필 확인
- [ ] 동일 로고·도메인·한글명 적용
- [ ] Organization JSON-LD의 공개 프로필만 `sameAs`로 연결

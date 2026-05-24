# QuestDP Content Edit Checklist

개념·문제 수정 때 매번 확인하는 실행 체크리스트다. 상세 이유와 과거 사례는 `docs/content-edit-log.md`를 검색한다.

## 1. 수정 전 확인

- [ ] 사용자가 지적한 화면, step, 문제 ID를 확인했다.
- [ ] 현재 레슨 파일과 문제 JSON의 기존 흐름을 읽었다.
- [ ] 이미 뒤에서 설명되는 용어인지, 지금 설명해야 하는 용어인지 판단했다.
- [ ] 수정 대상이 ADsP인지 SQLD인지, 챕터와 토픽을 확인했다.
- [ ] PDF나 외부 원문을 그대로 옮기지 않는지 확인했다.

## 2. 개념 수정

- [ ] 한 스텝에 한 개념만 남겼다.
- [ ] 낯선 용어는 첫 등장 시 짧은 설명 또는 클릭 설명을 붙였다.
- [ ] 축약어는 전체 명칭을 먼저 보여줬다.
- [ ] 모바일 화면에서 한눈에 읽히도록 문장을 나눴다.
- [ ] 필요한 경우 그림, 표, 예시를 추가했다.

## 3. 문제 수정

- [ ] 개념 직후 바로 확인할 문제가 있다.
- [ ] 문제는 방금 배운 개념을 실제 상황에서 고르게 한다.
- [ ] 정답 위치가 지나치게 반복되지 않는다.
- [ ] 해설은 정답 이유와 오답 함정을 함께 설명한다.
- [ ] 새 문제 ID가 기존 ID와 충돌하지 않는다.

## 4. 레슨 연결

- [ ] `quizId` 또는 `extraQuizIds`가 실제 문제 JSON의 `id`와 일치한다.
- [ ] 새 문제를 추가했다면 `src/data/gameModes.ts`의 표시 문항 수를 확인했다.
- [ ] 레슨 진행률, group trail, 시각 자료 표시 조건이 어색하지 않다.
- [ ] 2회독 reminder가 필요한 변경인지 확인했다.

## 5. Supabase 동기화 필수

- [ ] 새 문제 또는 수정 문제를 Supabase seed/migration SQL에 반영했다.
- [ ] 라이브 Supabase `public.questions`에 같은 `id`를 upsert했다.
- [ ] 기존 문제 문항, 선택지, 정답, 해설을 바꿨다면 서버도 같은 내용으로 갱신했다.
- [ ] 서버 대조 쿼리로 `quizId`/`extraQuizIds` 누락이 0건인지 확인했다.
- [ ] 로컬 테스트 통과만으로 완료 처리하지 않았다.

### 서버 누락 대조 예시

```sql
with expected(id) as (
  select unnest(array[
    'example-question-id-1',
    'example-question-id-2'
  ]::text[])
)
select expected.id
from expected
left join public.questions q using (id)
where q.id is null
order by expected.id;
```

## 6. 검증

- [ ] `node scripts/validate-questions.mjs --file=...`를 실행했다.
- [ ] `npm test -- --run src/data/lessons/lessons.integration.test.ts src/data/gameModes.test.ts`를 실행했다.
- [ ] `npm run typecheck`를 실행했다.
- [ ] 변경 폭이 크면 `npm run build`를 실행했다.
- [ ] 브라우저에서 실제 `문제 풀기` 버튼을 눌러 서버 예약이 되는지 확인했다.

## 7. 기록

- [ ] `docs/content-edit-log.md`에 짧은 작업 기록을 추가했다.
- [ ] 사용자가 왜 이 수정을 요청했는지 남겼다.
- [ ] 수정 방향과 학습자에게 주는 효과를 남겼다.
- [ ] Supabase 반영 여부를 명확히 썼다.

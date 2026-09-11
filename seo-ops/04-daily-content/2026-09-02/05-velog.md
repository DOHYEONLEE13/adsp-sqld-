STATUS: PUBLISH

REVIEW STATUS: PENDING

PACKAGE DATE: 2026-09-02

TITLE: COUNT(*)와 COUNT(discount)를 작은 데이터로 검증하기

BODY:
SQL 문제에서 ‘행 수’와 ‘값이 있는 행 수’를 혼동했다면, 정답 번호보다 재현 가능한 작은 표를 남기는 편이 좋다. 다음은 직접 만든 예제이며 기출이나 교재 문항의 복제가 아니다. PostgreSQL에서 실행할 수 있는 기본 SQL이다.

```sql
CREATE TEMP TABLE seo_orders (
  id INTEGER,
  discount INTEGER
);
INSERT INTO seo_orders VALUES (1, 0), (2, NULL), (3, 2000);

SELECT COUNT(*) AS rows_total,
       COUNT(discount) AS values_present
FROM seo_orders;
-- rows_total = 3, values_present = 2
```

COUNT(*)는 입력 행을 세고 COUNT(discount)는 discount가 NULL이 아닌 행을 센다. 숫자 0은 값이 있으므로 두 번째 집계에서도 빠지지 않는다. 따라서 COUNT(discount)를 ‘할인받은 주문 수’라고 이름 붙이면 의미가 어긋난다.

```sql
SELECT COUNT(*) AS discounted_orders
FROM seo_orders
WHERE discount > 0;
-- discounted_orders = 1

INSERT INTO seo_orders VALUES (4, 0);
SELECT COUNT(*) AS rows_total,
       COUNT(discount) AS values_present
FROM seo_orders;
-- rows_total = 4, values_present = 3
```

새 0은 행 수와 값이 있는 행 수를 모두 늘리지만, 할인액이 양수인 주문 수는 늘리지 않는다. 복습할 때는 이처럼 한 값만 바꾸고 결과를 실행 전에 적는다. 예상이 어긋난 줄이 다시 볼 개념이다.

[PostgreSQL 집계 함수 문서](https://www.postgresql.org/docs/current/functions-aggregate.html)의 COUNT 정의가 근거다. Oracle의 빈 문자열 처리 등 DBMS별 차이는 이 예제에서 다루지 않는다. 특히 NULL을 모든 상황에서 0이나 빈 문자열로 치환해 암기하지 않는다.

설명이 흐릿하면 QuestDP에서 관련 개념·예제를 확인한 뒤 이 SQL로 돌아와 결과를 다시 예상해볼 수 있다. 문제집 회독에 이런 변형을 붙이는 방법은 [SQLD 문제집 복습 순서](https://quest-dp.com/blog/sqld-노랭이-vs-questdp/)에서 더 살펴볼 수 있다. 앱 내부에서 이 SQL을 실행할 수 있다는 뜻은 아니다.

QUESTDP LINK: YES

LINK TARGET: https://quest-dp.com/blog/sqld-노랭이-vs-questdp/

ORIGINAL VALUE: 자체 SQL 데이터·예상·실행값 비교

STATUS: PUBLISH

REVIEW STATUS: PENDING

PACKAGE DATE: 2026-09-06

TITLE: JOIN 후 고객이 중복처럼 보일 때, 행의 의미부터 확인하기

BODY:
고객이 두 명인데 JOIN 결과가 세 행이라면 곧바로 DISTINCT를 추가하기 전에 연결 조건과 한 행의 의미를 확인한다. 아래는 직접 작성한 PostgreSQL 예제다.

```sql
CREATE TEMP TABLE seo_customers (id INTEGER, name TEXT);
CREATE TEMP TABLE seo_purchases (id TEXT, customer_id INTEGER);
INSERT INTO seo_customers VALUES (1, '민지'), (2, '준호');
INSERT INTO seo_purchases VALUES ('A', 1), ('B', 1), ('C', 2);

SELECT c.name, p.id
FROM seo_customers AS c
JOIN seo_purchases AS p ON c.id = p.customer_id
ORDER BY c.id, p.id;
-- 민지 A
-- 민지 B
-- 준호 C
```

민지에게 두 주문이 있으므로 조건을 만족하는 조합도 두 개다. 결과 한 행은 고객 한 명이 아니라 고객과 주문의 조합을 나타낸다. 이름이 반복돼도 같은 주문이 중복된 것은 아니다. 다만 의도보다 많은 조합이 생겼다면 조건 누락이나 연결 열의 중복부터 조사해야 한다.

```sql
INSERT INTO seo_customers VALUES (3, '수아');
SELECT c.name, p.id
FROM seo_customers AS c
LEFT JOIN seo_purchases AS p ON c.id = p.customer_id
ORDER BY c.id, p.id;
-- 민지 A
-- 민지 B
-- 준호 C
-- 수아 NULL
```

LEFT JOIN은 왼쪽 고객 행을 남긴다. 주문 없는 수아는 주문 쪽 값이 NULL인 한 행으로 나온다. 그렇다고 고객당 정확히 한 행이 되는 것은 아니다. 민지에게는 여전히 두 조합이 있다.

[PostgreSQL JOIN 설명](https://www.postgresql.org/docs/current/tutorial-join.html)을 근거로, INNER와 LEFT의 입력·출력을 직접 비교한 예제다. 다른 DBMS에서는 임시 테이블 생성 문법이 다를 수 있다.

SQLD를 공부하면서 결과 행을 예상하기 어렵다면 QuestDP의 관련 개념·예제를 확인한 뒤 위 데이터를 한 줄만 바꾸어 다시 예상해볼 수 있다. 전체 진도에서 어디에 놓을지 고민되면 [고르기·묶기·연결하기를 포함한 SQLD 학습 순서](https://quest-dp.com/blog/sqld-공부법/)와 이어서 본다. SQL 실행은 별도 DB 환경에서 한다.

QUESTDP LINK: YES

LINK TARGET: https://quest-dp.com/blog/sqld-공부법/

ORIGINAL VALUE: 자체 SQL 데이터·예상·실행값 비교

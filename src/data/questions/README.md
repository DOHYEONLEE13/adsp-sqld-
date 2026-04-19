# 문제 은행 (Question Bank)

실제 ADSP/SQLD 문제 JSON 파일은 이 디렉토리 아래에 subject 별로 배치합니다.

## 디렉토리 규칙

```
src/data/questions/
├── adsp/
│   ├── ch1.json        # 1과목 데이터 이해
│   ├── ch2.json        # 2과목 데이터 분석 기획
│   ├── ch3.json        # 3과목 데이터 분석
│   └── past-exams/
│       ├── 2024-38.json
│       └── 2024-39.json
└── sqld/
    ├── ch1.json        # 1과목 데이터 모델링의 이해
    ├── ch2.json        # 2과목 SQL 기본 및 활용
    └── past-exams/
```

## 파일 스키마

각 JSON 파일은 `QuestionBank` shape 을 따라야 합니다 (`src/types/question.ts` 참조).

```jsonc
{
  "subject": "adsp",
  "meta": {
    "version": "1.0.0",
    "updatedAt": "2026-04-17",
    "source": "2024년 제38회 기출"
  },
  "questions": [
    {
      "id": "adsp-3-001",
      "subject": "adsp",
      "chapter": 3,
      "chapterTitle": "데이터 분석",
      "topic": "통계적 가설 검정",
      "type": "multiple_choice",
      "difficulty": 3,
      "question": "유의수준 0.05 하에서 다음 중 귀무가설을 기각할 수 있는 경우는?",
      "choices": [
        "p-value = 0.08",
        "p-value = 0.03",
        "p-value = 0.50",
        "p-value = 0.10"
      ],
      "answerIndex": 1,
      "explanation": "유의수준 α=0.05 보다 p-value 가 작을 때 귀무가설을 기각합니다.",
      "source": "2024년 제38회 기출"
    }
  ]
}
```

## ID 규칙

- `<subject>-<chapter>-<3자리 인덱스>` 를 권장합니다.
- 기출은 끝에 `-YYYY-회차` 를 붙여 구분: `adsp-3-001-2024-38`.

## 새 파일 추가 시

1. 이 디렉토리 아래에 JSON 파일 추가.
2. 필요시 `src/data/subjects.ts` 의 topic 목록 업데이트.
3. `src/lib/questions.ts` 의 `ALL_QUESTION_BANKS` import 배열에 파일 추가.

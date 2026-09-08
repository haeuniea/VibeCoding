const fs = require('fs');
const path = require('path');

const questions = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'questions.json'), 'utf-8')
);

const EXPECTED_CATEGORIES = ['한국사', '과학', '지리', '예술과 문화'];
const errors = [];

if (questions.length !== 40) {
  errors.push(`총 문제 수가 40개가 아닙니다 (현재 ${questions.length}개)`);
}

const countByCategory = {};
for (const cat of EXPECTED_CATEGORIES) countByCategory[cat] = 0;

const seenIds = new Set();

questions.forEach((q, i) => {
  const label = q.id || `index ${i}`;

  if (!EXPECTED_CATEGORIES.includes(q.category)) {
    errors.push(`[${label}] 알 수 없는 category: "${q.category}"`);
  } else {
    countByCategory[q.category] += 1;
  }

  if (!Array.isArray(q.choices) || q.choices.length !== 4) {
    errors.push(`[${label}] choices 길이가 4가 아닙니다 (현재 ${q.choices ? q.choices.length : 'undefined'})`);
  }

  if (
    typeof q.answerIndex !== 'number' ||
    q.answerIndex < 0 ||
    q.answerIndex > 3 ||
    !Number.isInteger(q.answerIndex)
  ) {
    errors.push(`[${label}] answerIndex가 0~3 범위를 벗어났습니다 (현재 ${q.answerIndex})`);
  }

  if (seenIds.has(q.id)) {
    errors.push(`[${label}] id가 중복되었습니다`);
  }
  seenIds.add(q.id);
});

for (const cat of EXPECTED_CATEGORIES) {
  if (countByCategory[cat] !== 10) {
    errors.push(`카테고리 "${cat}"의 문제 수가 10개가 아닙니다 (현재 ${countByCategory[cat]}개)`);
  }
}

console.log('=== questions.json 검증 결과 ===');
console.log(`총 문제 수: ${questions.length}`);
for (const cat of EXPECTED_CATEGORIES) {
  console.log(`  - ${cat}: ${countByCategory[cat]}문제`);
}
console.log(`id 중복 없음: ${seenIds.size === questions.length ? 'OK' : 'FAIL'}`);

if (errors.length > 0) {
  console.log('\n검증 실패:');
  errors.forEach((e) => console.log(`  - ${e}`));
  process.exit(1);
}

console.log('\n모든 검증 통과');

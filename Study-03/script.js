// 뼈대 단계: 문제 데이터를 불러오는 로더만 준비한다. 화면 로직은 다음 단계에서 구현한다.

async function loadQuestions() {
  const res = await fetch('questions.json');
  return res.json();
}

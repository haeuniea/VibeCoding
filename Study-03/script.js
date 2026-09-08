const CATEGORIES = ['한국사', '과학', '지리', '예술과 문화'];

const CATEGORY_VAR = {
  한국사: '--cat-history',
  과학: '--cat-science',
  지리: '--cat-geo',
  '예술과 문화': '--cat-arts',
};

const screens = {
  start: document.getElementById('screen-start'),
  quiz: document.getElementById('screen-quiz'),
  result: document.getElementById('screen-result'),
};

const nicknameInput = document.getElementById('nickname-input');
const nicknameError = document.getElementById('nickname-error');
const startBtn = document.getElementById('start-btn');

const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('quiz-progress-fill');
const categoryChip = document.getElementById('quiz-category-chip');
const questionText = document.getElementById('question-text');
const choicesEl = document.getElementById('choices');
const answerNote = document.getElementById('answer-note');
const nextBtn = document.getElementById('next-btn');

const resultNickname = document.getElementById('result-nickname');
const scoreTotal = document.getElementById('score-total');
const categoryBreakdown = document.getElementById('category-breakdown');
const replayBtn = document.getElementById('replay-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const debugJson = document.getElementById('debug-result-json');

let allQuestions = [];
let playQueue = [];
let currentIndex = 0;
let answered = false;
let nickname = '';
let score = emptyScore();

function emptyScore() {
  return {
    total: 0,
    categoryCorrect: { 한국사: 0, 과학: 0, 지리: 0, '예술과 문화': 0 },
  };
}

async function loadQuestions() {
  const res = await fetch('questions.json');
  return res.json();
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 매 플레이마다 문제 순서와 각 문제의 보기 순서를 새로 섞은 진행용 큐를 만든다.
function buildPlayQueue(questions) {
  return shuffle(questions).map((q) => {
    const shuffledChoices = shuffle(
      q.choices.map((choice, i) => ({ choice, isAnswer: i === q.answerIndex }))
    );
    return {
      id: q.id,
      category: q.category,
      question: q.question,
      choices: shuffledChoices.map((c) => c.choice),
      answerIndex: shuffledChoices.findIndex((c) => c.isAnswer),
    };
  });
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
}

function startGame() {
  const value = nicknameInput.value.trim();
  if (!value) {
    nicknameError.textContent = '닉네임을 입력해주세요.';
    nicknameError.hidden = false;
    nicknameInput.focus();
    return;
  }
  if (allQuestions.length === 0) {
    nicknameError.textContent = '문제 데이터를 아직 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
    nicknameError.hidden = false;
    return;
  }

  nicknameError.hidden = true;
  nickname = value;
  playQueue = buildPlayQueue(allQuestions);
  currentIndex = 0;
  score = emptyScore();

  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  nextBtn.hidden = true;
  answerNote.hidden = true;

  const q = playQueue[currentIndex];
  progressText.textContent = `${currentIndex + 1} / ${playQueue.length}`;
  progressFill.style.width = `${((currentIndex + 1) / playQueue.length) * 100}%`;
  categoryChip.textContent = q.category;
  categoryChip.style.setProperty('--chip-color', `var(${CATEGORY_VAR[q.category]})`);
  questionText.textContent = q.question;

  choicesEl.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => selectChoice(i));
    choicesEl.appendChild(btn);
  });
}

function selectChoice(index) {
  if (answered) return;
  answered = true;

  const q = playQueue[currentIndex];
  const isCorrect = index === q.answerIndex;

  choicesEl.querySelectorAll('.choice-btn').forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answerIndex) btn.classList.add('correct');
    if (i === index && !isCorrect) btn.classList.add('incorrect');
  });

  if (isCorrect) {
    score.total += 1;
    score.categoryCorrect[q.category] += 1;
    answerNote.textContent = '정답입니다!';
    answerNote.className = 'answer-note correct-text';
  } else {
    answerNote.textContent = `오답입니다. 정답: ${q.choices[q.answerIndex]}`;
    answerNote.className = 'answer-note incorrect-text';
  }
  answerNote.hidden = false;

  nextBtn.textContent = currentIndex === playQueue.length - 1 ? '결과 보기' : '다음 문제';
  nextBtn.hidden = false;
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex >= playQueue.length) {
    finishGame();
  } else {
    renderQuestion();
  }
}

// 채점 결과를 리더보드 저장 함수에 바로 넘길 수 있는 형태로 정리한다 (3단계에서 실제 저장 연결 예정).
function buildResultData() {
  return {
    nickname,
    totalScore: score.total,
    categoryScores: { ...score.categoryCorrect },
    playedAt: Date.now(),
  };
}

function finishGame() {
  const result = buildResultData();

  console.log('퀴즈 결과 (3단계에서 리더보드 저장 함수에 연결 예정):', result);

  resultNickname.textContent = `${nickname}님의 결과`;
  scoreTotal.textContent = String(result.totalScore);

  categoryBreakdown.innerHTML = '';
  CATEGORIES.forEach((cat) => {
    const item = document.createElement('div');
    item.className = 'breakdown-item';
    item.style.setProperty('--chip-color', `var(${CATEGORY_VAR[cat]})`);

    const label = document.createElement('span');
    label.className = 'breakdown-label';
    label.textContent = cat;

    const value = document.createElement('span');
    value.className = 'breakdown-value';
    value.textContent = `${result.categoryScores[cat]} / 10`;

    item.appendChild(label);
    item.appendChild(value);
    categoryBreakdown.appendChild(item);
  });

  debugJson.textContent = JSON.stringify(result, null, 2);

  showScreen('result');
}

startBtn.addEventListener('click', startGame);
nicknameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') startGame();
});
nextBtn.addEventListener('click', nextQuestion);
replayBtn.addEventListener('click', () => {
  nicknameInput.value = '';
  showScreen('start');
});
leaderboardBtn.addEventListener('click', () => {
  alert('리더보드는 다음 단계에서 연결됩니다.');
});

loadQuestions()
  .then((data) => {
    allQuestions = data;
  })
  .catch((err) => {
    console.error('문제 데이터를 불러오지 못했습니다:', err);
    nicknameError.textContent = '문제 데이터를 불러오지 못했습니다. 로컬 서버(예: python -m http.server)로 열어주세요.';
    nicknameError.hidden = false;
  });

// questions.json과 내용이 동일해야 한다 — questions.json을 수정하면 이 배열도 함께 업데이트할 것.
// (fetch 대신 인라인 상수로 두어 index.html을 더블클릭만으로 열 수 있게 한다.)
const QUESTIONS = [
  {
    "id": "kh-01",
    "category": "한국사",
    "question": "조선을 건국한 인물은 누구인가?",
    "choices": ["왕건", "이성계", "김유신", "정도전"],
    "answerIndex": 1
  },
  {
    "id": "kh-02",
    "category": "한국사",
    "question": "훈민정음(한글)을 창제한 조선의 왕은?",
    "choices": ["태종", "세종대왕", "정조", "영조"],
    "answerIndex": 1
  },
  {
    "id": "kh-03",
    "category": "한국사",
    "question": "고려를 건국한 인물은?",
    "choices": ["왕건", "궁예", "견훤", "이성계"],
    "answerIndex": 0
  },
  {
    "id": "kh-04",
    "category": "한국사",
    "question": "임진왜란 당시 거북선을 이끌고 활약한 장군은?",
    "choices": ["권율", "이순신", "강감찬", "을지문덕"],
    "answerIndex": 1
  },
  {
    "id": "kh-05",
    "category": "한국사",
    "question": "일제의 식민 지배에 저항해 전국적으로 만세 시위가 일어난 3·1 운동은 몇 년에 일어났는가?",
    "choices": ["1910년", "1919년", "1929년", "1945년"],
    "answerIndex": 1
  },
  {
    "id": "kh-06",
    "category": "한국사",
    "question": "일제강점기가 끝나고 광복을 맞이한 해는?",
    "choices": ["1943년", "1945년", "1948년", "1950년"],
    "answerIndex": 1
  },
  {
    "id": "kh-07",
    "category": "한국사",
    "question": "이순신 장군의 활약으로 잘 알려진 임진왜란은 몇 년에 발발했는가?",
    "choices": ["1392년", "1592년", "1636년", "1876년"],
    "answerIndex": 1
  },
  {
    "id": "kh-08",
    "category": "한국사",
    "question": "1919년 독립운동가들이 대한민국 임시정부를 수립한 도시는?",
    "choices": ["도쿄", "베이징", "상하이", "하와이"],
    "answerIndex": 2
  },
  {
    "id": "kh-09",
    "category": "한국사",
    "question": "고려 시대에 만들어진, 현존하는 세계 최고(最古)의 금속활자 인쇄본으로 알려진 것은?",
    "choices": ["팔만대장경", "삼국유사", "무구정광대다라니경", "직지심체요절"],
    "answerIndex": 3
  },
  {
    "id": "kh-10",
    "category": "한국사",
    "question": "남북 간의 전면전으로 확대된 6·25 전쟁은 몇 년에 발발했는가?",
    "choices": ["1945년", "1950년", "1953년", "1960년"],
    "answerIndex": 1
  },
  {
    "id": "sc-01",
    "category": "과학",
    "question": "물의 화학식은?",
    "choices": ["CO2", "H2O", "NaCl", "O2"],
    "answerIndex": 1
  },
  {
    "id": "sc-02",
    "category": "과학",
    "question": "혈액 속에서 산소를 운반하는 역할을 하는 세포는?",
    "choices": ["백혈구", "혈소판", "적혈구", "림프구"],
    "answerIndex": 2
  },
  {
    "id": "sc-03",
    "category": "과학",
    "question": "태양계에서 부피와 질량이 가장 큰 행성은?",
    "choices": ["토성", "지구", "목성", "화성"],
    "answerIndex": 2
  },
  {
    "id": "sc-04",
    "category": "과학",
    "question": "식물이 빛 에너지를 이용해 물과 이산화탄소로 양분을 만드는 과정을 무엇이라 하는가?",
    "choices": ["호흡", "광합성", "발효", "증산작용"],
    "answerIndex": 1
  },
  {
    "id": "sc-05",
    "category": "과학",
    "question": "원소기호 'O'가 나타내는 원소는?",
    "choices": ["질소", "탄소", "산소", "수소"],
    "answerIndex": 2
  },
  {
    "id": "sc-06",
    "category": "과학",
    "question": "지구 대기 중 자외선을 흡수해 차단해 주는 층은?",
    "choices": ["전리층", "오존층", "대류권", "중간권"],
    "answerIndex": 1
  },
  {
    "id": "sc-07",
    "category": "과학",
    "question": "성인 인체를 이루는 뼈는 일반적으로 몇 개인가?",
    "choices": ["106개", "206개", "306개", "400개"],
    "answerIndex": 1
  },
  {
    "id": "sc-08",
    "category": "과학",
    "question": "사과가 나무에서 떨어지는 것을 보고 뉴턴이 정립한 것으로 유명한, 질량을 가진 물체끼리 서로 끌어당기는 힘은?",
    "choices": ["부력", "마찰력", "중력", "전자기력"],
    "answerIndex": 2
  },
  {
    "id": "sc-09",
    "category": "과학",
    "question": "1953년 DNA의 이중나선 구조를 밝혀낸 두 과학자는?",
    "choices": ["다윈과 멘델", "왓슨과 크릭", "아인슈타인과 보어", "퀴리 부부"],
    "answerIndex": 1
  },
  {
    "id": "sc-10",
    "category": "과학",
    "question": "1기압에서 물이 끓는 온도(섭씨)는?",
    "choices": ["0도", "37도", "100도", "50도"],
    "answerIndex": 2
  },
  {
    "id": "ge-01",
    "category": "지리",
    "question": "세계에서 가장 긴 강으로 널리 알려진 강은?",
    "choices": ["아마존강", "나일강", "양쯔강", "미시시피강"],
    "answerIndex": 1
  },
  {
    "id": "ge-02",
    "category": "지리",
    "question": "남한(대한민국 실효 지배 영토) 안에서 가장 높은 산은?",
    "choices": ["지리산", "설악산", "한라산", "백두산"],
    "answerIndex": 2
  },
  {
    "id": "ge-03",
    "category": "지리",
    "question": "세계 6대주 중 면적이 가장 넓은 대륙은?",
    "choices": ["아프리카", "유럽", "아시아", "북아메리카"],
    "answerIndex": 2
  },
  {
    "id": "ge-04",
    "category": "지리",
    "question": "2020년대 들어 중국을 제치고 세계에서 인구가 가장 많은 나라가 된 곳은?",
    "choices": ["중국", "인도", "미국", "인도네시아"],
    "answerIndex": 1
  },
  {
    "id": "ge-05",
    "category": "지리",
    "question": "세계 최대 열대우림인 아마존의 대부분이 위치한 나라는?",
    "choices": ["아르헨티나", "페루", "브라질", "콜롬비아"],
    "answerIndex": 2
  },
  {
    "id": "ge-06",
    "category": "지리",
    "question": "일본의 수도는?",
    "choices": ["오사카", "도쿄", "교토", "나고야"],
    "answerIndex": 1
  },
  {
    "id": "ge-07",
    "category": "지리",
    "question": "대륙 중 면적이 가장 작은 대륙은?",
    "choices": ["유럽", "오세아니아", "남아메리카", "아프리카"],
    "answerIndex": 1
  },
  {
    "id": "ge-08",
    "category": "지리",
    "question": "미국과 캐나다의 국경에 걸쳐 있는 나이아가라 폭포가 위치한 대륙은?",
    "choices": ["남아메리카", "아프리카", "북아메리카", "유럽"],
    "answerIndex": 2
  },
  {
    "id": "ge-09",
    "category": "지리",
    "question": "대한민국의 표준시는 협정세계시(UTC)보다 몇 시간 빠른가?",
    "choices": ["8시간", "9시간", "7시간", "10시간"],
    "answerIndex": 1
  },
  {
    "id": "ge-10",
    "category": "지리",
    "question": "세계에서 영토 면적이 가장 넓은 나라는?",
    "choices": ["캐나다", "미국", "중국", "러시아"],
    "answerIndex": 3
  },
  {
    "id": "ar-01",
    "category": "예술과 문화",
    "question": "'모나리자'를 그린 화가는?",
    "choices": ["미켈란젤로", "라파엘로", "레오나르도 다빈치", "반 고흐"],
    "answerIndex": 2
  },
  {
    "id": "ar-02",
    "category": "예술과 문화",
    "question": "'해바라기' 연작으로 유명한 화가는?",
    "choices": ["모네", "반 고흐", "피카소", "세잔"],
    "answerIndex": 1
  },
  {
    "id": "ar-03",
    "category": "예술과 문화",
    "question": "청력을 잃은 상태에서도 교향곡 9번 '합창'을 작곡한 음악가는?",
    "choices": ["모차르트", "바흐", "베토벤", "쇼팽"],
    "answerIndex": 2
  },
  {
    "id": "ar-04",
    "category": "예술과 문화",
    "question": "2024년 한국인 최초로 노벨문학상을 수상한 작가는?",
    "choices": ["박경리", "신경숙", "한강", "황석영"],
    "answerIndex": 2
  },
  {
    "id": "ar-05",
    "category": "예술과 문화",
    "question": "조선 왕들의 통치 기록을 담아 유네스코 세계기록유산으로 등재된 책은?",
    "choices": ["경국대전", "삼국유사", "동의보감", "조선왕조실록"],
    "answerIndex": 3
  },
  {
    "id": "ar-06",
    "category": "예술과 문화",
    "question": "세계적인 인기를 끈 그룹 방탄소년단(BTS)이 데뷔한 연도는?",
    "choices": ["2010년", "2013년", "2016년", "2009년"],
    "answerIndex": 1
  },
  {
    "id": "ar-07",
    "category": "예술과 문화",
    "question": "'오페라의 유령', '캣츠' 등을 작곡한 뮤지컬 거장은?",
    "choices": ["스티븐 손드하임", "앤드루 로이드 웨버", "엘튼 존", "한스 짐머"],
    "answerIndex": 1
  },
  {
    "id": "ar-08",
    "category": "예술과 문화",
    "question": "다보탑과 석가탑이 있는 경주의 사찰은?",
    "choices": ["해인사", "통도사", "불국사", "화엄사"],
    "answerIndex": 2
  },
  {
    "id": "ar-09",
    "category": "예술과 문화",
    "question": "판소리에서 북 장단과 추임새로 소리꾼의 소리를 돕는 사람을 이르는 말은?",
    "choices": ["재비", "창부", "고수", "광대"],
    "answerIndex": 2
  },
  {
    "id": "ar-10",
    "category": "예술과 문화",
    "question": "봉준호 감독의 영화 '기생충'이 황금종려상을 받은 영화제는?",
    "choices": ["베니스 영화제", "베를린 영화제", "칸 영화제", "아카데미 시상식"],
    "answerIndex": 2
  }
];

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
  records: document.getElementById('screen-records'),
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
const recordsBtn = document.getElementById('records-btn');

const recordsStatus = document.getElementById('records-status');
const recordsList = document.getElementById('records-list');
const myRecordBanner = document.getElementById('my-record-banner');
const recordsReplayBtn = document.getElementById('records-replay-btn');

const RECORDS_KEY = 'quiz-records';

let playQueue = [];
let currentIndex = 0;
let answered = false;
let nickname = '';
let score = emptyScore();
let lastRecordId = null;
let gameFinished = false;

function emptyScore() {
  return {
    total: 0,
    categoryCorrect: { 한국사: 0, 과학: 0, 지리: 0, '예술과 문화': 0 },
  };
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
    nicknameError.hidden = false;
    nicknameInput.focus();
    return;
  }

  nicknameError.hidden = true;
  nickname = value;
  lastRecordId = null;
  gameFinished = false;
  playQueue = buildPlayQueue(QUESTIONS);
  currentIndex = 0;
  score = emptyScore();

  showScreen('quiz');
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  nextBtn.hidden = true;
  nextBtn.disabled = false;
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
  // 버튼을 빠르게 연속 클릭해도 finishGame()이 두 번 실행되지 않도록 즉시 비활성화한다.
  nextBtn.disabled = true;

  currentIndex += 1;
  if (currentIndex >= playQueue.length) {
    finishGame();
  } else {
    renderQuestion();
  }
}

function finishGame() {
  if (gameFinished) return;
  gameFinished = true;

  resultNickname.textContent = `${nickname}님의 결과`;
  scoreTotal.textContent = String(score.total);

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
    value.textContent = `${score.categoryCorrect[cat]} / 10`;

    item.appendChild(label);
    item.appendChild(value);
    categoryBreakdown.appendChild(item);
  });

  lastRecordId = addRecord({
    nickname,
    totalScore: score.total,
    categoryScores: { ...score.categoryCorrect },
    playedAt: Date.now(),
  });

  showScreen('result');
}

// --- 이 기기의 플레이 기록 (localStorage) ---
// "공유" 리더보드가 아니라, 같은 기기/브라우저에서 여러 명이 번갈아 플레이했을 때
// 각자의 기록을 누적 저장해 비교해볼 수 있게 하는 로컬 전용 기록판이다.

function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    // localStorage 사용 불가 시(용량 초과, 비공개 모드 등) 저장을 건너뛴다
  }
}

function addRecord(result) {
  const records = loadRecords();
  const record = { ...result, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  records.push(record);
  saveRecords(records);
  return record.id;
}

function renderRecordRow(record, rank) {
  const li = document.createElement('li');
  li.className = 'record-row';
  if (record.id === lastRecordId) li.classList.add('me');

  const rankEl = document.createElement('span');
  rankEl.className = 'rec-rank';
  rankEl.textContent = String(rank);

  const nameEl = document.createElement('span');
  nameEl.className = 'rec-name';
  nameEl.textContent = record.nickname;

  const scoreEl = document.createElement('span');
  scoreEl.className = 'rec-score';
  scoreEl.textContent = `${record.totalScore} / 40`;

  li.appendChild(rankEl);
  li.appendChild(nameEl);
  li.appendChild(scoreEl);
  return li;
}

function showRecords() {
  showScreen('records');

  const records = loadRecords();
  // 총점 내림차순, 동점이면 먼저 기록된(=배열에 먼저 쌓인) 순서를 유지하는 안정 정렬.
  const sorted = records.slice().sort((a, b) => b.totalScore - a.totalScore);

  recordsStatus.textContent =
    sorted.length === 0
      ? '아직 이 기기에 저장된 기록이 없습니다.'
      : `이 기기에 저장된 기록 ${sorted.length}개 (상위 50개 표시)`;

  recordsList.innerHTML = '';
  sorted.slice(0, 50).forEach((record, i) => {
    recordsList.appendChild(renderRecordRow(record, i + 1));
  });

  myRecordBanner.hidden = true;
  if (lastRecordId) {
    const myIndex = sorted.findIndex((r) => r.id === lastRecordId);
    if (myIndex >= 0) {
      myRecordBanner.hidden = false;
      myRecordBanner.textContent = `방금 기록: ${myIndex + 1}위 / ${sorted.length}개 중`;
    }
  }
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
recordsBtn.addEventListener('click', showRecords);
recordsReplayBtn.addEventListener('click', () => {
  nicknameInput.value = '';
  showScreen('start');
});

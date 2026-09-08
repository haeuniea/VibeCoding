// 점수 계산 로직
class ScoreManager {
    constructor() {
        this.BASE_SCORE = 10;
        this.TIME_BONUS_THRESHOLD = 10; // 초
        this.TIME_BONUS = 3;
        this.NO_HINT_BONUS = 2;
    }

    // 연속 정답 콤보 보너스
    getConsecutiveBonus(consecutiveCorrect) {
        if (consecutiveCorrect >= 10) return 15;
        if (consecutiveCorrect >= 7) return 10;
        if (consecutiveCorrect >= 5) return 7;
        if (consecutiveCorrect >= 3) return 4;
        return 0;
    }

    // 점수 구성 내역 (UI 표시용)
    getScoreBreakdown(isCorrect, timeSpent, consecutiveCorrect, hintUsed) {
        const breakdown = { base: 0, timeBonus: 0, noHintBonus: 0, comboBonus: 0, total: 0 };

        if (isCorrect) {
            breakdown.base = this.BASE_SCORE;
            if (timeSpent < this.TIME_BONUS_THRESHOLD) breakdown.timeBonus = this.TIME_BONUS;
            if (!hintUsed) breakdown.noHintBonus = this.NO_HINT_BONUS;
            breakdown.comboBonus = this.getConsecutiveBonus(consecutiveCorrect);
        }

        breakdown.total = breakdown.base + breakdown.timeBonus + breakdown.noHintBonus + breakdown.comboBonus;
        return breakdown;
    }

    calculateScore(isCorrect, timeSpent, consecutiveCorrect, hintUsed) {
        return this.getScoreBreakdown(isCorrect, timeSpent, consecutiveCorrect, hintUsed).total;
    }
}

// 게임 모드 설정
const GAME_MODES = {
    full: { id: 'full', label: '전체 도전', questionCount: 40, timeLimit: null },
    category: { id: 'category', label: '카테고리별 도전', questionCount: 10, timeLimit: null },
    speed: { id: 'speed', label: '스피드 퀴즈', questionCount: 20, timeLimit: 15 }
};

const MAX_HINTS = 3;
const scoreManager = new ScoreManager();

// 사용자가 시작 화면에서 고른 옵션 (재시작해도 유지)
let selectedMode = 'full';
let selectedCategory = '한국사';

// 게임 상태 관리
let gameState = createInitialState();

function createInitialState() {
    return {
        mode: 'full',
        category: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        correctAnswers: 0,
        answers: [],
        categoryScores: {},
        isAnswered: false,
        isPaused: false,
        consecutiveCorrect: 0,
        longestStreak: 0,
        hintsRemaining: MAX_HINTS,
        hintUsedThisQuestion: false,
        responseTimes: [],
        questionStartTime: 0,
        timeLimit: null,
        timeRemaining: null,
        timerInterval: null
    };
}

// DOM 요소들
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const feedbackModal = document.getElementById('feedbackModal');

const modeButtons = document.querySelectorAll('.mode-btn');
const categorySelectWrap = document.getElementById('categorySelectWrap');
const categorySelect = document.getElementById('categorySelect');

const categoryBadge = document.getElementById('categoryBadge');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');

const currentQuestionEl = document.getElementById('currentQuestion');
const totalQuestionsEl = document.getElementById('totalQuestions');
const currentScoreEl = document.getElementById('currentScore');
const progressFillEl = document.getElementById('progressFill');

const hintBtn = document.getElementById('hintBtn');
const hintsLeftEl = document.getElementById('hintsLeft');
const pauseBtn = document.getElementById('pauseBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const resumeBtn = document.getElementById('resumeBtn');

const timerBar = document.getElementById('timerBar');
const timerFillEl = document.getElementById('timerFill');
const timerText = document.getElementById('timerText');
const timeLeftEl = document.getElementById('timeLeft');

const streakBadge = document.getElementById('streakBadge');
const streakCountEl = document.getElementById('streakCount');

const feedbackIcon = document.getElementById('feedbackIcon');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackExplanation = document.getElementById('feedbackExplanation');
const scoreBreakdownEl = document.getElementById('scoreBreakdown');

// 배열 섞기 (Fisher-Yates)
function shuffleArray(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// 모드에 맞는 문제 세트 구성
function buildQuestionSet(mode, category) {
    const config = GAME_MODES[mode];
    const pool = mode === 'category'
        ? quizQuestions.filter(q => q.category === category)
        : quizQuestions;

    const shuffled = shuffleArray(pool);
    return shuffled.slice(0, Math.min(config.questionCount, shuffled.length));
}

// 문제 세트에 등장하는 카테고리 기준으로 집계 맵 생성
function buildCategoryScoreMap(questions) {
    const map = {};
    questions.forEach(q => {
        if (!map[q.category]) map[q.category] = { correct: 0, total: 0 };
    });
    return map;
}

// 게임 초기화
function initGame() {
    const modeConfig = GAME_MODES[selectedMode];
    const questions = buildQuestionSet(selectedMode, selectedCategory);

    gameState = createInitialState();
    gameState.mode = selectedMode;
    gameState.category = selectedMode === 'category' ? selectedCategory : null;
    gameState.questions = questions;
    gameState.categoryScores = buildCategoryScoreMap(questions);
    gameState.timeLimit = modeConfig.timeLimit;
    gameState.timeRemaining = modeConfig.timeLimit;

    // 화면 전환
    startScreen.classList.remove('active');
    quizScreen.classList.add('active');
    resultScreen.classList.remove('active');
    feedbackModal.classList.remove('show');
    pauseOverlay.classList.remove('show');
    pauseBtn.textContent = '⏸️';
    pauseBtn.disabled = false;

    // 첫 문제 로드
    loadQuestion();
}

// 문제 로드 및 표시
function loadQuestion() {
    clearQuestionTimer();

    const question = gameState.questions[gameState.currentQuestionIndex];

    // 진행률 업데이트
    updateProgress();

    // 카테고리 배지 업데이트
    if (categoryBadge) categoryBadge.textContent = question.category;

    // 문제 텍스트 표시
    if (questionText) questionText.textContent = question.question;

    // 선택지 생성
    if (optionsContainer) {
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.onclick = () => handleAnswer(index);
            optionsContainer.appendChild(button);
        });
    }

    // 상태 초기화
    gameState.isAnswered = false;
    gameState.hintUsedThisQuestion = false;
    updateHintUI();
    updateStreakBadge();

    // 타이머 시작
    gameState.questionStartTime = Date.now();
    if (gameState.timeLimit) {
        gameState.timeRemaining = gameState.timeLimit;
        showTimerUI(true);
        updateTimerUI();
        startQuestionTimer();
    } else {
        showTimerUI(false);
    }
}

// 문제별 타이머
function startQuestionTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining -= 1;
        updateTimerUI();

        if (gameState.timeRemaining <= 0) {
            clearQuestionTimer();
            handleAnswer(-1); // 시간 초과 = 오답 처리
        }
    }, 1000);
}

function clearQuestionTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerUI() {
    if (!timeLeftEl || !timerFillEl) return;
    timeLeftEl.textContent = gameState.timeRemaining;
    const percent = Math.max(0, (gameState.timeRemaining / gameState.timeLimit) * 100);
    timerFillEl.style.width = `${percent}%`;
    timerFillEl.classList.toggle('warning', gameState.timeRemaining <= 5);
}

function showTimerUI(show) {
    if (timerBar) timerBar.hidden = !show;
    if (timerText) timerText.hidden = !show;
}

// 힌트 UI 갱신
function updateHintUI() {
    if (!hintBtn || !hintsLeftEl) return;
    hintsLeftEl.textContent = gameState.hintsRemaining;
    hintBtn.disabled = gameState.hintsRemaining <= 0 || gameState.hintUsedThisQuestion || gameState.isAnswered;
}

// 힌트 사용: 오답 2개 제거
function useHint() {
    if (gameState.isAnswered || gameState.isPaused) return;
    if (gameState.hintsRemaining <= 0 || gameState.hintUsedThisQuestion) return;

    const question = gameState.questions[gameState.currentQuestionIndex];
    const buttons = Array.from(document.querySelectorAll('.option-btn'));
    const wrongButtons = buttons.filter((btn, idx) => idx !== question.correctAnswer);

    const toEliminate = shuffleArray(wrongButtons).slice(0, 2);
    toEliminate.forEach(btn => {
        btn.classList.add('eliminated');
        btn.disabled = true;
    });

    gameState.hintsRemaining -= 1;
    gameState.hintUsedThisQuestion = true;
    updateHintUI();
}

// 일시정지
function pauseGame() {
    if (gameState.isPaused || gameState.isAnswered) return;
    gameState.isPaused = true;
    clearQuestionTimer();
    pauseOverlay.classList.add('show');
    pauseBtn.textContent = '▶️';
}

function resumeGame() {
    if (!gameState.isPaused) return;
    gameState.isPaused = false;
    pauseOverlay.classList.remove('show');
    pauseBtn.textContent = '⏸️';

    if (gameState.timeLimit && !gameState.isAnswered) {
        startQuestionTimer();
    }
}

// 연속 정답 배지
function updateStreakBadge() {
    if (!streakBadge || !streakCountEl) return;
    if (gameState.consecutiveCorrect >= 2) {
        streakBadge.hidden = false;
        streakCountEl.textContent = gameState.consecutiveCorrect;
    } else {
        streakBadge.hidden = true;
    }
}

// 답변 처리 (selectedIndex === -1 이면 시간 초과로 인한 미응답)
function handleAnswer(selectedIndex) {
    if (gameState.isAnswered) return;

    gameState.isAnswered = true;
    clearQuestionTimer();
    pauseBtn.disabled = true;

    const question = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswer;
    const timeSpent = (Date.now() - gameState.questionStartTime) / 1000;
    gameState.responseTimes.push(timeSpent);

    // 카테고리별 점수 업데이트
    gameState.categoryScores[question.category].total++;

    if (isCorrect) {
        gameState.consecutiveCorrect++;
        gameState.correctAnswers++;
        gameState.categoryScores[question.category].correct++;
    } else {
        gameState.consecutiveCorrect = 0;
    }
    gameState.longestStreak = Math.max(gameState.longestStreak, gameState.consecutiveCorrect);

    // 점수 계산
    const breakdown = scoreManager.getScoreBreakdown(
        isCorrect,
        timeSpent,
        gameState.consecutiveCorrect,
        gameState.hintUsedThisQuestion
    );
    gameState.score += breakdown.total;

    // 답변 저장
    gameState.answers.push({
        questionId: question.id,
        selected: selectedIndex,
        correct: question.correctAnswer,
        isCorrect: isCorrect,
        timeSpent: timeSpent,
        scoreEarned: breakdown.total
    });

    // UI 피드백
    showAnswerFeedback(selectedIndex, question.correctAnswer, isCorrect);
    updateProgress();
    updateStreakBadge();
    updateHintUI();

    // 피드백 모달 표시
    setTimeout(() => {
        showFeedback(isCorrect, question.explanation, breakdown);
    }, 1000);
}

// 답변 피드백 UI
function showAnswerFeedback(selectedIndex, correctIndex, isCorrect) {
    const buttons = document.querySelectorAll('.option-btn');

    // 모든 버튼 비활성화
    buttons.forEach(btn => {
        btn.classList.add('disabled');
        btn.disabled = true;
    });

    if (selectedIndex >= 0) {
        if (isCorrect) {
            buttons[selectedIndex].classList.add('correct');
        } else {
            buttons[selectedIndex].classList.add('incorrect');
            buttons[correctIndex].classList.add('correct');
        }
    } else {
        // 시간 초과: 정답만 표시
        buttons[correctIndex].classList.add('correct');
    }
}

// 피드백 모달 표시
function showFeedback(isCorrect, explanation, breakdown) {
    feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
    feedbackTitle.textContent = isCorrect ? '정답입니다!' : '틀렸습니다';
    feedbackExplanation.textContent = explanation;

    if (isCorrect && breakdown) {
        const parts = [`기본 +${breakdown.base}`];
        if (breakdown.timeBonus) parts.push(`시간보너스 +${breakdown.timeBonus}`);
        if (breakdown.noHintBonus) parts.push(`노힌트 +${breakdown.noHintBonus}`);
        if (breakdown.comboBonus) parts.push(`콤보 +${breakdown.comboBonus}`);
        scoreBreakdownEl.textContent = `+${breakdown.total}점 (${parts.join(' · ')})`;
        scoreBreakdownEl.hidden = false;
    } else {
        scoreBreakdownEl.hidden = true;
    }

    feedbackModal.classList.add('show');
}

// 다음 문제로 이동
function nextQuestion() {
    feedbackModal.classList.remove('show');
    gameState.currentQuestionIndex++;
    pauseBtn.disabled = false;

    if (gameState.currentQuestionIndex < gameState.questions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// 게임 종료
function endGame() {
    clearQuestionTimer();

    // 화면 전환
    quizScreen.classList.remove('active');
    resultScreen.classList.add('active');

    // 결과 표시
    displayResults();
}

// 결과 표시
function displayResults() {
    const total = gameState.questions.length;

    // 최종 점수
    document.getElementById('finalScore').textContent = gameState.score;

    // 정답 개수
    document.getElementById('correctCount').textContent = `${gameState.correctAnswers} / ${total}`;

    // 정답률
    const accuracy = total > 0 ? Math.round((gameState.correctAnswers / total) * 100) : 0;
    document.getElementById('accuracyRate').textContent = `${accuracy}%`;

    // 평균 응답 시간
    const avgTime = gameState.responseTimes.length > 0
        ? gameState.responseTimes.reduce((sum, t) => sum + t, 0) / gameState.responseTimes.length
        : 0;
    document.getElementById('avgResponseTime').textContent = `${avgTime.toFixed(1)}초`;

    // 최장 연속 정답
    document.getElementById('longestStreak').textContent = gameState.longestStreak;

    // 게임 모드
    const modeLabelEl = document.getElementById('modeLabel');
    if (modeLabelEl) {
        const label = GAME_MODES[gameState.mode].label;
        modeLabelEl.textContent = gameState.category ? `${label} (${gameState.category})` : label;
    }

    // 카테고리별 결과
    const categoryResults = document.getElementById('categoryResults');
    categoryResults.innerHTML = '';

    for (const [category, scores] of Object.entries(gameState.categoryScores)) {
        if (scores.total === 0) continue;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-result';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'category-name';
        nameSpan.textContent = category;

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'category-score';
        scoreSpan.textContent = `${scores.correct} / ${scores.total}`;

        categoryDiv.appendChild(nameSpan);
        categoryDiv.appendChild(scoreSpan);
        categoryResults.appendChild(categoryDiv);
    }
}

// 진행률 업데이트
function updateProgress() {
    const current = gameState.currentQuestionIndex + 1;
    const total = gameState.questions.length;

    if (currentQuestionEl) currentQuestionEl.textContent = current;
    if (totalQuestionsEl) totalQuestionsEl.textContent = total;
    if (currentScoreEl) currentScoreEl.textContent = gameState.score;

    // 진행률 바 업데이트
    if (progressFillEl) {
        const progressPercent = (current / total) * 100;
        progressFillEl.style.width = `${progressPercent}%`;
    }
}

// 게임 재시작
function restartGame() {
    clearQuestionTimer();
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}

// 모드 선택
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.dataset.mode;
        categorySelectWrap.hidden = selectedMode !== 'category';
    });
});

categorySelect.addEventListener('change', () => {
    selectedCategory = categorySelect.value;
});

// 이벤트 리스너
startBtn.addEventListener('click', () => {
    initGame();
});

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartGame);
hintBtn.addEventListener('click', useHint);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);

// 키보드 단축키 지원
document.addEventListener('keydown', (e) => {
    if (gameState.isPaused) {
        if (e.key.toLowerCase() === 'p') resumeGame();
        return;
    }

    if (quizScreen.classList.contains('active') && !gameState.isAnswered) {
        // 1-4 숫자키로 답변 선택
        if (e.key >= '1' && e.key <= '4') {
            const index = parseInt(e.key) - 1;
            const buttons = document.querySelectorAll('.option-btn');
            if (buttons[index] && !buttons[index].classList.contains('eliminated')) {
                handleAnswer(index);
            }
        } else if (e.key.toLowerCase() === 'h') {
            useHint();
        } else if (e.key.toLowerCase() === 'p') {
            pauseGame();
        }
    } else if (feedbackModal.classList.contains('show')) {
        // Enter 키로 다음 문제
        if (e.key === 'Enter') {
            nextQuestion();
        }
    }
});

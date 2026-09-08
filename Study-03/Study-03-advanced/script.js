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
const dataManager = new LocalDataManager();

// 사용자가 시작 화면에서 고른 옵션 (재시작해도 유지)
let selectedMode = 'full';
let selectedCategory = '한국사';
let selectedStudentName = '';

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
        timerInterval: null,
        studentName: ''
    };
}

// DOM 요소들
const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const statsScreen = document.getElementById('statsScreen');
const allScreens = [startScreen, quizScreen, resultScreen, leaderboardScreen, statsScreen];

const startBtn = document.getElementById('startBtn');
const studentNameInput = document.getElementById('studentNameInput');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const shareBtn = document.getElementById('shareBtn');
const feedbackModal = document.getElementById('feedbackModal');

const soundToggleBtn = document.getElementById('soundToggleBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const leaderboardBtn = document.getElementById('leaderboardBtn');
const statsBtn = document.getElementById('statsBtn');
const leaderboardBackBtn = document.getElementById('leaderboardBackBtn');
const statsBackBtn = document.getElementById('statsBackBtn');
const periodFilter = document.getElementById('periodFilter');
const leaderboardCategoryFilter = document.getElementById('leaderboardCategoryFilter');
const leaderboardList = document.getElementById('leaderboardList');
const leaderboardEmpty = document.getElementById('leaderboardEmpty');

const statsPlayCountEl = document.getElementById('statsPlayCount');
const statsBestScoreEl = document.getElementById('statsBestScore');
const statsAvgScoreEl = document.getElementById('statsAvgScore');
const categoryAccuracyList = document.getElementById('categoryAccuracyList');
const scoreTrendChart = document.getElementById('scoreTrendChart');
const statsEmpty = document.getElementById('statsEmpty');

const newBestBadge = document.getElementById('newBestBadge');

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

// 화면 전환 공통 헬퍼
function showScreen(screenEl) {
    allScreens.forEach(s => s.classList.remove('active'));
    screenEl.classList.add('active');
}

// ===== 다크모드 =====
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggleBtn.setAttribute('aria-pressed', String(theme === 'dark'));
    }
}

function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    applyTheme(saved);
}

// ===== 사운드 효과 =====
let soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND) !== 'off';
let audioContext = null;

function updateSoundBtn() {
    if (!soundToggleBtn) return;
    soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggleBtn.setAttribute('aria-pressed', String(soundEnabled));
}

function playTone(freq, duration, type = 'sine') {
    if (!soundEnabled) return;
    try {
        if (!audioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioCtx();
        }
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        osc.connect(gain).connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + duration);
    } catch (e) {
        // 오디오를 지원하지 않는 환경은 무시
    }
}

function playCorrectSound() {
    playTone(880, 0.18);
    setTimeout(() => playTone(1175, 0.18), 100);
}

function playIncorrectSound() {
    playTone(220, 0.25, 'sawtooth');
}

// ===== 결과 공유 토스트 =====
function showToast(message) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = 'app-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== 리더보드 =====
let leaderboardPeriod = 'allTime';

function renderLeaderboard() {
    const category = leaderboardCategoryFilter.value || null;
    const entries = dataManager.getLeaderboard({ period: leaderboardPeriod, category, limit: 10 });

    leaderboardList.innerHTML = '';
    leaderboardEmpty.hidden = entries.length > 0;

    entries.forEach((entry, idx) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';

        const rankSpan = document.createElement('span');
        rankSpan.className = 'leaderboard-rank';
        rankSpan.textContent = `#${idx + 1}`;

        const infoSpan = document.createElement('span');
        infoSpan.className = 'leaderboard-info';
        const modeLabel = GAME_MODES[entry.mode] ? GAME_MODES[entry.mode].label : entry.mode;
        const dateStr = new Date(entry.timestamp).toLocaleDateString('ko-KR');
        infoSpan.textContent = `${modeLabel}${entry.category ? ' · ' + entry.category : ''} · ${dateStr}`;

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'leaderboard-score';
        scoreSpan.textContent = `${entry.totalScore}점`;

        li.appendChild(rankSpan);
        li.appendChild(infoSpan);
        li.appendChild(scoreSpan);
        leaderboardList.appendChild(li);
    });
}

// ===== 내 통계 =====
function renderStats() {
    const history = dataManager.getGameHistory();
    statsEmpty.hidden = history.length > 0;

    statsPlayCountEl.textContent = dataManager.getPlayCount();
    statsBestScoreEl.textContent = dataManager.getBestScore();
    const avgScore = history.length > 0
        ? Math.round(history.reduce((sum, h) => sum + h.totalScore, 0) / history.length)
        : 0;
    statsAvgScoreEl.textContent = avgScore;

    // 카테고리별 정답률
    const categoryStats = dataManager.getCategoryStats();
    categoryAccuracyList.innerHTML = '';
    Object.entries(categoryStats).forEach(([category, s]) => {
        const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;

        const row = document.createElement('div');
        row.className = 'accuracy-row';

        const label = document.createElement('span');
        label.className = 'accuracy-label';
        label.textContent = category;

        const track = document.createElement('div');
        track.className = 'accuracy-bar-track';
        const fill = document.createElement('div');
        fill.className = 'accuracy-bar-fill';
        fill.style.width = `${pct}%`;
        track.appendChild(fill);

        const pctSpan = document.createElement('span');
        pctSpan.className = 'accuracy-pct';
        pctSpan.textContent = `${pct}%`;

        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(pctSpan);
        categoryAccuracyList.appendChild(row);
    });

    // 최근 점수 추이 (스파크라인)
    const recentScores = dataManager.getRecentScores(10);
    scoreTrendChart.innerHTML = '';
    const maxScore = Math.max(1, ...recentScores);
    recentScores.forEach(score => {
        const bar = document.createElement('div');
        bar.className = 'trend-bar';
        bar.style.height = `${Math.max(6, Math.round((score / maxScore) * 100))}%`;
        bar.title = `${score}점`;
        scoreTrendChart.appendChild(bar);
    });
}

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
    gameState.studentName = selectedStudentName;
    gameState.questions = questions;
    gameState.categoryScores = buildCategoryScoreMap(questions);
    gameState.timeLimit = modeConfig.timeLimit;
    gameState.timeRemaining = modeConfig.timeLimit;

    // 화면 전환
    showScreen(quizScreen);
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
    if (isCorrect) playCorrectSound(); else playIncorrectSound();
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
    showScreen(resultScreen);

    // 결과 표시
    displayResults();
}

// 결과 표시
function displayResults() {
    const total = gameState.questions.length;

    // 정답률 / 평균 응답 시간 (저장에도 사용)
    const accuracy = total > 0 ? Math.round((gameState.correctAnswers / total) * 100) : 0;
    const avgTime = gameState.responseTimes.length > 0
        ? gameState.responseTimes.reduce((sum, t) => sum + t, 0) / gameState.responseTimes.length
        : 0;

    // 기록 저장 및 신기록 여부 확인
    const previousBest = dataManager.getBestScore();
    dataManager.saveGameResult({
        mode: gameState.mode,
        category: gameState.category,
        totalScore: gameState.score,
        correctAnswers: gameState.correctAnswers,
        totalQuestions: total,
        accuracy: accuracy,
        avgResponseTime: avgTime,
        longestStreak: gameState.longestStreak,
        categoryScores: gameState.categoryScores,
        studentName: gameState.studentName
    });
    if (newBestBadge) newBestBadge.hidden = gameState.score <= previousBest;

    // 최종 점수
    document.getElementById('finalScore').textContent = gameState.score;

    // 정답 개수
    document.getElementById('correctCount').textContent = `${gameState.correctAnswers} / ${total}`;

    document.getElementById('accuracyRate').textContent = `${accuracy}%`;

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
    showScreen(startScreen);
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
    const name = studentNameInput.value.trim() || '익명';
    selectedStudentName = name;
    dataManager.setStudentName(name);
    initGame();
});

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartGame);
hintBtn.addEventListener('click', useHint);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);

// 다크모드 / 사운드 토글
themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
});

soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled ? 'on' : 'off');
    updateSoundBtn();
});

// 리더보드 / 통계 화면
leaderboardBtn.addEventListener('click', () => {
    renderLeaderboard();
    showScreen(leaderboardScreen);
});

statsBtn.addEventListener('click', () => {
    renderStats();
    showScreen(statsScreen);
});

leaderboardBackBtn.addEventListener('click', () => showScreen(startScreen));
statsBackBtn.addEventListener('click', () => showScreen(startScreen));

// 내 기록 내보내기 (선생님 모드 리포트용)
exportHistoryBtn.addEventListener('click', () => {
    const history = dataManager.getGameHistory();
    if (history.length === 0) {
        showToast('내보낼 기록이 없습니다. 먼저 게임을 플레이해보세요!');
        return;
    }

    const studentName = studentNameInput.value.trim() || dataManager.getStudentName() || '익명';
    const exportData = dataManager.exportHistory(studentName);
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const safeName = studentName.replace(/[\\/:*?"<>|\s]+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_기록_${safeName}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

periodFilter.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    periodFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    leaderboardPeriod = btn.dataset.period;
    renderLeaderboard();
});

leaderboardCategoryFilter.addEventListener('change', renderLeaderboard);

// 결과 공유
shareBtn.addEventListener('click', async () => {
    const total = gameState.questions.length;
    const accuracy = total > 0 ? Math.round((gameState.correctAnswers / total) * 100) : 0;
    const text = `🎯 퀴즈 게임 결과\n점수: ${gameState.score}점\n정답: ${gameState.correctAnswers}/${total} (${accuracy}%)\n최장 연속 정답: ${gameState.longestStreak}회`;

    try {
        await navigator.clipboard.writeText(text);
        showToast('결과가 클립보드에 복사되었습니다!');
    } catch (e) {
        showToast('클립보드 복사에 실패했습니다.');
    }
});

// 초기화
initTheme();
updateSoundBtn();
if (studentNameInput) studentNameInput.value = dataManager.getStudentName();

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

// 로컬 데이터 저장/통계/리더보드 관리
const STORAGE_KEYS = {
    HISTORY: 'quizGameHistory',
    THEME: 'quizTheme',
    SOUND: 'quizSoundEnabled',
    STUDENT_NAME: 'quizStudentName'
};

class LocalDataManager {
    getGameHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    saveGameResult(result) {
        const history = this.getGameHistory();
        history.push({
            ...result,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
        return history;
    }

    getBestScore() {
        const history = this.getGameHistory();
        if (history.length === 0) return 0;
        return Math.max(...history.map(h => h.totalScore));
    }

    getPlayCount() {
        return this.getGameHistory().length;
    }

    // period: 'allTime' | 'weekly' | 'daily', category: null이면 전체
    getLeaderboard({ period = 'allTime', category = null, limit = 10 } = {}) {
        const now = Date.now();
        const filtered = this.getGameHistory().filter(h => {
            if (category && h.category !== category) return false;
            if (period === 'allTime') return true;
            const elapsed = now - new Date(h.timestamp).getTime();
            if (period === 'daily') return elapsed <= 24 * 60 * 60 * 1000;
            if (period === 'weekly') return elapsed <= 7 * 24 * 60 * 60 * 1000;
            return true;
        });

        return filtered
            .slice()
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit);
    }

    // 카테고리별 누적 정답/전체 문제 수
    getCategoryStats() {
        const stats = {};
        this.getGameHistory().forEach(h => {
            Object.entries(h.categoryScores || {}).forEach(([cat, s]) => {
                if (!stats[cat]) stats[cat] = { correct: 0, total: 0 };
                stats[cat].correct += s.correct;
                stats[cat].total += s.total;
            });
        });
        return stats;
    }

    // 최근 N게임의 점수 목록 (오래된 순)
    getRecentScores(limit = 10) {
        return this.getGameHistory().slice(-limit).map(h => h.totalScore);
    }

    getStudentName() {
        return localStorage.getItem(STORAGE_KEYS.STUDENT_NAME) || '';
    }

    setStudentName(name) {
        localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, name);
    }

    // 선생님 모드 리포트용 내보내기 스키마
    exportHistory(studentName) {
        return {
            studentName,
            exportedAt: new Date().toISOString(),
            history: this.getGameHistory()
        };
    }
}

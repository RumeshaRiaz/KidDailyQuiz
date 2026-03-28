import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOTAL_STARS:     'totalStars',
  STREAK:          'streak',
  LAST_PLAYED:     'lastPlayed',
  BADGES:          'badges',
  SCORES:          'scores',
  DAILY_Q_COUNT:   'dailyQCount',
  DAILY_Q_DATE:    'dailyQDate',
  CLAIMED_REWARDS:      'claimedRewards',
  DAILY_CHALLENGE_DATE: 'dailyChallengeDate',
};

export const Storage = {
  async getTotalStars() {
    const val = await AsyncStorage.getItem(KEYS.TOTAL_STARS);
    return val ? parseInt(val) : 0;
  },

  async addStars(count) {
    const current = await this.getTotalStars();
    const newTotal = current + count;
    await AsyncStorage.setItem(KEYS.TOTAL_STARS, String(newTotal));
    return newTotal;
  },

  async getStreak() {
    const lastPlayed = await AsyncStorage.getItem(KEYS.LAST_PLAYED);
    const streak = await AsyncStorage.getItem(KEYS.STREAK);
    if (!lastPlayed) return 0;
    const last = new Date(lastPlayed);
    const now = new Date();
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return parseInt(streak) || 1;
    if (diffDays === 1) return parseInt(streak) || 0;
    return 0;
  },

  async updateStreak() {
    const lastPlayed = await AsyncStorage.getItem(KEYS.LAST_PLAYED);
    const streakVal = await AsyncStorage.getItem(KEYS.STREAK);
    const now = new Date();
    if (!lastPlayed) {
      await AsyncStorage.setItem(KEYS.STREAK, '1');
      await AsyncStorage.setItem(KEYS.LAST_PLAYED, now.toISOString());
      return 1;
    }
    const last = new Date(lastPlayed);
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    let newStreak = 1;
    if (diffDays === 1) newStreak = (parseInt(streakVal) || 0) + 1;
    else if (diffDays === 0) newStreak = parseInt(streakVal) || 1;
    await AsyncStorage.setItem(KEYS.STREAK, String(newStreak));
    await AsyncStorage.setItem(KEYS.LAST_PLAYED, now.toISOString());
    return newStreak;
  },

  async saveScore(subject, score, total) {
    const scores = await this.getScores();
    if (!scores[subject]) scores[subject] = [];
    scores[subject].push({ score, total, date: new Date().toISOString() });
    if (scores[subject].length > 10) scores[subject].shift();
    await AsyncStorage.setItem(KEYS.SCORES, JSON.stringify(scores));
  },

  async getScores() {
    const val = await AsyncStorage.getItem(KEYS.SCORES);
    return val ? JSON.parse(val) : {};
  },

  async getBestScore(subject) {
    const scores = await this.getScores();
    if (!scores[subject] || scores[subject].length === 0) return null;
    return Math.max(...scores[subject].map((s) => s.score));
  },

  // --- Daily question limit (free tier) ---

  async getDailyQuestionsAnswered() {
    const date = await AsyncStorage.getItem(KEYS.DAILY_Q_DATE);
    const today = new Date().toDateString();
    if (date !== today) return 0;
    const count = await AsyncStorage.getItem(KEYS.DAILY_Q_COUNT);
    return parseInt(count) || 0;
  },

  async getClaimedRewards() {
    const val = await AsyncStorage.getItem(KEYS.CLAIMED_REWARDS);
    return val ? JSON.parse(val) : [];
  },

  async isDailyChallengePlayedToday() {
    const date = await AsyncStorage.getItem(KEYS.DAILY_CHALLENGE_DATE);
    return date === new Date().toDateString();
  },

  async markDailyChallengePlayedToday() {
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE_DATE, new Date().toDateString());
  },

  async claimReward(rewardId) {
    const claimed = await this.getClaimedRewards();
    if (!claimed.includes(rewardId)) {
      claimed.push(rewardId);
      await AsyncStorage.setItem(KEYS.CLAIMED_REWARDS, JSON.stringify(claimed));
    }
  },

  async incrementDailyQuestionsAnswered() {
    const today = new Date().toDateString();
    const date = await AsyncStorage.getItem(KEYS.DAILY_Q_DATE);
    let count = 0;
    if (date === today) {
      const c = await AsyncStorage.getItem(KEYS.DAILY_Q_COUNT);
      count = parseInt(c) || 0;
    }
    count += 1;
    await AsyncStorage.setItem(KEYS.DAILY_Q_DATE, today);
    await AsyncStorage.setItem(KEYS.DAILY_Q_COUNT, String(count));
    return count;
  },
};

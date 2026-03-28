import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { COLORS, SIZES, RADIUS, SUBJECTS } from '../utils/theme';

function getMessage(score, total) {
  const pct = score / total;
  if (pct === 1)   return { title: 'Perfect Score! 🏆', sub: 'You are a superstar champion!' };
  if (pct >= 0.8)  return { title: 'Excellent! 🌟',    sub: 'Amazing work, keep it up!' };
  if (pct >= 0.6)  return { title: 'Good Job! 👍',     sub: 'You are doing great!' };
  if (pct >= 0.4)  return { title: 'Keep Trying! 💪',  sub: 'Practice makes perfect!' };
  return           { title: "Don't Give Up! 🌈",        sub: 'Every expert was once a beginner!' };
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ResultScreen({ route, navigation }) {
  const { score, total, stars, subjectKey, color } = route.params || {};
  const isDaily = subjectKey === 'mixed';
  const subject = SUBJECTS.find((s) => s.key === subjectKey);
  const { title, sub } = getMessage(score, total);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  const [countdown, setCountdown] = useState(getTimeUntilMidnight());

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
      Animated.timing(starsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  // Live countdown for daily challenge
  useEffect(() => {
    if (!isDaily) return;
    const interval = setInterval(() => setCountdown(getTimeUntilMidnight()), 1000);
    return () => clearInterval(interval);
  }, [isDaily]);

  const pct = score / total;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: color || COLORS.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={color || COLORS.primary} />

      <View style={styles.container}>
        <Text style={styles.topLabel}>
          {subject ? `${subject.emoji} ${subject.label}` : '🎯 Daily Challenge'}
        </Text>

        <Animated.View style={[styles.circleWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.circle}>
            <Text style={styles.scoreNum}>{score}</Text>
            <Text style={styles.scoreOf}>out of {total}</Text>
          </View>
        </Animated.View>

        <Text style={styles.msgTitle}>{title}</Text>
        <Text style={styles.msgSub}>{sub}</Text>

        <Animated.View style={[styles.starsBanner, { opacity: starsAnim }]}>
          <Text style={styles.starsText}>⭐ +{stars} stars earned!</Text>
        </Animated.View>

        {/* Next Daily Challenge countdown */}
        {isDaily && (
          <Animated.View style={[styles.nextChallengeBox, { opacity: starsAnim }]}>
            <Text style={styles.nextChallengeLabel}>🎯 Next Daily Challenge in</Text>
            <Text style={styles.countdownText}>{countdown}</Text>
            <Text style={styles.nextChallengeHint}>Come back tomorrow for a new challenge!</Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{score}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{total - score}</Text>
            <Text style={styles.statLabel}>Wrong</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{Math.round(pct * 100)}%</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.playAgainBtn}
            onPress={() => navigation.replace('Quiz', { subjectKey })}
          >
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  topLabel: {
    color: 'rgba(255,255,255,0.8)', fontSize: SIZES.sm,
    fontWeight: '700', marginBottom: 24, letterSpacing: 0.5,
  },
  circleWrap: { marginBottom: 20 },
  circle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 6, borderColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 56, fontWeight: '900', color: COLORS.white },
  scoreOf:  { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  msgTitle: { fontSize: SIZES.xxl, fontWeight: '900', color: COLORS.white, textAlign: 'center', marginBottom: 6 },
  msgSub:   { fontSize: SIZES.base, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24, fontWeight: '500' },

  starsBanner: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: RADIUS.full, marginBottom: 24,
  },
  starsText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '800' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32, width: '100%' },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md, padding: 14, alignItems: 'center',
  },
  statNum:   { fontSize: SIZES.xl,  fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },

  nextChallengeBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  nextChallengeLabel: { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.sm, fontWeight: '700' },
  countdownText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 3,
    fontVariant: ['tabular-nums'],
  },
  nextChallengeHint: { color: 'rgba(255,255,255,0.65)', fontSize: SIZES.xs, fontWeight: '500', textAlign: 'center' },

  buttons:      { width: '100%', gap: 12 },
  playAgainBtn: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center',
  },
  playAgainText: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary },
  homeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  homeBtnText: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.white },
});

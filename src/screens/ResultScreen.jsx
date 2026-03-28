import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, Modal,
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

  const [countdown, setCountdown]       = useState(getTimeUntilMidnight());
  const [showModal, setShowModal]       = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
      Animated.timing(starsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

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

          {/* Daily challenge: show Next Challenge button with timer */}
          {isDaily ? (
            <TouchableOpacity
              style={styles.nextChallengeBtn}
              onPress={() => setShowModal(true)}
              activeOpacity={0.88}
            >
              <View style={styles.nextChallengeBtnInner}>
                <Text style={styles.nextChallengeBtnIcon}>⏰</Text>
                <View>
                  <Text style={styles.nextChallengeBtnTitle}>Next Challenge</Text>
                  <Text style={styles.nextChallengeBtnTimer}>{countdown}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.playAgainBtn}
              onPress={() => navigation.replace('Quiz', { subjectKey })}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Countdown popup modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>⏰</Text>
            <Text style={styles.modalTitle}>See You Tomorrow!</Text>
            <Text style={styles.modalSub}>Next daily challenge starts in:</Text>
            <View style={styles.modalTimerBox}>
              <Text style={styles.modalCountdown}>{countdown}</Text>
            </View>
            <Text style={styles.modalHint}>A fresh new challenge waits for you! 🎯</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.modalBtnText}>OK, Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderRadius: RADIUS.full, marginBottom: 20,
  },
  starsText: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '800' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.md, padding: 14, alignItems: 'center',
  },
  statNum:   { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },

  buttons: { width: '100%', gap: 12 },

  // Next challenge button (daily)
  nextChallengeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg, paddingVertical: 14, paddingHorizontal: 20,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  nextChallengeBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  nextChallengeBtnIcon:  { fontSize: 28 },
  nextChallengeBtnTitle: { color: 'rgba(255,255,255,0.85)', fontSize: SIZES.sm, fontWeight: '700' },
  nextChallengeBtnTimer: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '900', letterSpacing: 2 },

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

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderRadius: 28,
    padding: 28, alignItems: 'center', width: '82%', gap: 10,
  },
  modalEmoji: { fontSize: 52 },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '900', color: COLORS.primary },
  modalSub:   { fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
  modalTimerBox: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md,
    paddingHorizontal: 24, paddingVertical: 12,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  modalCountdown: { fontSize: 38, fontWeight: '900', color: COLORS.primary, letterSpacing: 3 },
  modalHint:  { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center' },
  modalBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingHorizontal: 32, paddingVertical: 12, marginTop: 4,
  },
  modalBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '800' },
});

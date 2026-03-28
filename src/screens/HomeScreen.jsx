import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, RADIUS } from '../utils/theme';
import { Storage } from '../utils/storage';
import { SUBJECTS } from '../utils/theme';
import { REWARDS } from '../data/rewards';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [totalStars, setTotalStars]       = useState(0);
  const [streak, setStreak]               = useState(0);
  const [scores, setScores]               = useState({});
  const [claimedRewards, setClaimedRewards] = useState([]);

  useFocusEffect(
    useCallback(() => { loadStats(); }, [])
  );

  const loadStats = async () => {
    const [stars, str, sc, claimed] = await Promise.all([
      Storage.getTotalStars(),
      Storage.getStreak(),
      Storage.getScores(),
      Storage.getClaimedRewards(),
    ]);
    setTotalStars(stars);
    setStreak(str);
    setScores(sc);
    setClaimedRewards(claimed);
  };

  const getBestScore = (subjectKey) => {
    const s = scores[subjectKey];
    if (!s || s.length === 0) return null;
    return Math.max(...s.map((x) => x.score));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Champion! 👋</Text>
            <Text style={styles.title}>Kids Daily Quiz</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakNum}>{streak}</Text>
            <Text style={styles.streakLabel}>streak</Text>
          </View>
        </View>

        {/* Stars Banner */}
        <View style={styles.starsBanner}>
          <View style={styles.starsLeft}>
            <Text style={styles.starsEmoji}>⭐</Text>
            <View>
              <Text style={styles.starsNum}>{totalStars}</Text>
              <Text style={styles.starsLabel}>Total Stars Earned</Text>
            </View>
          </View>
          <View>
            <Text style={styles.starsHint}>Keep learning{'\n'}to earn more!</Text>
          </View>
        </View>

        {/* Earned Badges Row */}
        {claimedRewards.length > 0 && (
          <View style={styles.badgesWrap}>
            <View style={styles.badgesHeader}>
              <Text style={styles.badgesTitle}>My Badges</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Rewards')}>
                <Text style={styles.badgesSeeAll}>See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
              {REWARDS.filter((r) => claimedRewards.includes(r.id)).map((reward) => (
                <View key={reward.id} style={[styles.badgeItem, { borderColor: reward.color }]}>
                  <Text style={styles.badgeEmoji}>{reward.emoji}</Text>
                  <Text style={styles.badgeName}>{reward.title}</Text>
                </View>
              ))}
              {REWARDS.filter((r) => totalStars >= r.stars && !claimedRewards.includes(r.id)).slice(0, 1).map((reward) => (
                <TouchableOpacity
                  key={reward.id + '_new'}
                  style={[styles.badgeItem, styles.badgeItemNew, { borderColor: reward.color }]}
                  onPress={() => navigation.navigate('Rewards')}
                >
                  <Text style={styles.badgeEmoji}>{reward.emoji}</Text>
                  <Text style={styles.badgeNew}>Claim!</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Subject Cards */}
        <Text style={styles.sectionTitle}>Choose a Subject</Text>
        <View style={styles.subjectsGrid}>
          {SUBJECTS.map((subject) => {
            const best = getBestScore(subject.key);
            return (
              <TouchableOpacity
                key={subject.key}
                style={[styles.subjectCard, { backgroundColor: subject.color }]}
                onPress={() => navigation.navigate('Quiz', { subjectKey: subject.key })}
                activeOpacity={0.85}
              >
                <Text style={styles.subjectEmoji}>{subject.emoji}</Text>
                <Text style={styles.subjectLabel}>{subject.shortLabel}</Text>
                <Text style={styles.subjectDesc}>{subject.description}</Text>
                {best !== null && (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestText}>Best: {best}/10</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Rewards Button */}
        <TouchableOpacity
          style={styles.rewardsBtn}
          onPress={() => navigation.navigate('Rewards')}
          activeOpacity={0.88}
        >
          <Text style={styles.rewardsEmoji}>🏆</Text>
          <View style={styles.rewardsBtnText}>
            <Text style={styles.rewardsBtnTitle}>My Rewards</Text>
            <Text style={styles.rewardsBtnSub}>Collect stars and unlock prizes!</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* Daily Challenge Button */}
        <TouchableOpacity
          style={styles.dailyBtn}
          onPress={() => navigation.navigate('Quiz', { subjectKey: 'mixed', daily: true })}
          activeOpacity={0.88}
        >
          <Text style={styles.dailyEmoji}>🎯</Text>
          <View style={styles.dailyText}>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailySub}>Mix of all subjects • Earn bonus stars!</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>

        {/* How to play */}
        <View style={styles.howTo}>
          <Text style={styles.howTitle}>How to play</Text>
          <View style={styles.howRow}>
            <Text style={styles.howStep}>1. Pick a subject</Text>
            <Text style={styles.howStep}>2. Answer 10 questions</Text>
            <Text style={styles.howStep}>3. Earn ⭐ for correct answers</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const cardW = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.primary },
  scroll:    { flex: 1, backgroundColor: COLORS.offWhite },
  container: { paddingBottom: 40 },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  greeting: { color: COLORS.primaryMid, fontSize: SIZES.sm, fontWeight: '500' },
  title:    { color: COLORS.white, fontSize: SIZES.xxl, fontWeight: '800', marginTop: 2 },

  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center',
  },
  streakFire:  { fontSize: 20 },
  streakNum:   { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '800' },
  streakLabel: { color: COLORS.primaryMid, fontSize: SIZES.xs, fontWeight: '500' },

  starsBanner: {
    backgroundColor: COLORS.white, margin: 16, marginTop: 20,
    borderRadius: RADIUS.lg, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  starsLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  starsEmoji: { fontSize: 36 },
  starsNum:   { fontSize: SIZES.xxxl, fontWeight: '800', color: COLORS.primary },
  starsLabel: { fontSize: SIZES.sm, color: COLORS.textMuted, fontWeight: '500' },
  starsHint:  { fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'right', lineHeight: 20 },

  badgesWrap: { marginHorizontal: 16, marginBottom: 12 },
  badgesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgesTitle:  { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.text },
  badgesSeeAll: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.primary },
  badgesRow:    { gap: 10, paddingRight: 4 },
  badgeItem: {
    alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 2, minWidth: 72,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  badgeItemNew: { backgroundColor: '#FFFDE7' },
  badgeEmoji:   { fontSize: 28, marginBottom: 4 },
  badgeName:    { fontSize: 10, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  badgeNew:     { fontSize: 10, fontWeight: '800', color: '#E65100', textAlign: 'center' },

  sectionTitle: {
    fontSize: SIZES.base, fontWeight: '700', color: COLORS.text,
    paddingHorizontal: 20, marginBottom: 12, marginTop: 4,
  },
  subjectsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12, marginBottom: 16,
  },
  subjectCard: {
    width: cardW, borderRadius: RADIUS.lg,
    padding: 18, minHeight: 140, justifyContent: 'space-between',
  },
  subjectEmoji: { fontSize: 36, marginBottom: 4 },
  subjectLabel: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '800' },
  subjectDesc:  { color: 'rgba(255,255,255,0.75)', fontSize: SIZES.xs, fontWeight: '500', marginTop: 2 },
  bestBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 8,
  },
  bestText: { color: COLORS.white, fontSize: SIZES.xs, fontWeight: '700' },

  rewardsBtn: {
    backgroundColor: '#FFF8E1', marginHorizontal: 16, borderRadius: RADIUS.lg,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 12, borderWidth: 2, borderColor: '#FFD700', elevation: 2,
  },
  rewardsEmoji:    { fontSize: 32 },
  rewardsBtnText:  { flex: 1 },
  rewardsBtnTitle: { fontSize: SIZES.base, fontWeight: '800', color: '#7B5800' },
  rewardsBtnSub:   { fontSize: SIZES.xs, color: '#A07820', marginTop: 2 },

  dailyBtn: {
    backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: RADIUS.lg,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 20, shadowColor: COLORS.primary, shadowOpacity: 0.08,
    shadowRadius: 12, elevation: 3, borderWidth: 2, borderColor: COLORS.primaryLight,
  },
  dailyEmoji: { fontSize: 32 },
  dailyText:  { flex: 1 },
  dailyTitle: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.primary },
  dailySub:   { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  arrow:      { fontSize: SIZES.xl, color: COLORS.primary, fontWeight: '700' },

  howTo: {
    backgroundColor: COLORS.primaryLight, marginHorizontal: 16,
    borderRadius: RADIUS.lg, padding: 16,
  },
  howTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  howRow:   { gap: 6 },
  howStep:  { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '500' },
});

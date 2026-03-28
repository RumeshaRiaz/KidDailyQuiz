import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, StatusBar, Dimensions, Modal, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
let BannerAd = null, BannerAdSize = null, TestIds = null;
try {
  const admob = require('react-native-google-mobile-ads');
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
} catch {}
import { COLORS, SIZES, RADIUS } from '../utils/theme';
import { Storage } from '../utils/storage';
import { SUBJECTS } from '../utils/theme';
import { useSubscription, FREE_DAILY_LIMIT } from '../context/SubscriptionContext';
import { REWARDS } from '../data/rewards';

const { width } = Dimensions.get('window');

const BANNER_AD_UNIT_ID = TestIds
  ? (__DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX')
  : null;

export default function HomeScreen({ navigation }) {
  const [totalStars, setTotalStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [scores, setScores] = useState({});
  const [dailyUsed, setDailyUsed] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isPremium, purchasePremium, restorePurchases, isLoading } = useSubscription();

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const [stars, str, sc, daily, claimed] = await Promise.all([
      Storage.getTotalStars(),
      Storage.getStreak(),
      Storage.getScores(),
      Storage.getDailyQuestionsAnswered(),
      Storage.getClaimedRewards(),
    ]);
    setTotalStars(stars);
    setStreak(str);
    setScores(sc);
    setDailyUsed(daily);
    setClaimedRewards(claimed);
  };

  const getBestScore = (subjectKey) => {
    const s = scores[subjectKey];
    if (!s || s.length === 0) return null;
    return Math.max(...s.map((x) => x.score));
  };

  const handleStartQuiz = (subjectKey, daily = false) => {
    if (!isPremium && dailyUsed >= FREE_DAILY_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }
    navigation.navigate('Quiz', { subjectKey, daily });
  };

  const handlePurchase = async () => {
    setShowUpgradeModal(false);
    const success = await purchasePremium();
    if (success) Alert.alert('Welcome to Premium! 🎉', 'Enjoy unlimited quizzes with no ads!');
  };

  const questionsLeft = Math.max(0, FREE_DAILY_LIMIT - dailyUsed);

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
          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakLabel}>streak</Text>
            </View>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ PRO</Text>
              </View>
            )}
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
          <View style={styles.starsRight}>
            {isPremium ? (
              <Text style={styles.starsHint}>Premium{'\n'}Unlimited ✨</Text>
            ) : (
              <Text style={styles.starsHint}>{questionsLeft}/{FREE_DAILY_LIMIT} questions{'\n'}left today</Text>
            )}
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
              {/* Teaser: next unclaimed unlocked reward */}
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

        {/* Free tier progress bar */}
        {!isPremium && (
          <View style={styles.limitWrap}>
            <View style={styles.limitTrack}>
              <View style={[styles.limitFill, { width: `${Math.min(100, (dailyUsed / FREE_DAILY_LIMIT) * 100)}%` }]} />
            </View>
            <TouchableOpacity onPress={() => setShowUpgradeModal(true)} style={styles.upgradePill}>
              <Text style={styles.upgradePillText}>Go Premium 👑</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Subject Cards */}
        <Text style={styles.sectionTitle}>Choose a Subject</Text>
        <View style={styles.subjectsGrid}>
          {SUBJECTS.map((subject) => {
            const best = getBestScore(subject.key);
            const locked = !isPremium && dailyUsed >= FREE_DAILY_LIMIT;
            return (
              <TouchableOpacity
                key={subject.key}
                style={[styles.subjectCard, { backgroundColor: subject.color }, locked && styles.cardLocked]}
                onPress={() => handleStartQuiz(subject.key)}
                activeOpacity={0.85}
              >
                <Text style={styles.subjectEmoji}>{locked ? '🔒' : subject.emoji}</Text>
                <Text style={styles.subjectLabel}>{subject.shortLabel}</Text>
                <Text style={styles.subjectDesc}>{subject.description}</Text>
                {best !== null && !locked && (
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
          <Text style={styles.dailyArrow}>→</Text>
        </TouchableOpacity>

        {/* Daily Challenge Button */}
        <TouchableOpacity
          style={styles.dailyBtn}
          onPress={() => handleStartQuiz('mixed', true)}
          activeOpacity={0.88}
        >
          <Text style={styles.dailyEmoji}>🎯</Text>
          <View style={styles.dailyText}>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailySub}>Mix of all subjects • Earn bonus stars!</Text>
          </View>
          <Text style={styles.dailyArrow}>→</Text>
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

      {/* Banner Ad — free users only, requires EAS build */}
      {!isPremium && !isLoading && BannerAd && BannerAdSize && (
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      )}

      {/* Upgrade Modal */}
      <Modal visible={showUpgradeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>👑</Text>
            <Text style={styles.modalTitle}>Go Premium!</Text>
            <Text style={styles.modalSub}>
              You've used all {FREE_DAILY_LIMIT} free questions today.{'\n'}
              Upgrade for unlimited quizzes & no ads!
            </Text>

            <View style={styles.planRow}>
              <Text style={styles.planIcon}>🆓</Text>
              <View style={styles.planText}>
                <Text style={styles.planName}>Free</Text>
                <Text style={styles.planDesc}>{FREE_DAILY_LIMIT} questions/day • with ads</Text>
              </View>
            </View>
            <View style={[styles.planRow, styles.planRowPremium]}>
              <Text style={styles.planIcon}>⭐</Text>
              <View style={styles.planText}>
                <Text style={[styles.planName, { color: COLORS.primary }]}>Premium</Text>
                <Text style={styles.planDesc}>Unlimited • No ads • $2.99/month</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase}>
              <Text style={styles.buyBtnText}>Subscribe — $2.99/month</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restoreBtn} onPress={() => { setShowUpgradeModal(false); restorePurchases(); }}>
              <Text style={styles.restoreBtnText}>Restore Purchase</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowUpgradeModal(false)}>
              <Text style={styles.dismissText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const cardW = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.primary },
  scroll: { flex: 1, backgroundColor: COLORS.offWhite },
  container: { paddingBottom: 40 },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: { color: COLORS.primaryMid, fontSize: SIZES.sm, fontWeight: '500' },
  title: { color: COLORS.white, fontSize: SIZES.xxl, fontWeight: '800', marginTop: 2 },
  headerRight: { alignItems: 'flex-end', gap: 6 },

  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  streakFire: { fontSize: 20 },
  streakNum: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '800' },
  streakLabel: { color: COLORS.primaryMid, fontSize: SIZES.xs, fontWeight: '500' },

  premiumBadge: {
    backgroundColor: '#FFD700',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadgeText: { fontSize: SIZES.xs, fontWeight: '800', color: '#7B5800' },

  starsBanner: {
    backgroundColor: COLORS.white,
    margin: 16,
    marginTop: 20,
    borderRadius: RADIUS.lg,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  starsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  starsEmoji: { fontSize: 36 },
  starsNum: { fontSize: SIZES.xxxl, fontWeight: '800', color: COLORS.primary },
  starsLabel: { fontSize: SIZES.sm, color: COLORS.textMuted, fontWeight: '500' },
  starsRight: {},
  starsHint: { fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'right', lineHeight: 20 },

  badgesWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: -4,
  },
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgesTitle: { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.text },
  badgesSeeAll: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.primary },
  badgesRow: { gap: 10, paddingRight: 4 },
  badgeItem: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    minWidth: 72,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeItemNew: {
    backgroundColor: '#FFFDE7',
  },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeName: { fontSize: 10, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  badgeNew: { fontSize: 10, fontWeight: '800', color: '#E65100', textAlign: 'center' },

  limitWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
    marginTop: -4,
  },
  limitTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  limitFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  upgradePill: {
    backgroundColor: '#FFD700',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  upgradePillText: { fontSize: SIZES.xs, fontWeight: '800', color: '#7B5800' },

  sectionTitle: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  subjectCard: {
    width: cardW,
    borderRadius: RADIUS.lg,
    padding: 18,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardLocked: { opacity: 0.55 },
  subjectEmoji: { fontSize: 36, marginBottom: 4 },
  subjectLabel: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '800' },
  subjectDesc: { color: 'rgba(255,255,255,0.75)', fontSize: SIZES.xs, fontWeight: '500', marginTop: 2 },
  bestBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bestText: { color: COLORS.white, fontSize: SIZES.xs, fontWeight: '700' },

  rewardsBtn: {
    backgroundColor: '#FFF8E1',
    marginHorizontal: 16,
    borderRadius: RADIUS.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 2,
  },
  rewardsEmoji: { fontSize: 32 },
  rewardsBtnText: { flex: 1 },
  rewardsBtnTitle: { fontSize: SIZES.base, fontWeight: '800', color: '#7B5800' },
  rewardsBtnSub: { fontSize: SIZES.xs, color: '#A07820', marginTop: 2 },

  dailyBtn: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: RADIUS.lg,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  dailyEmoji: { fontSize: 32 },
  dailyText: { flex: 1 },
  dailyTitle: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.primary },
  dailySub: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  dailyArrow: { fontSize: SIZES.xl, color: COLORS.primary, fontWeight: '700' },

  howTo: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: 16,
    borderRadius: RADIUS.lg,
    padding: 16,
  },
  howTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primaryDark, marginBottom: 8 },
  howRow: { gap: 6 },
  howStep: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '500' },

  // Upgrade Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  modalEmoji: { fontSize: 48 },
  modalTitle: { fontSize: SIZES.xxl, fontWeight: '900', color: COLORS.primary },
  modalSub: { fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },

  planRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.offWhite,
    borderRadius: RADIUS.md,
    padding: 14,
  },
  planRowPremium: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  planIcon: { fontSize: 24 },
  planText: { flex: 1 },
  planName: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.text },
  planDesc: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },

  buyBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buyBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '800' },
  restoreBtn: { width: '100%', alignItems: 'center', paddingVertical: 10 },
  restoreBtnText: { color: COLORS.primary, fontSize: SIZES.sm, fontWeight: '600' },
  dismissText: { color: COLORS.textMuted, fontSize: SIZES.sm, paddingVertical: 8 },
});

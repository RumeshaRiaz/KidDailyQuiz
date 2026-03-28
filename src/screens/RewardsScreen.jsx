import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, Animated, Modal, Dimensions,
} from 'react-native';
import { COLORS, SIZES, RADIUS } from '../utils/theme';
import { Storage } from '../utils/storage';
import { REWARDS } from '../data/rewards';
import { SoundManager } from '../utils/sounds';

const { width } = Dimensions.get('window');

export default function RewardsScreen({ navigation }) {
  const [totalStars, setTotalStars] = useState(0);
  const [claimed, setClaimed]       = useState([]);
  const [celebrating, setCelebrating] = useState(null); // reward being celebrated

  const popAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [stars, claimedList] = await Promise.all([
      Storage.getTotalStars(),
      Storage.getClaimedRewards(),
    ]);
    setTotalStars(stars);
    setClaimed(claimedList);
  };

  const handleClaim = async (reward) => {
    await Storage.claimReward(reward.id);
    setClaimed((prev) => [...prev, reward.id]);
    setCelebrating(reward);
    await SoundManager.init();
    SoundManager.play('start');

    popAnim.setValue(0);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(popAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 5 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const closeCelebration = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setCelebrating(null);
    });
  };

  const unlocked   = REWARDS.filter((r) => totalStars >= r.stars);
  const locked     = REWARDS.filter((r) => totalStars < r.stars);
  const nextReward = locked[0];
  const progress   = nextReward
    ? Math.min(1, totalStars / nextReward.stars)
    : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rewards 🏆</Text>
        <View style={styles.starsChip}>
          <Text style={styles.starsChipText}>⭐ {totalStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Next reward progress */}
        {nextReward && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>Next Reward</Text>
            <View style={styles.nextRow}>
              <Text style={styles.nextEmoji}>{nextReward.emoji}</Text>
              <View style={styles.nextInfo}>
                <Text style={styles.nextTitle}>{nextReward.title}</Text>
                <Text style={styles.nextStars}>{totalStars} / {nextReward.stars} ⭐</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Unlocked rewards */}
        {unlocked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Unlocked 🔓</Text>
            {unlocked.map((reward) => {
              const isClaimed = claimed.includes(reward.id);
              return (
                <View key={reward.id} style={[styles.rewardCard, isClaimed && styles.rewardCardClaimed]}>
                  <View style={[styles.rewardIcon, { backgroundColor: reward.color + '22' }]}>
                    <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                  </View>
                  <View style={styles.rewardInfo}>
                    <View style={styles.rewardTitleRow}>
                      <Text style={styles.rewardTitle}>{reward.title}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: reward.color + '33' }]}>
                        <Text style={[styles.categoryText, { color: reward.color }]}>{reward.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.rewardDesc}>{reward.desc}</Text>
                    <Text style={styles.rewardStarsReq}>Required: {reward.stars} ⭐</Text>
                  </View>
                  {isClaimed ? (
                    <View style={styles.claimedBadge}>
                      <Text style={styles.claimedText}>✓</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.claimBtn, { backgroundColor: reward.color }]}
                      onPress={() => handleClaim(reward)}
                    >
                      <Text style={styles.claimBtnText}>Claim!</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* Locked rewards */}
        {locked.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Coming Up 🔒</Text>
            {locked.map((reward) => (
              <View key={reward.id} style={styles.rewardCardLocked}>
                <View style={[styles.rewardIconLocked, { backgroundColor: reward.color + '22' }]}>
                  <Text style={styles.rewardEmojiLocked}>{reward.emoji}</Text>
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockOverlayText}>🔒</Text>
                  </View>
                </View>
                <View style={styles.rewardInfo}>
                  <View style={styles.rewardTitleRow}>
                    <Text style={styles.rewardTitleLocked}>{reward.title}</Text>
                    <View style={[styles.categoryBadge, { backgroundColor: '#E0E0E0' }]}>
                      <Text style={[styles.categoryText, { color: '#999' }]}>{reward.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.rewardDescLocked}>{reward.desc}</Text>
                  <Text style={styles.rewardDescLocked}>Requires {reward.stars} ⭐ stars</Text>
                  <View style={styles.needMoreRow}>
                    <Text style={styles.rewardNeedMore}>
                      {reward.stars - totalStars} more stars needed!
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {unlocked.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyTitle}>Play quizzes and earn stars!</Text>
            <Text style={styles.emptySub}>First reward at just 50 stars!</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Celebration Modal */}
      {celebrating && (
        <Modal transparent visible={!!celebrating} animationType="none">
          <Animated.View style={[styles.celebOverlay, { opacity: fadeAnim }]}>
            <Animated.View
              style={[
                styles.celebCard,
                { transform: [{ scale: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] },
              ]}
            >
              <Text style={styles.celebEmoji}>{celebrating.emoji}</Text>
              <Text style={styles.celebTitle}>Congratulations! 🎉</Text>
              <Text style={styles.celebReward}>{celebrating.title}</Text>
              <Text style={styles.celebDesc}>{celebrating.desc}</Text>
              <Text style={styles.confetti}>🎊 🎈 🎊 🎈 🎊</Text>
              <TouchableOpacity style={styles.celebBtn} onPress={closeCelebration}>
                <Text style={styles.celebBtnText}>Awesome! 😊</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.offWhite },

  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: COLORS.white, fontSize: SIZES.xl, fontWeight: '700' },
  headerTitle: { color: COLORS.white, fontSize: SIZES.lg, fontWeight: '800' },
  starsChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  starsChipText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '700' },

  container: { padding: 16 },

  nextCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  nextLabel: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  nextEmoji: { fontSize: 40 },
  nextInfo: { flex: 1 },
  nextTitle: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.text },
  nextStars: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2, marginBottom: 6 },
  progressTrack: {
    height: 8, backgroundColor: '#E0E0E0',
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  sectionTitle: {
    fontSize: SIZES.base, fontWeight: '800',
    color: COLORS.text, marginBottom: 10, marginTop: 4,
  },

  rewardCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardCardClaimed: { opacity: 0.75 },
  rewardIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  rewardEmoji: { fontSize: 30 },
  rewardInfo: { flex: 1 },
  rewardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  rewardTitle: { fontSize: SIZES.base, fontWeight: '800', color: COLORS.text },
  categoryBadge: { borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 2 },
  categoryText: { fontSize: 10, fontWeight: '700' },
  rewardDesc: { fontSize: SIZES.xs, color: COLORS.textMuted, marginBottom: 2 },
  rewardStarsReq: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '600' },

  claimBtn: {
    borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  claimBtnText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '800' },
  claimedBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },
  claimedText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '800' },

  rewardCardLocked: {
    backgroundColor: '#F8F8F8',
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    opacity: 0.85,
  },
  rewardIconLocked: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  rewardEmojiLocked: { fontSize: 28, opacity: 0.35 },
  lockOverlay: {
    position: 'absolute',
    bottom: -4, right: -4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  lockOverlayText: { fontSize: 11 },
  rewardTitleLocked: { fontSize: SIZES.base, fontWeight: '700', color: '#AAAAAA' },
  rewardDescLocked: { fontSize: SIZES.xs, color: '#BBBBBB', marginTop: 1 },
  needMoreRow: { marginTop: 4 },
  rewardNeedMore: { fontSize: SIZES.xs, color: COLORS.warning, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  emptySub: { fontSize: SIZES.sm, color: COLORS.textMuted, marginTop: 6 },

  // Celebration modal
  celebOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  celebCard: {
    backgroundColor: COLORS.white,
    borderRadius: 28, padding: 32,
    alignItems: 'center', width: width * 0.82,
    gap: 8,
  },
  celebEmoji: { fontSize: 72 },
  celebTitle: { fontSize: SIZES.xxl, fontWeight: '900', color: COLORS.primary },
  celebReward: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  celebDesc: { fontSize: SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
  confetti: { fontSize: 24, letterSpacing: 4, marginVertical: 4 },
  celebBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 32, paddingVertical: 14,
    marginTop: 8,
  },
  celebBtnText: { color: COLORS.white, fontSize: SIZES.base, fontWeight: '800' },
});

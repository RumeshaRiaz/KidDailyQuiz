import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, Dimensions,
} from 'react-native';
import { COLORS, SIZES, RADIUS, SUBJECTS } from '../utils/theme';
import { getRandomQuestions, questions } from '../data/questions';
import { Storage } from '../utils/storage';
import { SoundManager } from '../utils/sounds';

const { width } = Dimensions.get('window');
const TOTAL_QUESTIONS = 10;
const QUESTION_TIME   = 20;

function getMixedQuestions() {
  const allKeys = ['math', 'science', 'english', 'gk'];
  let pool = [];
  allKeys.forEach((key) => {
    const shuffled = [...questions[key]].sort(() => Math.random() - 0.5);
    pool = pool.concat(shuffled.slice(0, 3));
  });
  return pool.sort(() => Math.random() - 0.5).slice(0, TOTAL_QUESTIONS);
}

export default function QuizScreen({ route, navigation }) {
  const { subjectKey, daily } = route.params || {};
  const isMixed = subjectKey === 'mixed' || daily;

  const subject = SUBJECTS.find((s) => s.key === subjectKey) || SUBJECTS[0];
  const color   = isMixed ? COLORS.primary : subject.color;

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore]       = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answered, setAnswered] = useState(false);

  const progressAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim     = useRef(new Animated.Value(1)).current;
  const shakeAnim    = useRef(new Animated.Value(0)).current;
  const timerRef     = useRef(null);

  useEffect(() => {
    const qs = isMixed ? getMixedQuestions() : getRandomQuestions(subjectKey, TOTAL_QUESTIONS);
    setQuizQuestions(qs);

    const setup = async () => {
      await SoundManager.init();
      await SoundManager.play('start');
      await SoundManager.startBackground();
    };
    setup();

    return () => {
      clearInterval(timerRef.current);
      SoundManager.stopBackground();
      SoundManager.unloadAll();
    };
  }, []);

  useEffect(() => {
    if (quizQuestions.length === 0) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [current, quizQuestions]);

  const startTimer = () => {
    setTimeLeft(QUESTION_TIME);
    clearInterval(timerRef.current);
    Animated.timing(progressAnim, { toValue: 1, duration: 0, useNativeDriver: false }).start();
    Animated.timing(progressAnim, { toValue: 0, duration: QUESTION_TIME * 1000, useNativeDriver: false }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!answered) handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setAnswered(true);
    setSelected('__timeout__');
    SoundManager.play('wrong');
    setTimeout(() => goNext(), 1500);
  };

  const handleSelect = (option) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelected(option);

    const isCorrect = option === quizQuestions[current].answer;
    if (isCorrect) {
      setScore((s) => s + 1);
      SoundManager.play('correct');
    } else {
      SoundManager.play('wrong');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10,  duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6,   duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => goNext(), 1200);
  };

  const goNext = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(async () => {
      if (current + 1 >= TOTAL_QUESTIONS || current + 1 >= quizQuestions.length) {
        const finalScore = score + (selected === quizQuestions[current]?.answer ? 1 : 0);
        const stars = finalScore * 10;
        await Storage.addStars(stars);
        await Storage.updateStreak();
        await Storage.saveScore(isMixed ? 'mixed' : subjectKey, finalScore, TOTAL_QUESTIONS);

        navigation.replace('Result', {
          score: finalScore,
          total: TOTAL_QUESTIONS,
          stars,
          subjectKey: isMixed ? 'mixed' : subjectKey,
          color,
        });
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setAnswered(false);
        fadeAnim.setValue(1);
      }
    });
  };

  if (quizQuestions.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: color }]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const q = quizQuestions[current];
  const timerColor = timeLeft > 10 ? COLORS.success : timeLeft > 5 ? COLORS.warning : COLORS.danger;

  const getOptionStyle = (option) => {
    if (!answered) return styles.option;
    if (option === q.answer) return [styles.option, styles.optionCorrect];
    if (option === selected && option !== q.answer) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDimmed];
  };

  const getOptionTextStyle = (option) => {
    if (!answered) return styles.optionText;
    if (option === q.answer) return [styles.optionText, styles.optionTextCorrect];
    if (option === selected && option !== q.answer) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDimmed];
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: color }]}>
      <StatusBar barStyle="light-content" backgroundColor={color} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topLabel}>
          {isMixed ? '🎯 Daily Challenge' : `${subject.emoji} ${subject.shortLabel}`}
        </Text>
        <View style={styles.scoreChip}>
          <Text style={styles.scoreChipText}>⭐ {score * 10}</Text>
        </View>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                backgroundColor: timerColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
      </View>
      <Text style={styles.questionCount}>{current + 1} / {TOTAL_QUESTIONS}</Text>

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.questionText}>{q.q}</Text>
        <View style={styles.optionsWrap}>
          {q.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={getOptionStyle(option)}
              onPress={() => handleSelect(option)}
              activeOpacity={answered ? 1 : 0.82}
              disabled={answered}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{['A', 'B', 'C', 'D'][idx]}</Text>
              </View>
              <Text style={getOptionTextStyle(option)}>{option}</Text>
              {answered && option === q.answer && <Text style={styles.checkmark}>✓</Text>}
              {answered && option === selected && option !== q.answer && <Text style={styles.crossmark}>✗</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.white, fontSize: SIZES.lg },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText:  { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700' },
  topLabel:  { color: COLORS.white, fontSize: SIZES.base, fontWeight: '700' },
  scoreChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full,
  },
  scoreChipText: { color: COLORS.white, fontSize: SIZES.sm, fontWeight: '700' },

  progressWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, gap: 10, marginBottom: 4,
  },
  progressTrack: {
    flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  progressFill:  { height: '100%', borderRadius: RADIUS.full },
  timerText:     { fontSize: SIZES.sm, fontWeight: '800', minWidth: 28 },
  questionCount: {
    color: 'rgba(255,255,255,0.7)', fontSize: SIZES.xs,
    fontWeight: '600', paddingHorizontal: 16, marginBottom: 16,
  },

  card: {
    flex: 1, backgroundColor: COLORS.white, marginHorizontal: 12,
    borderRadius: 28, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
  },
  questionText: {
    fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text,
    lineHeight: 32, marginBottom: 28, textAlign: 'center',
  },
  optionsWrap: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.lightGray, borderRadius: RADIUS.md,
    padding: 14, gap: 12, borderWidth: 2, borderColor: 'transparent',
  },
  optionCorrect: { backgroundColor: COLORS.greenLight, borderColor: COLORS.success },
  optionWrong:   { backgroundColor: '#FCEBEB', borderColor: COLORS.danger },
  optionDimmed:  { opacity: 0.45 },
  optionLetter: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  optionLetterText:  { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.text },
  optionText:        { flex: 1, fontSize: SIZES.base, fontWeight: '600', color: COLORS.text },
  optionTextCorrect: { color: COLORS.green },
  optionTextWrong:   { color: COLORS.danger },
  optionTextDimmed:  { color: COLORS.midGray },
  checkmark: { fontSize: SIZES.lg, color: COLORS.success, fontWeight: '800' },
  crossmark:  { fontSize: SIZES.lg, color: COLORS.danger,  fontWeight: '800' },
});

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';
import { COLORS, SIZES } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const STARS = ['⭐', '🌟', '✨', '💫', '⭐', '✨', '🌟', '💫', '⭐', '✨'];

export default function SplashScreen({ onFinish }) {
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(30)).current;
  const titleOpacity= useRef(new Animated.Value(0)).current;
  const subOpacity  = useRef(new Animated.Value(0)).current;
  const dotAnim     = useRef(new Animated.Value(0)).current;

  const starAnims = STARS.map(() => ({
    x:       useRef(new Animated.Value(Math.random() * width)).current,
    y:       useRef(new Animated.Value(-20)).current,
    opacity: useRef(new Animated.Value(0)).current,
    scale:   useRef(new Animated.Value(0.5 + Math.random() * 0.8)).current,
  }));

  useEffect(() => {
    // Falling stars
    starAnims.forEach((star, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.parallel([
            Animated.timing(star.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(star.y, { toValue: height + 20, duration: 2500 + Math.random() * 1000, useNativeDriver: true }),
          ]),
          Animated.timing(star.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    });

    // Logo entrance
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 5 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleY,       { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(subOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      // Loading dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ),
    ]).start(() => {
      setTimeout(() => onFinish(), 300);
    });
  }, []);

  const dot1Opacity = dotAnim.interpolate({ inputRange: [0, 0.33, 1], outputRange: [0.3, 1, 0.3] });
  const dot2Opacity = dotAnim.interpolate({ inputRange: [0, 0.5,  1], outputRange: [0.3, 1, 0.3] });
  const dot3Opacity = dotAnim.interpolate({ inputRange: [0, 0.66, 1], outputRange: [0.3, 1, 0.3] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Falling stars background */}
      {starAnims.map((star, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.fallingstar,
            {
              left:    star.x,
              opacity: star.opacity,
              transform: [{ translateY: star.y }, { scale: star.scale }],
            },
          ]}
        >
          {STARS[i]}
        </Animated.Text>
      ))}

      {/* Glow circle behind logo */}
      <View style={styles.glowCircle} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🧒</Text>
          <Text style={styles.logoEmoji2}>📚</Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ translateY: titleY }] },
        ]}
      >
        Kids Daily Quiz
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: subOpacity }]}>
        Learn • Play • Grow 🌱
      </Animated.Text>

      {/* Loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: subOpacity }]}>
        <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  fallingstar: {
    position: 'absolute',
    top: 0,
    fontSize: 22,
  },

  glowCircle: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  logoWrap: { marginBottom: 28 },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  logoEmoji:  { fontSize: 42 },
  logoEmoji2: { fontSize: 36, marginTop: 12 },

  title: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: SIZES.base,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 48,
  },

  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },
});

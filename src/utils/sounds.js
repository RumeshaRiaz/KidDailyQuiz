import { Audio } from 'expo-av';

const SOUNDS_ENABLED = true;

const loaded = {};
let bgSound = null;

export const SoundManager = {
  async init() {
    if (!SOUNDS_ENABLED) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const [c, w, s] = await Promise.all([
        Audio.Sound.createAsync(require('../../assets/correct.wav'), { volume: 0.8 }),
        Audio.Sound.createAsync(require('../../assets/wrong.wav'),   { volume: 0.8 }),
        Audio.Sound.createAsync(require('../../assets/start.wav'),   { volume: 0.9 }),
      ]);
      loaded.correct = c.sound;
      loaded.wrong   = w.sound;
      loaded.start   = s.sound;
    } catch (e) {
      console.warn('SoundManager.init:', e.message);
    }
  },

  async play(name) {
    if (!SOUNDS_ENABLED || !loaded[name]) return;
    try {
      await loaded[name].setPositionAsync(0);
      await loaded[name].playAsync();
    } catch {}
  },

  async startBackground() {
    if (!SOUNDS_ENABLED || bgSound) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/background.mp3'),
        { isLooping: true, volume: 0.2 }
      );
      bgSound = sound;
      await bgSound.playAsync();
    } catch (e) {
      console.warn('SoundManager.startBackground:', e.message);
    }
  },

  async stopBackground() {
    if (!bgSound) return;
    try {
      await bgSound.stopAsync();
      await bgSound.unloadAsync();
    } catch {}
    bgSound = null;
  },

  async unloadAll() {
    await this.stopBackground();
    for (const key of Object.keys(loaded)) {
      try { await loaded[key].unloadAsync(); } catch {}
      delete loaded[key];
    }
  },
};

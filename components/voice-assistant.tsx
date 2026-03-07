import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useTheme } from '@/providers/theme-provider';

interface VoiceAssistantProps {
  robotName: string;
  onNavigate?: (page: string) => void;
  onToggleTrade?: () => void;
  onChangeTheme?: () => void;
  onColorChange?: (color: string) => void;
  onGlassChange?: (glass: string) => void;
  isTrading?: boolean;
}

// ===== AUDIO ENGINE =====
let audioCtx: AudioContext | null = null;
function getAC() {
  if (!audioCtx && typeof window !== 'undefined') audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}
function beepSnd(freq: number, dur: number) {
  const c = getAC(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'sine'; o.frequency.value = freq; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 10;
  g.gain.setValueAtTime(0.07, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(f); f.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
}
function staticSnd(dur: number) {
  const c = getAC(); if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.02;
  const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5;
  g.gain.setValueAtTime(0.04, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  src.connect(f); f.connect(g); g.connect(c.destination); src.start(); src.stop(c.currentTime + dur);
}
function commOpen() { beepSnd(1800, 0.08); setTimeout(() => beepSnd(2200, 0.08), 100); setTimeout(() => staticSnd(0.2), 180); }
function commClose() { beepSnd(2200, 0.06); setTimeout(() => beepSnd(1600, 0.1), 80); setTimeout(() => staticSnd(0.1), 160); }
function chimeSnd() { [800, 1000, 1200].forEach((f, i) => setTimeout(() => beepSnd(f, 0.12), i * 80)); }

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices(); if (!voices.length) return null;
  const pri = ['Microsoft Zira', 'Zira', 'Microsoft Zira Desktop',
    'Google UK English Female', 'Microsoft Hazel', 'Samantha', 'Karen', 'Moira', 'Fiona',
    'Google US English', 'Microsoft David', 'Daniel', 'Alex', 'Fred'];
  for (const name of pri) { const f = voices.find(v => v.name.includes(name)); if (f) return f; }
  const eng = voices.filter(v => v.lang?.startsWith('en'));
  return eng.filter(v => !v.localService)[0] || eng[0] || voices[0];
}

function parseCmd(raw: string): { action: string; param?: string } | null {
  const c = raw.toLowerCase().trim();
  if (c.match(/open quote|show quote|quote|symbol|pairs/)) return { action: 'nav', param: 'quotes' };
  if (c.match(/open setting|show setting|setting/)) return { action: 'nav', param: 'settings' };
  if (c.match(/open meta|metatrader|mt5|mt4|broker/)) return { action: 'nav', param: 'metatrader' };
  if (c.match(/go home|open home|home page|back home|back to home/)) return { action: 'nav', param: 'home' };
  if (c.match(/start trad|begin trad|activate trad|trade on/)) return { action: 'trade_on' };
  if (c.match(/stop trad|end trad|deactivate|trade off/)) return { action: 'trade_off' };
  if (c.match(/change theme|switch theme|random theme|new theme/)) return { action: 'theme' };
  const colorMatch = c.match(/colou?r(?:\s+to)?\s+(red|blue|green|purple|orange|cyan)/);
  if (colorMatch) return { action: 'color', param: colorMatch[1] };
  if (c.match(/change colou?r|random colou?r/)) return { action: 'random_color' };
  if (c.match(/neon/)) return { action: 'glass', param: 'neon' };
  if (c.match(/minimal/)) return { action: 'glass', param: 'minimal' };
  if (c.match(/liquid/)) return { action: 'glass', param: 'liquid' };
  if (c.match(/commander/)) return { action: 'glass', param: 'commander' };
  if (c.match(/change glow|change glass|random glow|random glass/)) return { action: 'random_glass' };
  if (c.match(/status|how.*trad|what.*status/)) return { action: 'status' };
  if (c.match(/who are you|your name|identify/)) return { action: 'identify' };
  if (c.match(/help|what can you do|commands/)) return { action: 'help' };
  return null;
}

const CHIPS = [
  { emoji: '📊', label: 'Open Quotes', cmd: 'open quotes' },
  { emoji: '⚡', label: 'Start Trading', cmd: 'start trading' },
  { emoji: '⏹', label: 'Stop Trading', cmd: 'stop trading' },
  { emoji: '🎨', label: 'Change Theme', cmd: 'change theme' },
  { emoji: '⚙️', label: 'Open Settings', cmd: 'open settings' },
  { emoji: '🏠', label: 'Go Home', cmd: 'go home' },
  { emoji: '🟣', label: 'Color Purple', cmd: 'color purple' },
  { emoji: '✨', label: 'Neon Mode', cmd: 'neon mode' },
];

export function VoiceAssistant({ robotName, onNavigate, onToggleTrade, onChangeTheme, onColorChange, onGlassChange, isTrading }: VoiceAssistantProps) {
  const { theme, glassMode } = useTheme();
  const [active, setActive] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);
  const [label, setLabel] = useState('TAP TO ACTIVATE VOICE');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(4))).current;
  const bubbleAnims = useRef(CHIPS.map(() => new Animated.Value(0))).current;
  const barLoopRef = useRef<any>(null);
  const recogRef = useRef<any>(null);
  const activeRef = useRef(false);
  const ac = theme.accent, a = theme.accentRgb;
  const isNeon = glassMode === 'neon', isLiquid = glassMode === 'liquid', isCmd = glassMode === 'commander';

  // ===== USE REFS FOR CALLBACKS TO BREAK CIRCULAR DEPS =====
  const propsRef = useRef({ robotName, onNavigate, onToggleTrade, onChangeTheme, onColorChange, onGlassChange, isTrading });
  propsRef.current = { robotName, onNavigate, onToggleTrade, onChangeTheme, onColorChange, onGlassChange, isTrading };

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => () => {
    if (recogRef.current) try { recogRef.current.abort(); } catch (e) {}
    if (barLoopRef.current) cancelAnimationFrame(barLoopRef.current);
    if (Platform.OS === 'web' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (active) {
      const l = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
      ])); l.start(); return () => l.stop();
    } else pulseAnim.setValue(1);
  }, [active]);

  const doBubbles = useCallback((show: boolean) => {
    setShowBubbles(show);
    bubbleAnims.forEach((anim, i) => {
      Animated.timing(anim, { toValue: show ? 1 : 0, duration: 300, delay: show ? i * 60 : 0, useNativeDriver: Platform.OS !== 'web' }).start();
    });
  }, [bubbleAnims]);

  const startBars = useCallback(() => {
    if (barLoopRef.current) cancelAnimationFrame(barLoopRef.current);
    const go = () => {
      Animated.parallel(barAnims.map(a => Animated.timing(a, { toValue: Math.random() * 22 + 4, duration: 120, useNativeDriver: false }))).start(() => { barLoopRef.current = requestAnimationFrame(go); });
    }; go();
  }, [barAnims]);

  const stopBars = useCallback(() => {
    if (barLoopRef.current) { cancelAnimationFrame(barLoopRef.current); barLoopRef.current = null; }
    barAnims.forEach(a => a.setValue(4));
  }, [barAnims]);

  // ===== SPEAK =====
  const say = useCallback((text: string, done?: () => void) => {
    if (Platform.OS !== 'web' || !window.speechSynthesis) { done?.(); return; }
    startBars(); setLabel(propsRef.current.robotName.toUpperCase() + ' SPEAKING...');
    commOpen();
    setTimeout(() => {
      const m = new SpeechSynthesisUtterance(text);
      m.rate = 0.88; m.pitch = 0.45; m.volume = 1;
      const v = pickVoice(); if (v) m.voice = v;
      m.onend = () => { setTimeout(commClose, 200); setTimeout(() => { stopBars(); done?.(); }, 500); };
      m.onerror = () => { stopBars(); done?.(); };
      window.speechSynthesis.speak(m);
    }, 400);
  }, [startBars, stopBars]);

  // ===== LISTEN — uses ref so it always has latest version =====
  const listenRef = useRef<() => void>(() => {});

  const startListening = useCallback(() => {
    if (Platform.OS !== 'web' || !activeRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (recogRef.current) try { recogRef.current.abort(); } catch (e) {}

    setLabel('LISTENING — SPEAK A COMMAND...'); stopBars();

    const r = new SR(); recogRef.current = r;
    r.continuous = false; r.interimResults = true; r.lang = 'en-US';

    r.onresult = (e: any) => {
      let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setLabel('🎤 ' + t); startBars(); doBubbles(false);
      if (e.results[e.results.length - 1].isFinal) {
        setLabel('PROCESSING...');
        // Use execRef to always get latest exec
        setTimeout(() => execRef.current(t), 300);
      }
    };
    r.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { recogRef.current = null; return; }
      if (e.error === 'no-speech' && activeRef.current) setTimeout(() => listenRef.current(), 300);
    };
    r.onend = () => {
      // Always restart if still active — this is the key fix
      if (activeRef.current) setTimeout(() => listenRef.current(), 300);
    };
    try { r.start(); } catch (e) {}
  }, [startBars, stopBars, doBubbles]);

  // Keep listenRef always pointing to latest startListening
  listenRef.current = startListening;

  // ===== EXEC — uses refs so resume always works =====
  const execRef = useRef<(raw: string) => void>(() => {});

  const execCommand = useCallback((raw: string) => {
    const p = parseCmd(raw); chimeSnd();
    const pr = propsRef.current;

    // Resume: go back to listening after speaking
    const resume = () => {
      if (!activeRef.current) return;
      setLabel('LISTENING — SPEAK A COMMAND...');
      stopBars();
      doBubbles(true);
      // Wait a beat then restart listening
      setTimeout(() => {
        if (activeRef.current) listenRef.current();
      }, 600);
    };

    if (!p) { say("Sorry, I didn't catch that. Try saying open quotes, start trading, or change theme.", resume); return; }
    switch (p.action) {
      case 'nav': say('Opening ' + p.param + '.', resume); pr.onNavigate?.(p.param!); break;
      case 'trade_on': if (pr.isTrading) say('Trading is already active.', resume); else { say('Trading activated. Reactor online.', resume); pr.onToggleTrade?.(); } break;
      case 'trade_off': if (!pr.isTrading) say('Trading is already stopped.', resume); else { say('Trading deactivated. Reactor offline.', resume); pr.onToggleTrade?.(); } break;
      case 'theme': say('Switching theme.', resume); pr.onChangeTheme?.(); break;
      case 'color': say('Color set to ' + p.param + '.', resume); pr.onColorChange?.(p.param!); break;
      case 'random_color': say('Switching color.', resume); pr.onColorChange?.('random'); break;
      case 'glass': say(p.param + ' mode activated.', resume); pr.onGlassChange?.(p.param!); break;
      case 'random_glass': say('Switching glass style.', resume); pr.onGlassChange?.('random'); break;
      case 'status': say(pr.isTrading ? 'Trading is active. Reactor online.' : 'Trading is idle. Reactor offline.', resume); break;
      case 'identify': say('I am ' + pr.robotName + '. Your loyal trading shadow soldier. Built by the Shadow Monarch.', resume); break;
      case 'help': say('You can say: open quotes, start trading, stop trading, change color to purple, neon mode, change theme, open settings, go home, or ask my status.', resume); break;
    }
  }, [say, stopBars, doBubbles]);

  // Keep execRef always pointing to latest execCommand
  execRef.current = execCommand;

  // ===== RUN CHIP =====
  const runChip = useCallback((cmd: string) => {
    if (!active) {
      setActive(true); setLabel('ACTIVATING...'); startBars(); doBubbles(false);
      setTimeout(() => {
        say(propsRef.current.robotName + ' online.', () => {
          if (!activeRef.current) return;
          setLabel('PROCESSING...'); startBars();
          setTimeout(() => execRef.current(cmd), 300);
        });
      }, 300);
      return;
    }
    doBubbles(false); setLabel('PROCESSING...'); startBars();
    setTimeout(() => execRef.current(cmd), 300);
  }, [active, say, startBars, doBubbles]);

  // ===== TOGGLE =====
  const toggle = useCallback(() => {
    if (active) {
      setActive(false); setLabel('TAP TO ACTIVATE VOICE'); stopBars(); doBubbles(false);
      if (recogRef.current) try { recogRef.current.abort(); } catch (e) {} recogRef.current = null;
      if (Platform.OS === 'web' && window.speechSynthesis) window.speechSynthesis.cancel();
      commClose();
    } else {
      setActive(true); setLabel('ACTIVATING...'); startBars();
      setTimeout(() => say(propsRef.current.robotName + ' online. How can I assist you today?', () => {
        if (!activeRef.current) return;
        stopBars(); setLabel('LISTENING — SPEAK A COMMAND...');
        doBubbles(true); listenRef.current();
      }), 600);
    }
  }, [active, say, startBars, stopBars, doBubbles]);

  const btnStyle = Platform.OS === 'web' ? (
    isNeon ? { background: 'radial-gradient(ellipse 120% 50% at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 70%), linear-gradient(180deg, rgba(' + a + ', 0.08) 0%, rgba(0,0,0,0.6) 100%)', backdropFilter: 'blur(80px) saturate(200%)', WebkitBackdropFilter: 'blur(80px) saturate(200%)', boxShadow: active ? '0 0 20px rgba(' + a + ', 0.4), 0 0 40px rgba(' + a + ', 0.2)' : 'inset 0 2px 6px rgba(255,255,255,0.2), 0 12px 24px rgba(0,0,0,0.35), 0 0 20px rgba(' + a + ', 0.15)' }
    : isLiquid ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.4) 100%)', backdropFilter: 'blur(60px) saturate(180%)', WebkitBackdropFilter: 'blur(60px) saturate(180%)', border: '1.5px solid rgba(' + a + ', 0.4)', boxShadow: active ? '0 0 20px rgba(' + a + ', 0.5), 0 0 40px rgba(' + a + ', 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.15), 0 0 8px rgba(' + a + ', 0.5), 0 0 20px rgba(' + a + ', 0.35), 0 0 40px rgba(' + a + ', 0.2)' }
    : isCmd ? { background: active ? 'rgba(' + a + ', 0.1)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '2px solid ' + ac, boxShadow: active ? '0 0 20px rgba(' + a + ', 0.4), 0 0 40px rgba(' + a + ', 0.2)' : '0 0 12px rgba(' + a + ', 0.35), 0 0 24px rgba(' + a + ', 0.2)' }
    : { background: 'rgba(16,16,18,0.97)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.04)', boxShadow: active ? '0 0 30px rgba(' + a + ', 0.5), 0 0 60px rgba(' + a + ', 0.25)' : 'inset 0 0.5px 0 rgba(255,255,255,0.1), 0 0 28px rgba(' + a + ', 0.35), 0 0 56px rgba(' + a + ', 0.15)' }
  ) : {};

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity style={[styles.btn, Platform.OS === 'web' && btnStyle as any]} onPress={toggle} activeOpacity={0.7}>
          <Mic color={active ? ac : 'rgba(255,255,255,0.4)'} size={28} />
        </TouchableOpacity>
      </Animated.View>
      {active && (
        <View style={styles.bars}>
          {barAnims.map((anim, i) => (
            <Animated.View key={i} style={[styles.bar, { height: anim, backgroundColor: ac }]} />
          ))}
        </View>
      )}
      <Text style={[styles.label, active && { color: ac }]}>{label}</Text>
      <View style={styles.bubblesWrap}>
        {CHIPS.map((chip, i) => (
          <Animated.View key={chip.cmd} style={{ opacity: showBubbles ? bubbleAnims[i] : 0.4, transform: [{ translateY: bubbleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
            <TouchableOpacity
              style={[styles.chipBtn, Platform.OS === 'web' && { borderColor: 'rgba(' + a + ', 0.12)' } as any]}
              onPress={() => runChip(chip.cmd)} activeOpacity={0.7}
            >
              <Text style={styles.chipEmoji}>{chip.emoji}</Text>
              <Text style={[styles.chipLabel, active && showBubbles && { color: 'rgba(255,255,255,0.6)' }]}>{chip.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16, gap: 8 },
  btn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  bars: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 },
  bar: { width: 3, borderRadius: 2 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, color: 'rgba(255, 255, 255, 0.3)', textAlign: 'center' },
  bubblesWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, paddingHorizontal: 8, marginTop: 4, maxWidth: 320 },
  chipBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)' },
  chipEmoji: { fontSize: 11, marginRight: 4 },
  chipLabel: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.3)', letterSpacing: 0.2 },
});

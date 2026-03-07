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

// ===== WEB AUDIO SCI-FI ENGINE =====
let audioCtx: AudioContext | null = null;
function getAC() {
  if (!audioCtx && typeof window !== 'undefined') audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
}
function beep(freq: number, dur: number) {
  const c = getAC(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
  o.type = 'sine'; o.frequency.value = freq; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 10;
  g.gain.setValueAtTime(0.07, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(f); f.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur);
}
function staticBurst(dur: number) {
  const c = getAC(); if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.025;
  const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
  src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5;
  g.gain.setValueAtTime(0.05, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  src.connect(f); f.connect(g); g.connect(c.destination); src.start(); src.stop(c.currentTime + dur);
}
function commOpen() { beep(1800, 0.08); setTimeout(() => beep(2200, 0.08), 100); setTimeout(() => staticBurst(0.25), 180); }
function commClose() { beep(2200, 0.06); setTimeout(() => beep(1600, 0.1), 80); setTimeout(() => staticBurst(0.12), 160); }
function chime() { [800, 1000, 1200].forEach((f, i) => setTimeout(() => beep(f, 0.12), i * 80)); }

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined') return null;
  const voices = window.speechSynthesis.getVoices(); if (!voices.length) return null;
  // Priority: deep/premium male voices first
  const priority = [
    'Google UK English Male', 'Microsoft David Desktop', 'Microsoft David',
    'Microsoft Mark Online', 'Microsoft Mark', 'Microsoft Guy Online',
    'Microsoft Ryan Online', 'Microsoft Christopher Online',
    'Daniel', 'Rishi', 'Oliver', 'Thomas', 'Aaron',
    'Alex', 'Fred', 'Samantha', 'Google US English',
    'en-GB-Standard-B', 'en-US-Standard-B', 'en-AU-Standard-B'
  ];
  for (const name of priority) {
    const found = voices.find(v => v.name.includes(name));
    if (found) return found;
  }
  // Fallback: any English male-sounding or just English
  const eng = voices.filter(v => v.lang?.startsWith('en'));
  // Prefer non-default voices (they tend to sound better)
  const nonDefault = eng.filter(v => !v.localService);
  if (nonDefault.length) return nonDefault[0];
  return eng[0] || voices[0];
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
  // Color commands
  const colorMatch = c.match(/(?:change |switch |set )?colou?r(?:\s+to)?\s+(red|blue|green|purple|orange|cyan)/);
  if (colorMatch) return { action: 'color', param: colorMatch[1] };
  if (c.match(/change colou?r|switch colou?r|random colou?r|new colou?r/)) return { action: 'random_color' };
  // Glass/glow commands
  const glassMatch = c.match(/(?:change |switch |set )?(?:glow|glass|style|mode)(?:\s+to)?\s+(neon|minimal|liquid|commander)/);
  if (glassMatch) return { action: 'glass', param: glassMatch[1] };
  if (c.match(/change glow|switch glow|change glass|switch glass|random glow|random glass/)) return { action: 'random_glass' };
  // Neon/minimal/liquid/commander direct
  if (c.match(/^neon$|neon mode|go neon|switch.*neon/)) return { action: 'glass', param: 'neon' };
  if (c.match(/^minimal$|minimal mode|go minimal|switch.*minimal/)) return { action: 'glass', param: 'minimal' };
  if (c.match(/^liquid$|liquid mode|go liquid|switch.*liquid/)) return { action: 'glass', param: 'liquid' };
  if (c.match(/^commander$|commander mode|go commander|switch.*commander/)) return { action: 'glass', param: 'commander' };
  if (c.match(/status|how.*trad|what.*status/)) return { action: 'status' };
  if (c.match(/who are you|your name|identify/)) return { action: 'identify' };
  if (c.match(/help|what can you do|commands/)) return { action: 'help' };
  return null;
}

export function VoiceAssistant({ robotName, onNavigate, onToggleTrade, onChangeTheme, onColorChange, onGlassChange, isTrading }: VoiceAssistantProps) {
  const { theme, glassMode } = useTheme();
  const [active, setActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [label, setLabel] = useState('TAP TO ACTIVATE VOICE');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(4))).current;
  const barLoopRef = useRef<any>(null);
  const recogRef = useRef<any>(null);
  const activeRef = useRef(false);
  const ac = theme.accent, a = theme.accentRgb;
  const isNeon = glassMode === 'neon', isLiquid = glassMode === 'liquid', isCmd = glassMode === 'commander';

  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => () => {
    if (recogRef.current) try { recogRef.current.abort(); } catch (e) {}
    if (barLoopRef.current) cancelAnimationFrame(barLoopRef.current);
    if (Platform.OS === 'web' && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // Pulse
  useEffect(() => {
    if (active) {
      const l = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
      ])); l.start(); return () => l.stop();
    } else pulseAnim.setValue(1);
  }, [active]);

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

  // Speak with comm sounds
  const say = useCallback((text: string, done?: () => void) => {
    if (Platform.OS !== 'web' || !window.speechSynthesis) { done?.(); return; }
    startBars(); setLabel(robotName.toUpperCase() + ' SPEAKING...');
    commOpen();
    setTimeout(() => {
      const m = new SpeechSynthesisUtterance(text);
      m.rate = 0.88; m.pitch = 0.45; m.volume = 1;
      const v = pickVoice(); if (v) m.voice = v;
      m.onend = () => { setTimeout(commClose, 200); setTimeout(() => { stopBars(); done?.(); }, 500); };
      m.onerror = () => { stopBars(); done?.(); };
      window.speechSynthesis.speak(m);
    }, 400);
  }, [robotName, startBars, stopBars]);

  // Execute command
  const exec = useCallback((raw: string) => {
    const p = parseCmd(raw); chime();
    const resume = () => { if (activeRef.current) listen(); };
    if (!p) { say("I didn't understand that. Try saying open quotes, start trading, or change theme.", resume); return; }
    switch (p.action) {
      case 'nav': say('Opening ' + p.param + '.', resume); onNavigate?.(p.param!); break;
      case 'trade_on': if (isTrading) say('Trading is already active.', resume); else { say('Trading activated. Reactor online.', resume); onToggleTrade?.(); } break;
      case 'trade_off': if (!isTrading) say('Trading is already stopped.', resume); else { say('Trading deactivated. Reactor offline.', resume); onToggleTrade?.(); } break;
      case 'theme': say('Switching theme.', resume); onChangeTheme?.(); break;
      case 'color': say('Color set to ' + p.param + '.', resume); onColorChange?.(p.param!); break;
      case 'random_color': say('Switching color.', resume); onColorChange?.('random'); break;
      case 'glass': say(p.param + ' mode activated.', resume); onGlassChange?.(p.param!); break;
      case 'random_glass': say('Switching glass style.', resume); onGlassChange?.('random'); break;
      case 'status': say(isTrading ? 'Trading is active. Reactor online.' : 'Trading is idle. Reactor offline.', resume); break;
      case 'identify': say('I am ' + robotName + '. Your loyal trading shadow soldier. Built by the Shadow Monarch.', resume); break;
      case 'help': say('You can say: open quotes, start trading, stop trading, change color to purple, neon mode, change theme, open settings, go home, or ask my status.', resume); break;
    }
  }, [say, isTrading, robotName, onNavigate, onToggleTrade, onChangeTheme, onColorChange, onGlassChange]);

  // Speech recognition loop
  const listen = useCallback(() => {
    if (Platform.OS !== 'web' || !activeRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setLabel('SPEECH NOT SUPPORTED'); setListening(false); stopBars(); return; }
    if (recogRef.current) try { recogRef.current.abort(); } catch (e) {}
    setListening(true); setLabel('LISTENING — SPEAK A COMMAND...'); stopBars();
    const r = new SR(); recogRef.current = r;
    r.continuous = false; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e: any) => {
      let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setLabel('🎤 ' + t); startBars();
      if (e.results[e.results.length - 1].isFinal) { setListening(false); setLabel('PROCESSING...'); setTimeout(() => exec(t), 300); }
    };
    r.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setLabel('MIC BLOCKED — ALLOW MICROPHONE'); setListening(false); stopBars(); recogRef.current = null; return;
      }
      if (e.error === 'no-speech' && activeRef.current) setTimeout(listen, 300);
    };
    r.onend = () => { if (activeRef.current && !listening) { /* will restart via exec->resume or onerror */ } };
    try { r.start(); } catch (e) { setLabel('VOICE ERROR'); }
  }, [exec, startBars, stopBars]);

  const toggle = useCallback(() => {
    if (active) {
      setActive(false); setListening(false); setLabel('TAP TO ACTIVATE VOICE'); stopBars();
      if (recogRef.current) try { recogRef.current.abort(); } catch (e) {} recogRef.current = null;
      if (Platform.OS === 'web' && window.speechSynthesis) window.speechSynthesis.cancel();
      commClose();
    } else {
      setActive(true); setLabel('ACTIVATING...'); startBars();
      setTimeout(() => say(robotName + ' online. How can I assist you today?', () => { if (activeRef.current) listen(); }), 600);
    }
  }, [active, robotName, say, listen, startBars, stopBars]);

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
      {active && !listening && (
        <Text style={[styles.hint, { color: 'rgba(255,255,255,0.2)' }]}>Try: "Open Quotes" · "Start Trading" · "Color Purple" · "Neon Mode" · "Help"</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16, gap: 10 },
  btn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)' },
  bars: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 24 },
  bar: { width: 3, borderRadius: 2 },
  label: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, color: 'rgba(255, 255, 255, 0.3)', textAlign: 'center' },
  hint: { fontSize: 9, textAlign: 'center', lineHeight: 14, paddingHorizontal: 20 },
});

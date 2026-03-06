import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Mic } from 'lucide-react-native';
import { useTheme } from '@/providers/theme-provider';

interface VoiceAssistantProps {
  robotName: string;
}

export function VoiceAssistant({ robotName }: VoiceAssistantProps) {
  const { theme, glassMode } = useTheme();
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState('TAP TO ACTIVATE VOICE');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const barAnims = useRef(Array.from({ length: 7 }, () => new Animated.Value(4))).current;
  const barLoopRef = useRef<any>(null);
  const ac = theme.accent;
  const a = theme.accentRgb;
  const isNeon = glassMode === 'neon';
  const isLiquid = glassMode === 'liquid';
  const isCmd = glassMode === 'commander';

  // Pulse animation when active
  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [active]);

  // Bar animations when active
  useEffect(() => {
    if (active) {
      const animate = () => {
        const anims = barAnims.map(anim =>
          Animated.timing(anim, { toValue: Math.random() * 22 + 4, duration: 120, useNativeDriver: false })
        );
        Animated.parallel(anims).start(() => {
          if (active) barLoopRef.current = requestAnimationFrame(animate);
        });
      };
      animate();
      return () => { if (barLoopRef.current) cancelAnimationFrame(barLoopRef.current); };
    } else {
      barAnims.forEach(anim => anim.setValue(4));
    }
  }, [active]);

  const speak = () => {
    if (Platform.OS !== 'web') return;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const msg = new SpeechSynthesisUtterance(`${robotName} online. How can I assist you today?`);
    msg.rate = 0.85;
    msg.pitch = 0.6;
    msg.volume = 1;

    const voices = synth.getVoices();
    const preferred = ['Google UK English Male', 'Microsoft David', 'Daniel', 'Alex', 'Fred'];
    for (const name of preferred) {
      const found = voices.find(v => v.name.includes(name));
      if (found) { msg.voice = found; break; }
    }
    if (!msg.voice) {
      const male = voices.find(v => v.name.toLowerCase().includes('male') || v.name.includes('David'));
      if (male) msg.voice = male;
    }

    msg.onstart = () => setLabel(`${robotName.toUpperCase()} SPEAKING...`);
    msg.onend = () => {
      setTimeout(() => {
        if (active) setLabel('TAP TO SPEAK AGAIN');
      }, 500);
    };

    synth.speak(msg);
  };

  const toggle = () => {
    if (active) {
      setActive(false);
      setLabel('TAP TO ACTIVATE VOICE');
      if (Platform.OS === 'web' && window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setActive(true);
      setLabel('ACTIVATING...');
      setTimeout(() => {
        setLabel('LISTENING...');
        speak();
      }, 800);
    }
  };

  const btnStyle = Platform.OS === 'web' ? (
    isNeon ? { background: 'radial-gradient(ellipse 120% 50% at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 70%), linear-gradient(180deg, rgba(' + a + ', 0.08) 0%, rgba(0,0,0,0.6) 100%)', backdropFilter: 'blur(80px) saturate(200%)', WebkitBackdropFilter: 'blur(80px) saturate(200%)', boxShadow: active ? '0 0 20px rgba(' + a + ', 0.4), 0 0 40px rgba(' + a + ', 0.2)' : 'inset 0 2px 6px rgba(255,255,255,0.2), 0 12px 24px rgba(0,0,0,0.35), 0 0 20px rgba(' + a + ', 0.15)' }
    : isLiquid ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.4) 100%)', backdropFilter: 'blur(60px) saturate(180%)', WebkitBackdropFilter: 'blur(60px) saturate(180%)', border: '1.5px solid rgba(' + a + ', 0.4)', boxShadow: active ? '0 0 20px rgba(' + a + ', 0.5), 0 0 40px rgba(' + a + ', 0.3)' : 'inset 0 1px 0 rgba(255,255,255,0.15), 0 0 8px rgba(' + a + ', 0.5), 0 0 20px rgba(' + a + ', 0.35), 0 0 40px rgba(' + a + ', 0.2)' }
    : isCmd ? { background: active ? 'rgba(' + a + ', 0.1)' : 'rgba(0,0,0,0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '2px solid ' + ac, boxShadow: active ? '0 0 20px rgba(' + a + ', 0.4), 0 0 40px rgba(' + a + ', 0.2)' : '0 0 12px rgba(' + a + ', 0.35), 0 0 24px rgba(' + a + ', 0.2)' }
    : { background: 'rgba(16,16,18,0.97)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '0.5px solid rgba(255,255,255,0.04)', boxShadow: active ? '0 0 30px rgba(' + a + ', 0.5), 0 0 60px rgba(' + a + ', 0.25)' : 'inset 0 0.5px 0 rgba(255,255,255,0.1), 0 0 28px rgba(' + a + ', 0.35), 0 0 56px rgba(' + a + ', 0.15)' }
  ) : {};

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.btn, Platform.OS === 'web' && btnStyle as any]}
          onPress={toggle}
          activeOpacity={0.7}
        >
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

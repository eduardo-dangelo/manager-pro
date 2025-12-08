'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook to manage hover sound functionality
 * Returns a function to play the hover sound when appropriate
 */
export function useHoverSound() {
  const pathname = usePathname();
  const locale = useLocale();
  const [hoverSoundEnabled, setHoverSoundEnabled] = useState<string>('true');
  const [isLoading, setIsLoading] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTimeRef = useRef<number>(0);

  // Check if we're on the landing page (marketing routes)
  // Landing page is typically just the root path or locale root
  // Remove locale prefix and check if it's root
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  const isLandingPage = pathnameWithoutLocale === '/' || pathnameWithoutLocale === '';

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof AudioContext !== 'undefined') {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Fetch user preference
  useEffect(() => {
    const fetchPreference = async () => {
      try {
        const apiPath = `/${locale}/api/users/preferences`;
        const response = await fetch(apiPath);
        if (response.ok) {
          const data = await response.json();
          setHoverSoundEnabled(data.hoverSoundEnabled || 'true');
        }
      } catch (error) {
        console.error('Error fetching hover sound preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreference();
  }, [locale]);

  /**
   * Generate and play a subtle closed hi-hat sound with sharp attack
   */
  const playHoverSound = () => {
    // Don't play if disabled, on landing page, or loading
    if (hoverSoundEnabled !== 'true' || isLandingPage || isLoading) {
      return;
    }

    // Throttle: don't play if played recently (within 50ms)
    const now = Date.now();
    if (now - lastPlayTimeRef.current < 50) {
      return;
    }

    if (!audioContextRef.current) {
      return;
    }

    try {
      const audioContext = audioContextRef.current;
      const currentTime = audioContext.currentTime;

      // Resume audio context if suspended (required by browser autoplay policies)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create white noise for the hi-hat "chiff" attack
      const bufferSize = audioContext.sampleRate * 0.03; // 30ms buffer
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const noiseOutput = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseOutput[i] = Math.random() * 2 - 1; // White noise
      }

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Create high-pass filter for the noise (hi-hat characteristic)
      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 3000; // High frequency content
      noiseFilter.Q.value = 1;

      // Gain node for noise with sharp attack and quick decay
      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0, currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.04, currentTime + 0.001); // Very quick attack (~1ms)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.025); // Quick decay

      // Create high-frequency oscillator for the "ping" component
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(3500, currentTime); // Higher frequency for hi-hat character

      // Gain node for oscillator with sharp attack
      const oscGain = audioContext.createGain();
      oscGain.gain.setValueAtTime(0, currentTime);
      oscGain.gain.linearRampToValueAtTime(0.03, currentTime + 0.001); // Sharp attack
      oscGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.02); // Quick decay

      // Connect noise: source -> filter -> gain -> destination
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      // Connect oscillator: oscillator -> gain -> destination
      oscillator.connect(oscGain);
      oscGain.connect(audioContext.destination);

      // Start both sources
      noiseSource.start(currentTime);
      noiseSource.stop(currentTime + 0.03);
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.02);

      lastPlayTimeRef.current = now;
    } catch {
      // Silently fail if audio context is not available
      // Error is ignored for better UX
    }
  };

  /**
   * Update the hover sound preference (for when user toggles it)
   */
  const updatePreference = async (enabled: boolean) => {
    try {
      const apiPath = `/${locale}/api/users/preferences`;
      const response = await fetch(apiPath, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoverSoundEnabled: enabled ? 'true' : 'false' }),
      });

      if (response.ok) {
        setHoverSoundEnabled(enabled ? 'true' : 'false');
      }
    } catch (error) {
      console.error('Error updating hover sound preference:', error);
    }
  };

  return {
    playHoverSound,
    hoverSoundEnabled: hoverSoundEnabled === 'true',
    updatePreference,
    isLoading,
  };
}

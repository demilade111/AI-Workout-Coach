import { useState, useEffect, useRef, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';

const SUBSCRIPTION_INTERVAL_MS = 100;
const MOTION_THRESHOLD = 1.2;
const COOLDOWN_MS = 600;

export function useRepCounter() {
  const [repCount, setRepCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentAccel, setCurrentAccel] = useState({ x: 0, y: 0, z: 0 });

  const subscriptionRef = useRef(null);
  const lastRepTimeRef = useRef(0);
  const peakDetectedRef = useRef(false);
  const baselineRef = useRef(null);

  const startCounting = useCallback(() => {
    setRepCount(0);
    setIsActive(true);
    baselineRef.current = null;
    lastRepTimeRef.current = 0;

    Accelerometer.setUpdateInterval(SUBSCRIPTION_INTERVAL_MS);

    subscriptionRef.current = Accelerometer.addListener((data) => {
      setCurrentAccel(data);

      if (!baselineRef.current) {
        baselineRef.current = data;
        return;
      }

      const magnitude = Math.sqrt(
        Math.pow(data.x - baselineRef.current.x, 2) +
        Math.pow(data.y - baselineRef.current.y, 2) +
        Math.pow(data.z - baselineRef.current.z, 2)
      );

      const now = Date.now();

      if (magnitude > MOTION_THRESHOLD && !peakDetectedRef.current) {
        peakDetectedRef.current = true;
      }

      if (peakDetectedRef.current && magnitude < 0.4) {
        if (now - lastRepTimeRef.current > COOLDOWN_MS) {
          setRepCount((prev) => prev + 1);
          lastRepTimeRef.current = now;
        }
        peakDetectedRef.current = false;
        baselineRef.current = data;
      }
    });
  }, []);

  const stopCounting = useCallback(() => {
    setIsActive(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }, []);

  const resetCount = useCallback(() => {
    setRepCount(0);
  }, []);

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  return { repCount, isActive, currentAccel, startCounting, stopCounting, resetCount };
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { ConfigData } from '@/types/config';
import { defaultConfig, createEmptySensors } from '@/lib/defaultConfig';
import { isValidConfig } from '@/lib/configValidation';

const STORAGE_KEY = 'hamon-config';
const SAVE_DEBOUNCE_MS = 300;

export function migrateConfig(config: ConfigData): ConfigData {
  if (config.screens && Array.isArray(config.screens) && config.screens.length === 3) {
    // Already migrated, but let's ensure they have IDs s1, s2, s3
    return config;
  }

  const screens = [
    {
      id: 's1',
      name: 'Screen 1',
      backgroundColor: '#0f1419',
      fontColor: '#ffffff',
      sensors: config.sensors && config.sensors.length > 0 ? [...config.sensors] : [...defaultConfig.sensors],
    },
    {
      id: 's2',
      name: 'Screen 2',
      backgroundColor: '#0f1419',
      fontColor: '#ffffff',
      sensors: createEmptySensors(),
    },
    {
      id: 's3',
      name: 'Screen 3',
      backgroundColor: '#0f1419',
      fontColor: '#ffffff',
      sensors: createEmptySensors(),
    },
  ];

  return {
    ...config,
    screens,
  };
}

export function useLocalStorageConfig(): [ConfigData, (config: ConfigData) => void] {
  const [config, setConfigState] = useState<ConfigData>(() => migrateConfig(defaultConfig));
  const [initialized, setInitialized] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidConfig(parsed)) {
          setConfigState(migrateConfig(parsed));
        }
      }
    } catch {
      // Ignore errors and keep migrated defaultConfig
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        // Ignore storage write errors
      }
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [config, initialized]);

  const setConfig = (newConfig: ConfigData) => {
    setConfigState(migrateConfig(newConfig));
  };

  return [config, setConfig];
}

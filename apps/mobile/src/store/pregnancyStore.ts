import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PregnancyStore {
  isPregnancyMode: boolean;
  pregnancy: any | null;
  setPregnancyMode: (enabled: boolean) => Promise<void>;
  setPregnancy: (data: any) => void;
  clearPregnancy: () => void;
  initializePregnancyMode: () => Promise<void>;
}

export const usePregnancyStore = create<PregnancyStore>((set) => ({
  isPregnancyMode: false,
  pregnancy: null,

  setPregnancyMode: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem('pregnancyMode', JSON.stringify(enabled));
      set({ isPregnancyMode: enabled });
    } catch (error) {
      console.error('Failed to save pregnancy mode:', error);
    }
  },

  setPregnancy: (data: any) => {
    set({ pregnancy: data });
  },

  clearPregnancy: () => {
    set({ pregnancy: null, isPregnancyMode: false });
    AsyncStorage.removeItem('pregnancyMode');
  },

  initializePregnancyMode: async () => {
    try {
      const stored = await AsyncStorage.getItem('pregnancyMode');
      if (stored) {
        const enabled = JSON.parse(stored);
        set({ isPregnancyMode: enabled });
      }
    } catch (error) {
      console.error('Failed to load pregnancy mode:', error);
    }
  },
}));

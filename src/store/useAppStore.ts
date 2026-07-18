import { create } from 'zustand';
import type { AnalysisResult, Blogger } from '@/types';

const HISTORY_KEY = 'beautymatch_history';
const CURRENT_KEY = 'beautymatch_current';
const IMAGE_KEY = 'beautymatch_image';

interface AppState {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;

  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  /** Save current result to history and localStorage */
  saveCurrentResult: () => void;
  /** Restore a result from history (sets it as current) */
  restoreFromHistory: (id: string) => void;

  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  analysisProgress: number;
  setAnalysisProgress: (v: number) => void;
  analysisMessage: string;
  setAnalysisMessage: (v: string) => void;

  history: AnalysisResult[];
  addToHistory: (result: AnalysisResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  loadHistory: () => void;

  bloggers: Blogger[];
  setBloggers: (bloggers: Blogger[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  uploadedImage: (() => {
    try { return localStorage.getItem(IMAGE_KEY); } catch { return null; }
  })(),
  setUploadedImage: (image) => {
    set({ uploadedImage: image });
    try {
      if (image) localStorage.setItem(IMAGE_KEY, image);
      else localStorage.removeItem(IMAGE_KEY);
    } catch { /* quota exceeded */ }
  },

  analysisResult: (() => {
    try {
      const data = localStorage.getItem(CURRENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  })(),
  setAnalysisResult: (result) => {
    set({ analysisResult: result });
    // Auto-persist to localStorage
    try {
      if (result) {
        localStorage.setItem(CURRENT_KEY, JSON.stringify(result));
      } else {
        localStorage.removeItem(CURRENT_KEY);
      }
    } catch { /* quota exceeded */ }
  },
  saveCurrentResult: () => {
    const { analysisResult, addToHistory } = get();
    if (analysisResult) {
      addToHistory({ ...analysisResult });
    }
  },
  restoreFromHistory: (id) => {
    const { history } = get();
    const found = history.find((r) => r.id === id);
    if (found) {
      set({ analysisResult: { ...found } });
      try { localStorage.setItem(CURRENT_KEY, JSON.stringify(found)); } catch {}
    }
  },

  isAnalyzing: false,
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  analysisProgress: 0,
  setAnalysisProgress: (v) => set({ analysisProgress: v }),
  analysisMessage: '',
  setAnalysisMessage: (v) => set({ analysisMessage: v }),

  history: [],
  addToHistory: (result) => {
    const current = get().history;
    // Deduplicate by id
    const filtered = current.filter((r) => r.id !== result.id);
    const updated = [{ ...result, _savedAt: Date.now() } as any, ...filtered].slice(0, 30);
    set({ history: updated });
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
  },
  removeFromHistory: (id) => {
    const updated = get().history.filter((r) => r.id !== id);
    set({ history: updated });
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
  },
  clearHistory: () => {
    set({ history: [] });
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
  },
  loadHistory: () => {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) set({ history: JSON.parse(data) });
    } catch {}
  },

  bloggers: [],
  setBloggers: (bloggers) => set({ bloggers }),
}));

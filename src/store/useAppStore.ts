import { create } from 'zustand';
import type { AnalysisResult, Blogger } from '@/types';

interface AppState {
  // 上传的图片
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;

  // 分析结果
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;

  // 分析状态
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  analysisProgress: number;
  setAnalysisProgress: (v: number) => void;
  analysisMessage: string;
  setAnalysisMessage: (v: string) => void;

  // 历史记录（localStorage 持久化）
  history: AnalysisResult[];
  addToHistory: (result: AnalysisResult) => void;
  clearHistory: () => void;
  loadHistory: () => void;

  // 博主数据
  bloggers: Blogger[];
  setBloggers: (bloggers: Blogger[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  uploadedImage: null,
  setUploadedImage: (image) => set({ uploadedImage: image }),

  analysisResult: null,
  setAnalysisResult: (result) => set({ analysisResult: result }),

  isAnalyzing: false,
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
  analysisProgress: 0,
  setAnalysisProgress: (v) => set({ analysisProgress: v }),
  analysisMessage: '',
  setAnalysisMessage: (v) => set({ analysisMessage: v }),

  history: [],
  addToHistory: (result) => {
    const current = get().history;
    const updated = [result, ...current].slice(0, 20); // 最多保留20条
    set({ history: updated });
    localStorage.setItem('beautymatch_history', JSON.stringify(updated));
  },
  clearHistory: () => {
    set({ history: [] });
    localStorage.removeItem('beautymatch_history');
  },
  loadHistory: () => {
    try {
      const data = localStorage.getItem('beautymatch_history');
      if (data) {
        set({ history: JSON.parse(data) });
      }
    } catch {
      // ignore
    }
  },

  bloggers: [],
  setBloggers: (bloggers) => set({ bloggers }),
}));

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItem {
  id: string;
  title: string;
  duration: string;
  status: 'pending' | 'active' | 'completed';
  notes: string;
  slides: { text: string }[];
}

export interface ActiveSlideState {
  type: 'lyrics' | 'scripture' | 'blank' | 'logo';
  title: string;
  content: string; // The formatted paragraphs or single lines
  index: number;
  total: number;
  backgroundTheme: string; // 'solid-dark' | 'gradient-navy' | 'cross-graphic' | 'ambient-worship' | 'gold-vintage'
}

export interface BibleVerse {
  reference: string;
  text: string;
  confidence: number;
  approved?: boolean;
  ignored?: boolean;
}

export interface SongSuggestion {
  title: string;
  reason: string;
  lyricsSnippet: string;
}

export interface AIAnalysisResult {
  scriptures: BibleVerse[];
  songThemeSuggestions: SongSuggestion[];
  topic: string;
}

export interface WorshipSong {
  id: string;
  title: string;
  author: string;
  slides: string[][]; // Array of slides, each slide is an array of lyric lines
}

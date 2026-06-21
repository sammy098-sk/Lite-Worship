/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Search, 
  Music, 
  ChevronRight, 
  ChevronLeft, 
  EyeOff, 
  Image, 
  Mic, 
  MicOff,
  Plus, 
  Edit3, 
  Check, 
  Trash2, 
  Sliders, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Volume2,
  RefreshCw,
  Video
} from "lucide-react";
import { DEFAULT_SERVICE_FLOW, WORSHIP_SONGS, KNOWN_SCRIPTURES } from "./data";
import { ServiceItem, ActiveSlideState, BibleVerse, SongSuggestion, WorshipSong } from "./types";
import LivePreview from "./components/LivePreview";

export default function App() {
  // --- Service State ---
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>(DEFAULT_SERVICE_FLOW);
  const [activeItemId, setActiveItemId] = useState<string>("item-2"); // Default to worship session
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  
  // --- Live Presentation State ---
  const [backdropTheme, setBackdropTheme] = useState<string>("ambient-worship");
  const [blackoutActive, setBlackoutActive] = useState<boolean>(false);
  const [showLogoActive, setShowLogoActive] = useState<boolean>(false);
  
  // --- Selected Worship Song State ---
  const [selectedSongId, setSelectedSongId] = useState<string>("song-2"); // Default to Goodness of God
  const [selectedSongPartsIndex, setSelectedSongPartsIndex] = useState<number>(0);

  // --- Search Verse State ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{ reference: string; text: string; translation: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // --- AI Sermon Parser Assistant State ---
  const [isAiListening, setIsAiListening] = useState<boolean>(true);
  const [transcriptInput, setTranscriptInput] = useState<string>(
    "We need to find peace in times of hardship. In Matthew 6:12, the Scripture reminds us to forgive others so we can receive grace. Let us live with a heart of forgiveness and walk in faith."
  );
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>("Forgiveness & Divine Grace");
  const [aiScriptures, setAiScriptures] = useState<BibleVerse[]>([
    {
      reference: "Matthew 6:12",
      text: "And forgive us our debts, as we also have forgiven our debtors.",
      confidence: 0.98,
      approved: false
    }
  ]);
  const [aiSongSuggestions, setAiSongSuggestions] = useState<SongSuggestion[]>([
    {
      title: "Goodness of God",
      reason: "Speaks deeply about walking in faith and God's abundant grace.",
      lyricsSnippet: "All my life You have been faithful, all my life You have been so so good..."
    },
    {
      title: "Amazing Grace",
      reason: "Reflects the theme of receiving forgiveness and grace through faith.",
      lyricsSnippet: "Amazing grace! How sweet the sound, That saved a wretch like me..."
    }
  ]);

  // --- Editing Modals or forms ---
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
  const [isAIEduMode, setIsAIEduMode] = useState<boolean>(false);
  const [aiEditingIndex, setAiEditingIndex] = useState<number | null>(null);
  const [aiEditRef, setAiEditRef] = useState<string>("");
  const [aiEditText, setAiEditText] = useState<string>("");

  // --- General Alerts ---
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // --- Microphone simulation ticker helper ---
  const [audioMeter, setAudioMeter] = useState<number>(45);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiListening) {
      interval = setInterval(() => {
        setAudioMeter(Math.floor(20 + Math.random() * 55));
      }, 350);
    } else {
      setAudioMeter(0);
    }
    return () => clearInterval(interval);
  }, [isAiListening]);

  // Toast auto-clearing helper
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Switch Active Service Flow timeline action
  const handleSelectServiceItem = (itemId: string) => {
    setActiveItemId(itemId);
    setActiveSlideIndex(0);
    // Reset specific presentation overlays
    setBlackoutActive(false);
    setShowLogoActive(false);
  };

  const getActiveItem = (): ServiceItem | undefined => {
    return serviceItems.find(item => item.id === activeItemId);
  };

  // Compile active presentation slides
  const getActiveSlidesList = (): { type: 'lyrics' | 'scripture' | 'blank' | 'logo'; text: string; label: string }[] => {
    const item = getActiveItem();
    if (!item) return [{ type: 'blank', text: 'No Slide Active', label: 'Draft' }];

    // If it's the Worship item, tie slides to currently selected Song lyric slides!
    if (item.title.toLowerCase().includes("worship") || item.id === "item-2") {
      const activeSong = WORSHIP_SONGS.find(s => s.id === selectedSongId);
      if (activeSong) {
        return activeSong.slides.map((slideArr, index) => ({
          type: 'lyrics',
          text: slideArr.join("\n"),
          label: `${activeSong.title} — Page ${index + 1}`
        }));
      }
    }

    // Default return service flow slides
    return item.slides.map((s, index) => ({
      type: item.title.toLowerCase().includes("reading") || item.title.toLowerCase().includes("sermon") ? "scripture" : "lyrics",
      text: s.text,
      label: `${item.title} — Slide ${index + 1}`
    }));
  };

  const slides = getActiveSlidesList();
  const currentSlide = slides[activeSlideIndex] || { type: 'blank', text: '', label: '' };

  // Sync state wrapper for rendering inside live preview screen
  const getPresentationState = (): ActiveSlideState => {
    if (blackoutActive) {
      return {
        type: "blank",
        title: "",
        content: "",
        index: 0,
        total: 1,
        backgroundTheme: backdropTheme
      };
    }
    if (showLogoActive) {
      return {
        type: "logo",
        title: "Lite Worship",
        content: "",
        index: 0,
        total: 1,
        backgroundTheme: backdropTheme
      };
    }

    return {
      type: currentSlide.type as 'lyrics' | 'scripture' | 'blank' | 'logo',
      title: currentSlide.label,
      content: currentSlide.text,
      index: activeSlideIndex,
      total: slides.length,
      backgroundTheme: backdropTheme
    };
  };

  const currentPresentationState = getPresentationState();

  // --- Actions ---
  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    }
  };

  // Search Verse semantically (Hits real /api/ai/search-verse)
  const handleSearchVerse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryNotEmpty(searchQuery)) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const res = await fetch("/api/ai/search-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      if (res.ok && data.reference) {
        setSearchResult(data);
        setSuccessToast(`Found verse reference: ${data.reference}`);
      } else {
        throw new Error(data.error || "No matching scripture found.");
      }
    } catch (err: any) {
      // Local fallback lookup
      console.warn("Verse Search call issue, returning fallback lookup:", err.message);
      const match = KNOWN_SCRIPTURES.find(s => 
        s.reference.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.text.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (match) {
        setSearchResult({
          reference: match.reference,
          text: match.text,
          translation: "ESV (Local Search)"
        });
      } else {
        setSearchError("No matching Bible verses found in AI databases or local indices. Try John 3:16, Romans 8:28, or Matthew 6:33.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Preset Sermon transcript triggers helper
  const triggerPresetSermon = async (theme: 'faith' | 'anxiety' | 'forgiveness') => {
    let speechText = "";
    if (theme === 'faith') {
      speechText = "Faith is the assurance of things we hope for. Hebrews 11:1 explains this so beautifully, that faith is conviction of things not yet seen, so we trust completely in the Lord.";
    } else if (theme === 'anxiety') {
      speechText = "Do not be anxious about anything. In Philippians 4:6, the Apostle Paul instructs us to bring our requests to God with thanksgiving. Trust his goodness.";
    } else {
      speechText = "If we hold grudges our hearts are heavy. As Matthew 6:12 highlights, we ask the Father to forgive our debts just as we forgive our debtors. That is the root of love.";
    }

    setTranscriptInput(speechText);
    await analyzeSermonTranscript(speechText);
  };

  // Call /api/ai/analyze-speech to extract scriptures & songs
  const analyzeSermonTranscript = async (textToAnalyze: string) => {
    if (!textToAnalyze || textToAnalyze.trim() === "") return;
    setIsAiAnalyzing(true);
    setSuccessToast("Gemini parsing spoken sermon for references...");

    try {
      const res = await fetch("/api/ai/analyze-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: textToAnalyze })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.scriptures && data.scriptures.length > 0) {
          const formattedScr = data.scriptures.map((s: any) => ({
            ...s,
            approved: false,
            ignored: false
          }));
          setAiScriptures(formattedScr);
        } else {
          setSuccessToast("Sermon context analyzed: No direct scripture numbers declared");
        }
        
        if (data.songThemeSuggestions) {
          setAiSongSuggestions(data.songThemeSuggestions);
        }
        if (data.topic) {
          setAiTopic(data.topic);
        }
      }
    } catch (err: any) {
      console.warn("AI Sermon analysis query issue, simulating fallback parsing", err.message);
      // Fallback behavior
      if (textToAnalyze.toLowerCase().includes("hebrew") || textToAnalyze.toLowerCase().includes("11:1")) {
        setAiScriptures([
          {
            reference: "Hebrews 11:1",
            text: "Now faith is the assurance of things hoped for, the conviction of things not seen.",
            confidence: 0.99,
            approved: false
          }
        ]);
        setAiTopic("Faith & Assurance");
        setAiSongSuggestions([
          {
            title: "Way Maker",
            reason: "Aligns with hoping in the unseen and God's active work.",
            lyricsSnippet: "Promise keeper, Light in the darkness, My God, that is who You are"
          }
        ]);
      } else if (textToAnalyze.toLowerCase().includes("philip") || textToAnalyze.toLowerCase().includes("4:6")) {
        setAiScriptures([
          {
            reference: "Philippians 4:6-7",
            text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
            confidence: 0.97,
            approved: false
          }
        ]);
        setAiTopic("Peace Over Anxiety");
        setAiSongSuggestions([
          {
            title: "10,000 Reasons",
            reason: "Focuses on thankfulness and praising God's holy name in all times.",
            lyricsSnippet: "Bless the Lord O my soul... Whatever may pass and whatever lies before me..."
          }
        ]);
      } else {
        // Generic simulated result
        setAiScriptures([
          {
            reference: "Psalm 23:1",
            text: "The Lord is my shepherd; I shall not want.",
            confidence: 0.85,
            approved: false
          }
        ]);
        setAiTopic("Divine Sanctuary");
      }
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Helper validation
  const queryNotEmpty = (q: string) => q && q.trim().length > 0;

  // Present search or helper verse immediately to congregation
  const handlePresentVerseDirect = (reference: string, text: string) => {
    // We add slide to active scripture item or dynamically adjust slide presentation
    const parsedVerseSlide = {
      type: "scripture" as const,
      text: text,
      label: reference
    };

    // Temporarily replace current active view with this scripture
    setBlackoutActive(false);
    setShowLogoActive(false);

    // Override the active service flow block's content to immediately host this scripture
    const updatedFlow = serviceItems.map(item => {
      if (item.id === activeItemId) {
        return {
          ...item,
          slides: [{ text: text }]
        };
      }
      return item;
    });

    setServiceItems(updatedFlow);
    setActiveSlideIndex(0);
    setSuccessToast(`Now presenting to preview monitor: ${reference}`);
  };

  // Add search verse as card into active flow
  const handleAddSearchResultToTimeline = () => {
    if (!searchResult) return;
    const updatedFlow = serviceItems.map(item => {
      if (item.id === activeItemId) {
        return {
          ...item,
          slides: [...item.slides, { text: `${searchResult.reference}\n${searchResult.text}` }]
        };
      }
      return item;
    });
    setServiceItems(updatedFlow);
    setSuccessToast(`Added ${searchResult.reference} to active Service segment!`);
  };

  // Approve AI suggested verse (Present to Congregational Screen)
  const handleApproveAiVerse = (index: number) => {
    const scripture = aiScriptures[index];
    const updated = [...aiScriptures];
    updated[index].approved = true;
    updated[index].ignored = false;
    setAiScriptures(updated);

    // Present directly
    handlePresentVerseDirect(scripture.reference, scripture.text);
  };

  // Ignore / Dismiss AI suggested verse
  const handleIgnoreAiVerse = (index: number) => {
    const updated = [...aiScriptures];
    updated[index].ignored = true;
    updated[index].approved = false;
    setAiScriptures(updated);
    setSuccessToast(`Dismissed scripture suggestion`);
  };

  // Open inline modal / details for editing the AI scripture text before launching
  const handleOpenEditAiVerse = (index: number) => {
    const scripture = aiScriptures[index];
    setAiEditingIndex(index);
    setAiEditRef(scripture.reference);
    setAiEditText(scripture.text);
    setIsAIEduMode(true);
  };

  const handleSaveEditedAiVerse = () => {
    if (aiEditingIndex === null) return;
    const updated = [...aiScriptures];
    updated[aiEditingIndex] = {
      ...updated[aiEditingIndex],
      reference: aiEditRef,
      text: aiEditText,
      confidence: 1.0 // Operator corrected
    };
    setAiScriptures(updated);
    setIsAIEduMode(false);
    setAiEditingIndex(null);
    setSuccessToast("Scripture template altered. Ready to Approve!");
  };

  // Modify active service details inline
  const handleSaveTimelineItemDetails = () => {
    if (!editingItem) return;
    const updated = serviceItems.map(item => item.id === editingItem.id ? editingItem : item);
    setServiceItems(updated);
    setEditingItem(null);
    setSuccessToast("Timeline item parameters altered.");
  };

  // Quick helper to insert service item
  const handleAddNewTimelineItem = () => {
    const newId = `item-${Date.now()}`;
    const newItem: ServiceItem = {
      id: newId,
      title: "Interactive Prayer / Song",
      duration: "10 min",
      status: "pending",
      notes: "Custom visual slide segment",
      slides: [{ text: "Enter custom meditation lyrics or reference here." }]
    };
    setServiceItems([...serviceItems, newItem]);
    setActiveItemId(newId);
    setActiveSlideIndex(0);
    setSuccessToast("Added custom segment to Service Flow.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col overflow-x-hidden">
      
      {/* Top Banner Control Room Header */}
      <header className="border-b border-sky-100 bg-white py-3.5 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm shadow-sky-100/30">
        <div className="flex items-center space-x-3">
          {/* Virtual LED */}
          <div className="h-4 w-4 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.3)] flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-blue-950 font-display font-black text-2xl tracking-tighter">LITE WORSHIP</span>
              <span className="text-[10px] font-mono bg-sky-50 border border-sky-200 text-sky-700 font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                v2.1 AI-Engine LIVE
              </span>
            </div>
            <p className="text-xs text-sky-700/80 font-medium">Church Presentation & AI-powered Sermon Listening Hub</p>
          </div>
        </div>

        {/* Real-time speech simulator controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* simulated input audio meter */}
          {isAiListening && (
            <div className="hidden md:flex items-center space-x-1.5 bg-sky-50 border border-sky-100 px-3 py-1.5 rounded-md">
              <Volume2 className="h-3.5 w-3.5 text-sky-600 animate-bounce" />
              <div className="flex items-end space-x-0.5 h-3">
                {[1, 2, 3, 4, 5, 6].map((bar) => {
                  const barHeight = Math.max(15, (audioMeter * (bar / 6)) % 100);
                  return (
                    <div 
                      key={bar} 
                      style={{ height: `${barHeight}%` }} 
                      className="w-1 bg-sky-500 rounded-t transition-all duration-300"
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-mono text-sky-700 font-bold uppercase tracking-wider">
                Sermon Mic Active
              </span>
            </div>
          )}

          {/* AI Microphone Toggle Switch */}
          <button
            onClick={() => {
              setIsAiListening(!isAiListening);
              setSuccessToast(isAiListening ? "Sermon listening paused" : "Sermon mic resumed");
            }}
            id="toggle-mic-listening"
            className={`flex items-center space-x-1.5 text-xs font-mono font-bold uppercase px-3 py-1.5 rounded transition-all cursor-pointer ${
              isAiListening 
                ? "bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100" 
                : "bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {isAiListening ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            <span>{isAiListening ? "Mute Pastor Mic" : "Hear Sermon Mic"}</span>
          </button>
          
          <div className="h-5 w-[1px] bg-slate-200" />

          {/* Quick theme header clock */}
          <div className="hidden lg:block text-right">
            <div className="text-xs font-mono text-slate-600 font-semibold">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Operator Desk</div>
          </div>
        </div>
      </header>

      {/* Success Notifications Toast */}
      {successToast && (
        <div className="bg-sky-50 border-b border-sky-100 text-sky-800 px-4 py-2.5 text-xs flex items-center justify-between z-50 shadow-sm select-none">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-spin" />
            <span className="font-mono font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-sky-400 hover:text-sky-600 font-mono text-lg font-bold px-1.5">×</button>
        </div>
      )}

      {/* Main Grid: Control Station on Left, Congregational output on Right */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-5 p-4 sm:p-5 overflow-hidden">
        
        {/* ======================================= */}
        {/* LEFT PANEL: Media Operator Control Room */}
        {/* ======================================= */}
        <div className="xl:col-span-7 flex flex-col space-y-4 overflow-y-auto pr-0 xl:pr-1" id="operator-workspace">
          
          {/* Row 1: Interactive Service Flow Steps & Pastor Mic Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Timeline Column */}
            <div className="bg-white border border-sky-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-1.5 text-sky-950">
                    <Clock className="h-4 w-4 text-sky-600" />
                    <h2 className="text-xs font-display font-black uppercase tracking-wider text-sky-900">
                      SERVICE TIMELINE FLOW
                    </h2>
                  </div>
                  <button 
                    onClick={handleAddNewTimelineItem}
                    className="p-1 px-2.5 rounded bg-sky-50 hover:bg-sky-100 border border-sky-100 text-[10px] text-sky-600 hover:text-sky-700 font-bold uppercase flex items-center space-x-1 transition-all cursor-pointer"
                    id="btn-add-timeline-item"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Segment</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {serviceItems.map((item, index) => {
                    const isActive = item.id === activeItemId;
                    const isWorship = item.title.toLowerCase().includes("worship") || item.id === "item-2";
                    
                    return (
                      <div
                        key={item.id}
                        id={`timeline-item-${item.id}`}
                        onClick={() => handleSelectServiceItem(item.id)}
                        className={`group relative p-2.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between ${
                          isActive 
                            ? "bg-sky-50 border-sky-400 text-sky-900 font-medium shadow-sm shadow-sky-50/50" 
                            : "bg-white border-slate-100 text-slate-700 hover:bg-sky-50/50 hover:border-sky-200"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-mono font-bold ${isActive ? "text-sky-600" : "text-slate-400"}`}>
                            0{index + 1}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold tracking-wide">{item.title}</span>
                              {isWorship && (
                                <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-200 px-1 py-0.2 rounded font-mono font-semibold">
                                  LYRICS LINK
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block leading-tight truncate max-w-[180px]">
                              {item.notes}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">{item.duration}</span>
                          <div className="flex items-center">
                            {item.status === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                            {item.status === 'active' && <div className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />}
                            {item.status === 'pending' && <div className="h-2 w-2 rounded-full bg-slate-300" />}
                          </div>
                          
                          {/* edit flow meta */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-slate-800 text-slate-400 hover:bg-slate-100 rounded transition-all cursor-pointer"
                            title="Edit Segment"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edit timeline Segment form */}
              {editingItem && (
                <div className="mt-3 p-3 bg-slate-50 border border-sky-100 rounded-lg text-xs space-y-2">
                  <span className="font-mono text-[10px] text-sky-700 font-bold uppercase block">
                    EDIT TIMELINE METADATA:
                  </span>
                  <div className="space-y-1.5">
                    <input 
                      type="text" 
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="Title"
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:border-sky-400 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={editingItem.duration}
                        onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                        placeholder="Duration"
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:border-sky-400 focus:outline-none"
                      />
                      <select
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                        className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:border-sky-400 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <textarea 
                      value={editingItem.notes}
                      onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                      placeholder="Segment notes & instructions"
                      className="w-full h-11 bg-white border border-slate-200 rounded p-1.5 text-[11px] text-slate-800 focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-1.5">
                    <button 
                      onClick={() => setEditingItem(null)}
                      className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveTimelineItemDetails}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold cursor-pointer"
                    >
                      Save Parameters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Sermon Transcript Simulation Card */}
            <div className="bg-white border border-sky-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-sky-600" />
                    <h2 className="text-xs font-display font-black uppercase tracking-wider text-sky-900">
                      LIVE SERMON TRANSCRIPT PARSER
                    </h2>
                  </div>
                  {isAiListening ? (
                    <span className="flex items-center text-[9px] font-mono font-bold text-rose-600 uppercase tracking-widest gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Capturing
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400">PAUSED</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                  Type speech manually below or click preset sermon triggers to query Gemini AI for scripture references and song suggestions in real-time.
                </p>

                <div className="space-y-2">
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => triggerPresetSermon('forgiveness')}
                      className="p-1 px-2 text-[9px] font-mono bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/50 rounded transition-all cursor-pointer"
                      id="btn-preset-forgiveness"
                    >
                      + Sermon forgiveness comments
                    </button>
                    <button
                      onClick={() => triggerPresetSermon('faith')}
                      className="p-1 px-2 text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100/50 rounded transition-all cursor-pointer"
                      id="btn-preset-faith"
                    >
                      + Sermon faith speech
                    </button>
                    <button
                      onClick={() => triggerPresetSermon('anxiety')}
                      className="p-1 px-2 text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100/50 rounded transition-all cursor-pointer"
                      id="btn-preset-anxiety"
                    >
                      + Sermon anxious comments
                    </button>
                  </div>

                  <textarea
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    placeholder="E.g., 'Let us look at John 3:16 to see how God loves the world...' "
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100 leading-relaxed resize-none font-sans"
                    id="textarea-sermon-transcript"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  Active sermon topic: <strong className="text-sky-600 font-bold">{aiTopic || "Awaiting Sermon"}</strong>
                </span>
                <button
                  onClick={() => analyzeSermonTranscript(transcriptInput)}
                  disabled={isAiAnalyzing || !queryNotEmpty(transcriptInput)}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  id="btn-analyze-transcript"
                >
                  {isAiAnalyzing ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      <span>Extract Scriptures</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Row 2: AI Suggestions Sidebar + Scripture Search bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AI Real-time Detections list */}
            <div className="bg-white border border-sky-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-sky-600" />
                    <h2 className="text-xs font-display font-black uppercase tracking-wider text-sky-900">
                      AI SUGGESTED BIBLE REFERENCES ({aiScriptures.length})
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Confidence Queue</span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {aiScriptures.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      <HelpCircle className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-500 font-mono">No scriptures captured yet.</p>
                      <p className="text-[10px] text-slate-400 px-3">Press preset triggers above to simulate active feed.</p>
                    </div>
                  ) : (
                    aiScriptures.map((item, idx) => {
                      if (item.ignored) return null;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border border-sky-100 bg-sky-50/20 transition-all ${
                            item.approved 
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950" 
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-black tracking-wide">{item.reference}</span>
                              {item.approved && (
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                                  LIVE NOW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold">
                              {(item.confidence * 100).toFixed(0)}% score
                            </span>
                          </div>
                          
                          <p className="text-xs italic text-slate-600 leading-relaxed mb-3">
                            &ldquo;{item.text}&rdquo;
                          </p>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveAiVerse(idx)}
                              className="flex-1 bg-sky-600 hover:bg-sky-500 disabled:bg-emerald-100 disabled:text-emerald-700 text-white text-[10px] font-bold py-1.5 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              disabled={item.approved}
                              id={`approve-ai-verse-${idx}`}
                            >
                              {item.approved ? <Check className="h-3 w-3" /> : null}
                              <span>{item.approved ? "Approved" : "Approve & Present"}</span>
                            </button>
                            
                            <button
                              onClick={() => handleOpenEditAiVerse(idx)}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1.5 rounded uppercase font-mono cursor-pointer border border-slate-200"
                              id={`edit-ai-verse-${idx}`}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleIgnoreAiVerse(idx)}
                              className="p-1 px-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 text-[10px] font-bold py-1.5 rounded uppercase font-mono cursor-pointer border border-slate-200"
                              id={`ignore-ai-verse-${idx}`}
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* AI suggestion inline editor modal */}
              {isAIEduMode && (
                <div className="mt-3 p-3.5 bg-sky-50 border border-sky-100 rounded-lg text-xs space-y-2.5 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-sky-700 font-bold uppercase">
                      CRITICAL EDIT PRIOR TO APPROVAL:
                    </span>
                    <button onClick={() => setIsAIEduMode(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">&times;</button>
                  </div>
                  <div className="space-y-1.5">
                    <input 
                      type="text" 
                      value={aiEditRef} 
                      onChange={(e) => setAiEditRef(e.target.value)}
                      placeholder="Scripture reference (e.g. Genesis 1:1)"
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                    />
                    <textarea 
                      value={aiEditText} 
                      onChange={(e) => setAiEditText(e.target.value)}
                      placeholder="Scripture body text"
                      className="w-full h-16 bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-100"
                    />
                  </div>
                  <div className="flex justify-end space-x-1.5">
                    <button 
                      onClick={() => setIsAIEduMode(false)}
                      className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 cursor-pointer animate-smooth"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={handleSaveEditedAiVerse}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold cursor-pointer animate-smooth"
                    >
                      Save Version
                    </button>
                  </div>
                </div>
              )}

              {/* AI Song recommendation matches from sermon */}
              {aiSongSuggestions.length > 0 && (
                <div className="mt-3.5 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center space-x-1 text-slate-500 mb-1.5">
                    <Music className="h-3 w-3" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 font-semibold">
                      AI SUGGESTED SONGS (THEMATIC MATCH)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {aiSongSuggestions.slice(0, 2).map((song, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          const matchingStandardSong = WORSHIP_SONGS.find(s => s.title.toLowerCase().includes(song.title.toLowerCase()));
                          if (matchingStandardSong) {
                            setSelectedSongId(matchingStandardSong.id);
                            setSelectedSongPartsIndex(0);
                            setSuccessToast(`Switched presentation search to match suggested: ${song.title}`);
                          } else {
                            setSuccessToast(`AI match song "${song.title}" selected. Use quick presentation.`);
                          }
                        }}
                        className="bg-sky-50/40 hover:bg-sky-50 shadow-sm border border-sky-100 p-2 rounded cursor-pointer transition-all text-left"
                      >
                        <div className="font-bold text-[10px] text-sky-700 leading-tight">{song.title}</div>
                        <p className="text-[8px] text-slate-500 leading-tight block mt-0.5 max-h-6 overflow-hidden">
                          {song.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Scripture Finder */}
            <div className="bg-white border border-sky-100 rounded-xl p-4 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  <Search className="h-4 w-4 text-slate-500" />
                  <h2 className="text-xs font-display font-black uppercase tracking-wider text-slate-900">
                    SCRIPTURE SEMANTIC SEARCH
                  </h2>
                </div>
                
                <form onSubmit={handleSearchVerse} className="relative mb-3">
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search e.g. John 3:16 or 'faith is assurance'"
                     className="w-full bg-slate-50 border border-slate-200 placeholder-slate-450 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-sky-100 focus:border-sky-400 text-slate-800 focus:outline-none"
                     id="input-scripture-search-query"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 hover:text-sky-600 text-slate-400 transition-colors cursor-pointer"
                    id="btn-scripture-search-submit"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </form>

                {isSearching && (
                  <div className="text-center py-6 text-xs text-slate-500 flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-sky-500" />
                    <span>Searching celestial databases...</span>
                  </div>
                )}

                {searchError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-750 text-xs flex items-start space-x-1.5">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                {searchResult && (
                  <div className="bg-sky-50/40 border border-sky-100 rounded-lg p-3 space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-extrabold text-sky-700 uppercase tracking-wide">
                        {searchResult.reference}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 font-medium">{searchResult.translation}</span>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-slate-600 italic">
                      &ldquo;{searchResult.text}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handlePresentVerseDirect(searchResult.reference, searchResult.text)}
                        className="bg-sky-600 hover:bg-sky-500 text-white py-1.5 rounded uppercase font-bold text-center cursor-pointer"
                        id="btn-present-search-result"
                      >
                        Present Live Now
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSearchResultToTimeline}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 rounded uppercase font-bold text-center cursor-pointer border border-slate-200"
                        id="btn-add-search-to-timeline"
                      >
                        Add to Timeline
                      </button>
                    </div>
                  </div>
                )}

                {!searchResult && !isSearching && (
                  <div className="p-3 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 text-slate-400 text-center py-9">
                    <HelpCircle className="h-5 w-5 mx-auto mb-1 text-slate-400" />
                    <p className="text-[10px] font-mono uppercase tracking-wide">Enter scripture parameters</p>
                    <p className="text-[9px] text-slate-400 px-2 mt-0.5">Example: "Romans 8:28" to query fully translated texts.</p>
                  </div>
                )}
              </div>

              {/* Instant guidelines */}
              <div className="mt-3 text-[10px] bg-sky-50 border border-sky-100 rounded p-2 text-sky-700 leading-normal flex items-start space-x-1 font-medium">
                <Sliders className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <span>Search hits dynamic server API, and pulls standard translation instantly for flawless worship slide presentation.</span>
              </div>
            </div>

          </div>

          {/* Row 3: Song / Lyric slides Selector of selected song */}
          <div className="bg-white border border-sky-100 shadow-sm rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <Music className="h-4.5 w-4.5 text-sky-600" />
                <div>
                  <h3 className="text-xs font-display font-black uppercase tracking-wider text-slate-900">
                    WORSHIP SONG & LYRICS CONTROLLER
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs font-bold text-slate-800">Active song bank:</span>
                    <select
                      value={selectedSongId}
                      onChange={(e) => {
                        setSelectedSongId(e.target.value);
                        setSelectedSongPartsIndex(0);
                        // Also automatically select the index inside the current slide list if currently displaying worship!
                        setActiveSlideIndex(0);
                        setSuccessToast(`Congregation presentation set to: ${WORSHIP_SONGS.find(s => s.id === e.target.value)?.title}`);
                      }}
                      className="bg-sky-50 border border-sky-150 rounded px-2.5 py-1 text-xs text-sky-800 font-bold focus:outline-none font-sans"
                      id="select-active-song"
                    >
                      {WORSHIP_SONGS.map(song => (
                        <option key={song.id} value={song.id}>
                          {song.title} — {song.author}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Indicator if worship item is selected to inform operator */}
              {getActiveItem()?.id !== "item-2" && (
                <div 
                  onClick={() => handleSelectServiceItem("item-2")}
                  className="bg-amber-50 hover:bg-amber-100/50 border border-amber-200 text-amber-800 text-[10px] px-2.5 py-1.5 rounded cursor-pointer transition-all uppercase tracking-wider font-mono font-bold animate-pulse"
                >
                  ⚠️ Connect Lyrics Screen to Projector
                </div>
              )}
            </div>

            {/* Lyric slide tiles preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(() => {
                const song = WORSHIP_SONGS.find(s => s.id === selectedSongId);
                if (!song) return null;
                return song.slides.map((stanzaLines, stanzaIdx) => {
                  const isCurrentDisplayStanza = activeItemId === "item-2" && activeSlideIndex === stanzaIdx && !blackoutActive && !showLogoActive;
                  
                  return (
                    <div
                      key={stanzaIdx}
                      onClick={() => {
                        // Force timeline to Worship section
                        if (activeItemId !== "item-2") {
                          setActiveItemId("item-2");
                        }
                        setActiveSlideIndex(stanzaIdx);
                        setBlackoutActive(false);
                        setShowLogoActive(false);
                        setSuccessToast(`Page ${stanzaIdx + 1} lyric pane selected.`);
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all select-none h-28 flex flex-col justify-between shadow-sm ${
                        isCurrentDisplayStanza
                          ? "bg-sky-50 border-sky-400 text-sky-950 ring-1 ring-sky-300"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-sky-300 hover:bg-slate-100/60"
                      }`}
                      id={`lyric-card-${selectedSongId}-${stanzaIdx}`}
                    >
                      <div>
                        {stanzaLines[0]?.startsWith("[") ? (
                          <span className="text-[8px] font-mono tracking-widest text-sky-600 uppercase block mb-1 font-bold">
                            {stanzaLines[0]}
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono text-slate-400 font-bold block mb-1">
                            STANZA {stanzaIdx + 1}
                          </span>
                        )}
                        <p className="text-[10px] line-clamp-3 leading-normal font-serif">
                          {stanzaLines.filter(l => !l.startsWith("[")).slice(0, 3).join(" / ")}
                        </p>
                      </div>

                      <div className="text-[8px] font-mono text-slate-400 flex justify-between items-center mt-1">
                        <span>Click to present</span>
                        {isCurrentDisplayStanza && <span className="text-sky-600 font-bold">• ON SCREEN</span>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Operator Action Hot Keys & slide selector panel */}
          <div className="bg-white border border-sky-100 shadow-sm rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Previous slide control */}
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex <= 0}
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100/80 disabled:opacity-30 disabled:pointer-events-none py-3 px-2 rounded-lg text-xs font-bold uppercase text-slate-700 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              id="btn-prev-slide"
            >
              <ChevronLeft className="h-4 w-4 text-slate-550" />
              <span className="text-[10px] tracking-wider">Prev Slide</span>
            </button>

            {/* Next slide control */}
            <button
              onClick={handleNextSlide}
              disabled={activeSlideIndex >= slides.length - 1}
              className="bg-sky-600 border border-sky-500 hover:bg-sky-500 disabled:opacity-30 disabled:pointer-events-none py-3 px-2 rounded-lg text-xs font-bold uppercase text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              id="btn-next-slide"
            >
              <ChevronRight className="h-4 w-4 text-white" />
              <span className="text-[10px] tracking-wider">Next Slide</span>
            </button>

            {/* Black screen blackout toggle */}
            <button
              onClick={() => {
                setBlackoutActive(!blackoutActive);
                setSuccessToast(blackoutActive ? "Congregation view restored" : "Blackout screen active");
              }}
              className={`border py-3 px-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                blackoutActive
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
              }`}
              id="btn-blackout-toggle"
            >
              <EyeOff className="h-4 w-4 animate-pulse" />
              <span className="text-[10px] tracking-wider">Black screen</span>
            </button>

            {/* Project church welcome logo */}
            <button
              onClick={() => {
                setShowLogoActive(!showLogoActive);
                setBlackoutActive(false);
                setSuccessToast("Logo theme projected live");
              }}
              className={`border py-3 px-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                showLogoActive
                  ? "bg-amber-50 border-amber-300 text-amber-800"
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700"
              }`}
              id="btn-show-logo-toggle"
            >
              <Image className="h-4 w-4" />
              <span className="text-[10px] tracking-wider">Show Logo</span>
            </button>
          </div>

        </div>

        {/* ======================================= */}
        {/* RIGHT PANEL: Live Congregation Screen  */}
        {/* ======================================= */}
        <div className="xl:col-span-5 flex flex-col h-full space-y-4">
          <div className="flex-1 flex flex-col justify-between">
            
            {/* The projector output mockup screen */}
            <div className="flex-1 lg:max-h-[700px]">
              <LivePreview 
                slideState={currentPresentationState}
                onThemeChange={(newTheme) => {
                  setBackdropTheme(newTheme);
                  setSuccessToast(`Background set to: ${newTheme}`);
                }}
              />
            </div>

            {/* Interactive guidelines helper overlay box */}
            <div className="bg-white border border-sky-100 shadow-sm rounded-xl p-4 mt-4 text-xs space-y-3">
              <span className="text-[10px] uppercase font-display font-black tracking-wider text-sky-900 block">
                SYSTEM INSTRUCTION GUIDE (MEDIA DESK)
              </span>
              <ul className="space-y-1.5 text-slate-600 pl-1.5 text-[11px] leading-relaxed list-none font-medium">
                <li className="flex items-center gap-1 px-1.5 py-1 rounded bg-amber-50/50 border border-amber-100/50">
                  <span className="text-amber-600 mr-1.5">●</span>
                  <span>Use the <strong>Fullscreen PIN</strong> button inside the live preview output when running a multi-projector setup during church services.</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-sky-500 mr-1.5">●</span>
                  <span>Press <strong>Extract Scriptures</strong> to feed pastor's spoken commentary to Gemini AI, returning exact scripture matching references.</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-sky-500 mr-1.5">●</span>
                  <span>Select any segment on <strong>Service Timeline</strong> to review related guides, annotations, or launch slide stanzas.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </main>

      {/* Footer Branding Margins */}
      <footer className="border-t border-sky-100 bg-white py-3.5 px-4 flex justify-between items-center text-xs text-slate-500 font-mono">
        <div>
          <span>MEDIA DESK CONTROLS — CONNECTED SECURE</span>
        </div>
        <div>
          <span>LITE WORSHIP SYSTEM v2.1</span>
        </div>
      </footer>
    </div>
  );
}

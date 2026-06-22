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
import ServiceDesignerHome from "./components/ServiceDesignerHome";

export default function App() {
  // --- Service State ---
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>(DEFAULT_SERVICE_FLOW);
  const [currentView, setCurrentView] = useState<'home' | 'desk'>('home');
  const [serviceTitle, setServiceTitle] = useState<string>("Sunday Celebrations");
  const [speakerName, setSpeakerName] = useState<string>("Pastor David");
  const [activeItemId, setActiveItemId] = useState<string>("item-2"); // Default to worship session
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  
  // --- Live Presentation State ---
  const [backdropTheme, setBackdropTheme] = useState<string>("ambient-worship");
  const [blackoutActive, setBlackoutActive] = useState<boolean>(false);
  const [showLogoActive, setShowLogoActive] = useState<boolean>(false);
  
  // --- Selected Worship Song State ---
  const [selectedSongId, setSelectedSongId] = useState<string>("song-2"); // Default to Goodness of God
  const [selectedSongPartsIndex, setSelectedSongPartsIndex] = useState<number>(0);
  const [songSearchQuery, setSongSearchQuery] = useState<string>("");
  const [activeLyricTab, setActiveLyricTab] = useState<'all' | 'chorus' | 'verse' | 'lines'>('all');

  // --- Search Verse State ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{ reference: string; text: string; translation: string } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [bibleTranslation, setBibleTranslation] = useState<string>("ESV"); // Default to ESV, selectable: KJV, NIV, GOODNEWS, AMP, NASB

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
        body: JSON.stringify({ query: searchQuery, translation: bibleTranslation })
      });
      const data = await res.json();
      if (res.ok && data.reference) {
        setSearchResult(data);
        setSuccessToast(`Found verse reference: ${data.reference} (${data.translation || bibleTranslation})`);
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
        let text = match.text;
        const targetTr = bibleTranslation.toUpperCase();
        if (targetTr === "KJV" && match.reference === "John 3:16") {
          text = "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.";
        } else if (targetTr === "NIV" && match.reference === "John 3:16") {
          text = "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.";
        } else if (targetTr === "GOODNEWS" && match.reference === "John 3:16") {
          text = "For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life.";
        } else if (targetTr === "KJV" && match.reference === "Matthew 6:12") {
          text = "And forgive us our debts, as we forgive our debtors.";
        } else if (targetTr === "GOODNEWS" && match.reference === "Matthew 6:12") {
          text = "Forgive us our debts, as we also have forgiven our debtors.";
        }

        setSearchResult({
          reference: match.reference,
          text: text,
          translation: `${targetTr} (Local Mock)`
        });
        setSuccessToast(`Found local fallback: ${match.reference} (${targetTr})`);
      } else {
        setSearchError(`No matching Bible verses found in AI databases or local indices for ${bibleTranslation}. Try John 3:16, Romans 8:28, or Matthew 6:33.`);
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
    <div className="min-h-screen bg-space-bg text-slate-200 font-sans flex flex-col overflow-x-hidden">
      
      {/* Top Banner Control Room Header */}
      <header className="border-b border-tech-border bg-panel-dark py-3.5 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          {/* Virtual LED */}
          <div className="h-4 w-4 rounded-full bg-neon-blue shadow-[0_0_8px_rgba(59,130,246,0.5)] flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-white font-display font-black text-2xl tracking-tighter">LITE <span className="text-neon-blue">WORSHIP</span></span>
              <span className="text-[9px] font-mono bg-panel-mid border border-tech-border text-neon-blue font-bold px-2 py-0.5 rounded tracking-widest uppercase">
                v2.1 AI-Engine LIVE
              </span>
            </div>
            <p className="text-xs text-sovereign-amber font-mono font-bold">
              Active Focus: <span className="text-neon-blue uppercase">{serviceTitle}</span> {speakerName ? `— Spkr: ${speakerName}` : ""}
            </p>
          </div>
        </div>

        {/* Real-time speech simulator controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Dynamic perspective toggler tool */}
          <button
            onClick={() => {
              const goingToDesk = currentView === 'home';
              setCurrentView(goingToDesk ? 'desk' : 'home');
              setSuccessToast(goingToDesk ? "Worship Operator desk launched!" : "Service Setup Designer loaded.");
            }}
            id="btn-switch-perspective"
            className={`flex items-center space-x-1.5 text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-lg shadow-sm border transition-all cursor-pointer ${
              currentView === 'home'
                ? "bg-neon-blue border-blue-500 text-white hover:bg-blue-600"
                : "bg-panel-mid border-tech-border text-sovereign-amber hover:bg-panel-light"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{currentView === 'home' ? "Launch Operator Desk" : "Return to Designer"}</span>
          </button>

          <div className="h-5 w-[1px] bg-tech-border" />

          {/* simulated input audio meter */}
          {isAiListening && (
            <div className="hidden md:flex items-center space-x-1.5 bg-panel-mid border border-tech-border px-3 py-1.5 rounded-md">
              <Volume2 className="h-3.5 w-3.5 text-neon-blue animate-bounce" />
              <div className="flex items-end space-x-0.5 h-3">
                {[1, 2, 3, 4, 5, 6].map((bar) => {
                  const barHeight = Math.max(15, (audioMeter * (bar / 6)) % 100);
                  return (
                    <div 
                      key={bar} 
                      style={{ height: `${barHeight}%` }} 
                      className="w-1 bg-neon-blue rounded-t transition-all duration-300"
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-mono text-neon-blue font-bold uppercase tracking-wider">
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
                ? "bg-rose-950/40 border border-rose-500/40 text-rose-400 hover:bg-rose-900/30" 
                : "bg-panel-mid border border-tech-border text-slate-400 hover:bg-panel-light"
            }`}
          >
            {isAiListening ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            <span>{isAiListening ? "Mute Pastor Mic" : "Hear Sermon Mic"}</span>
          </button>
          
          <div className="h-5 w-[1px] bg-tech-border" />

          {/* Quick theme header clock */}
          <div className="hidden lg:block text-right">
            <div className="text-xs font-mono text-slate-300 font-semibold">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Operator Desk</div>
          </div>
        </div>
      </header>

      {/* Success Notifications Toast */}
      {successToast && (
        <div className="bg-panel-dark border-b border-tech-border text-slate-300 px-4 py-2.5 text-xs flex items-center justify-between z-50 shadow-md select-none">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-3.5 w-3.5 text-neon-blue animate-spin" />
            <span className="font-mono font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-neon-blue hover:text-blue-400 font-mono text-lg font-bold px-1.5">×</button>
        </div>
      )}

      {/* Dynamic View Swapper */}
      {currentView === "home" ? (
        <ServiceDesignerHome
          serviceItems={serviceItems}
          onChangeServiceItems={setServiceItems}
          selectedSongId={selectedSongId}
          onChangeSelectedSong={setSelectedSongId}
          serviceTitle={serviceTitle}
          onChangeServiceTitle={setServiceTitle}
          speakerName={speakerName}
          onChangeSpeakerName={setSpeakerName}
          worshipSongs={WORSHIP_SONGS}
          onLaunch={() => {
            setCurrentView("desk");
            setSuccessToast("Welcome to the Active Presentation Operator Desk!");
          }}
        />
      ) : (
        <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-5 p-4 sm:p-5 overflow-hidden">
        
        {/* ======================================= */}
        {/* LEFT PANEL: Media Operator Control Room */}
        {/* ======================================= */}
        <div className="xl:col-span-7 flex flex-col space-y-4 overflow-y-auto pr-0 xl:pr-1" id="operator-workspace">
          
          {/* Row 1: Interactive Service Flow Steps & Pastor Mic Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Timeline Column */}
            <div className="bg-panel-dark border border-tech-border rounded-xl p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-1.5 text-slate-200">
                    <Clock className="h-4 w-4 text-neon-blue" />
                    <h2 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                      SERVICE TIMELINE FLOW
                    </h2>
                  </div>
                  <button 
                    onClick={handleAddNewTimelineItem}
                    className="p-1 px-2.5 rounded bg-panel-mid hover:bg-panel-light border border-tech-border text-[10px] text-neon-blue font-bold uppercase flex items-center space-x-1 transition-all cursor-pointer"
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
                            ? "bg-panel-light border-neon-blue text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse" 
                            : "bg-panel-dark border-tech-border text-slate-400 hover:bg-panel-mid hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`text-[10px] font-mono font-bold ${isActive ? "text-neon-blue" : "text-slate-500"}`}>
                            0{index + 1}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold tracking-wide text-slate-100">{item.title}</span>
                              {isWorship && (
                                <span className="text-[8px] bg-sovereign-amber/10 text-sovereign-amber border border-sovereign-amber/20 px-1 py-0.2 rounded font-mono font-semibold">
                                  LYRICS LINK
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-450 block leading-tight truncate max-w-[180px]">
                              {item.notes}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">{item.duration}</span>
                          <div className="flex items-center">
                            {item.status === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                            {item.status === 'active' && <div className="h-2 w-2 rounded-full bg-neon-blue animate-ping" />}
                            {item.status === 'pending' && <div className="h-2 w-2 rounded-full bg-slate-600" />}
                          </div>
                          
                          {/* edit flow meta */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingItem(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-white text-slate-500 hover:bg-panel-light rounded transition-all cursor-pointer"
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
                <div className="mt-3 p-3 bg-panel-mid border border-tech-border rounded-lg text-xs space-y-2">
                  <span className="font-mono text-[9px] text-neon-blue font-bold uppercase block">
                    EDIT TIMELINE METADATA:
                  </span>
                  <div className="space-y-1.5">
                    <input 
                      type="text" 
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="Title"
                      className="w-full bg-panel-dark border border-tech-border rounded px-2.5 py-1 text-xs text-white focus:border-neon-blue focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={editingItem.duration}
                        onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                        placeholder="Duration"
                        className="bg-panel-dark border border-tech-border rounded px-2.5 py-1 text-xs text-white focus:border-neon-blue focus:outline-none"
                      />
                      <select
                        value={editingItem.status}
                        onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                        className="bg-panel-dark border border-tech-border rounded px-2.5 py-1 text-xs text-slate-300 focus:border-neon-blue focus:outline-none"
                      >
                        <option value="pending" className="bg-panel-dark text-slate-300">Pending</option>
                        <option value="active" className="bg-panel-dark text-slate-300">Active</option>
                        <option value="completed" className="bg-panel-dark text-slate-300">Completed</option>
                      </select>
                    </div>
                    <textarea 
                      value={editingItem.notes}
                      onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                      placeholder="Segment notes & instructions"
                      className="w-full h-11 bg-panel-dark border border-tech-border rounded p-1.5 text-[11px] text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-1.5">
                    <button 
                      onClick={() => setEditingItem(null)}
                      className="px-2.5 py-1 bg-panel-light border border-tech-border text-slate-300 hover:text-white rounded hover:bg-panel-mid cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveTimelineItemDetails}
                      className="px-2.5 py-1 bg-neon-blue hover:bg-blue-600 text-white rounded font-bold cursor-pointer"
                    >
                      Save Parameters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* AI Sermon Transcript Simulation Card */}
            <div className="bg-panel-dark border border-tech-border rounded-xl p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-neon-blue" />
                    <h2 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                      LIVE SERMON TRANSCRIPT PARSER
                    </h2>
                  </div>
                  {isAiListening ? (
                    <span className="flex items-center text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Capturing
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 font-bold">PAUSED</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                  Type speech manually below or click preset sermon triggers to query Gemini AI for scripture references and song suggestions in real-time.
                </p>

                <div className="space-y-2">
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => triggerPresetSermon('forgiveness')}
                      className="p-1 px-2 text-[9px] font-mono bg-sovereign-amber/10 text-sovereign-amber border border-sovereign-amber/30 hover:bg-sovereign-amber/20 rounded transition-all cursor-pointer"
                      id="btn-preset-forgiveness"
                    >
                      + Sermon forgiveness comments
                    </button>
                    <button
                      onClick={() => triggerPresetSermon('faith')}
                      className="p-1 px-2 text-[9px] font-mono bg-neon-blue/10 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/20 rounded transition-all cursor-pointer"
                      id="btn-preset-faith"
                    >
                      + Sermon faith speech
                    </button>
                    <button
                      onClick={() => triggerPresetSermon('anxiety')}
                      className="p-1 px-2 text-[9px] font-mono bg-neon-blue/10 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/20 rounded transition-all cursor-pointer"
                      id="btn-preset-anxiety"
                    >
                      + Sermon anxious comments
                    </button>
                  </div>

                  <textarea
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    placeholder="E.g., 'Let us look at John 3:16 to see how God loves the world...' "
                    className="w-full h-24 bg-panel-mid border border-tech-border rounded-lg p-2.5 text-xs text-white placeholder-slate-650 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/20 leading-relaxed resize-none font-sans"
                    id="textarea-sermon-transcript"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  Active sermon topic: <strong className="text-neon-blue font-bold">{aiTopic || "Awaiting Sermon"}</strong>
                </span>
                <button
                  onClick={() => analyzeSermonTranscript(transcriptInput)}
                  disabled={isAiAnalyzing || !queryNotEmpty(transcriptInput)}
                  className="px-3.5 py-1.5 bg-neon-blue hover:bg-blue-600 disabled:bg-panel-mid disabled:text-slate-600 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                  id="btn-analyze-transcript"
                >
                  {isAiAnalyzing ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin text-neon-blue" />
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
            <div className="bg-panel-dark border border-tech-border rounded-xl p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-neon-blue" />
                    <h2 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                      AI SUGGESTED BIBLE REFERENCES ({aiScriptures.length})
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">Confidence Queue</span>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {aiScriptures.length === 0 ? (
                    <div className="text-center py-8 bg-panel-mid/30 rounded-lg border border-dashed border-tech-border">
                      <HelpCircle className="h-6 w-6 text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs text-slate-400 font-mono">No scriptures captured yet.</p>
                      <p className="text-[10px] text-slate-500 px-3">Press preset triggers above to simulate active feed.</p>
                    </div>
                  ) : (
                    aiScriptures.map((item, idx) => {
                      if (item.ignored) return null;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border transition-all ${
                            item.approved 
                              ? "bg-emerald-950/20 border-emerald-500/55 text-emerald-200" 
                              : "bg-panel-mid border-tech-border text-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-black tracking-wide text-white">{item.reference}</span>
                              {item.approved && (
                                <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-mono font-bold uppercase px-1.5 py-0.5 rounded animate-pulse">
                                  LIVE NOW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">
                              {(item.confidence * 100).toFixed(0)}% score
                            </span>
                          </div>
                          
                          <p className={`text-xs italic leading-relaxed mb-3 ${item.approved ? "text-emerald-300" : "text-slate-400"}`}>
                            &ldquo;{item.text}&rdquo;
                          </p>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApproveAiVerse(idx)}
                              className="flex-1 bg-neon-blue hover:bg-blue-600 disabled:bg-emerald-900/30 disabled:text-emerald-400 text-white text-[10px] font-bold py-1.5 rounded uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                              disabled={item.approved}
                              id={`approve-ai-verse-${idx}`}
                            >
                              {item.approved ? <Check className="h-3 w-3" /> : null}
                              <span>{item.approved ? "Approved" : "Approve & Present"}</span>
                            </button>
                            
                            <button
                              onClick={() => handleOpenEditAiVerse(idx)}
                              className="p-1 px-2.5 bg-panel-light hover:bg-panel-mid text-slate-300 text-[10px] font-bold py-1.5 rounded uppercase font-mono cursor-pointer border border-tech-border"
                              id={`edit-ai-verse-${idx}`}
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleIgnoreAiVerse(idx)}
                              className="p-1 px-2.5 bg-panel-light hover:bg-rose-950/30 hover:border-rose-500/30 hover:text-rose-400 text-slate-450 text-[10px] font-bold py-1.5 rounded uppercase font-mono cursor-pointer border border-tech-border"
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
                <div className="mt-3 p-3.5 bg-panel-light border border-tech-border rounded-lg text-xs space-y-2.5 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-neon-blue font-bold uppercase">
                      CRITICAL EDIT PRIOR TO APPROVAL:
                    </span>
                    <button onClick={() => setIsAIEduMode(false)} className="text-slate-500 hover:text-white text-lg font-bold cursor-pointer">&times;</button>
                  </div>
                  <div className="space-y-1.5">
                    <input 
                      type="text" 
                      value={aiEditRef} 
                      onChange={(e) => setAiEditRef(e.target.value)}
                      placeholder="Scripture reference (e.g. Genesis 1:1)"
                      className="w-full bg-panel-dark border border-tech-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neon-blue"
                    />
                    <textarea 
                      value={aiEditText} 
                      onChange={(e) => setAiEditText(e.target.value)}
                      placeholder="Scripture body text"
                      className="w-full h-16 bg-panel-dark border border-tech-border rounded p-1.5 text-xs text-white focus:outline-none focus:border-neon-blue"
                    />
                  </div>
                  <div className="flex justify-end space-x-1.5">
                    <button 
                      onClick={() => setIsAIEduMode(false)}
                      className="px-2.5 py-1 bg-panel-mid border border-tech-border text-slate-300 rounded hover:bg-panel-light cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={handleSaveEditedAiVerse}
                      className="px-2.5 py-1 bg-neon-blue hover:bg-blue-600 text-white rounded font-bold cursor-pointer"
                    >
                      Save Version
                    </button>
                  </div>
                </div>
              )}

              {/* AI Song recommendation matches from sermon */}
              {aiSongSuggestions.length > 0 && (
                <div className="mt-3.5 border-t border-tech-border pt-2.5">
                  <div className="flex items-center space-x-1 text-slate-400 mb-1.5">
                    <Music className="h-3 w-3 text-neon-blue" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 font-semibold font-mono">
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
                        className="bg-panel-mid/60 hover:bg-panel-light shadow-2xl border border-tech-border p-2 rounded cursor-pointer transition-all text-left"
                      >
                        <div className="font-bold text-[10px] text-neon-blue leading-tight">{song.title}</div>
                        <p className="text-[8px] text-slate-400 leading-tight block mt-0.5 max-h-6 overflow-hidden">
                          {song.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Scripture Finder */}
            <div className="bg-panel-dark border border-tech-border rounded-xl p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-tech-border">
                  <div className="flex items-center space-x-1.5">
                    <Search className="h-4 w-4 text-neon-blue" />
                    <h2 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                      SCRIPTURE SEMANTIC SEARCH
                    </h2>
                  </div>
                  {/* Translation Selector block */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Version:</span>
                    <select
                      value={bibleTranslation}
                      onChange={(e) => {
                        setBibleTranslation(e.target.value);
                        setSuccessToast(`Bible translation set to: ${e.target.value}`);
                      }}
                      className="bg-panel-mid hover:bg-panel-light border border-tech-border rounded px-1.5 py-0.5 text-[9px] text-neon-blue font-bold focus:outline-none transition-colors cursor-pointer"
                      id="select-bible-translation"
                    >
                      <option value="ESV" className="bg-panel-dark text-slate-300">ESV (Standard)</option>
                      <option value="KJV" className="bg-panel-dark text-slate-300">KJV (King James)</option>
                      <option value="NIV" className="bg-panel-dark text-slate-300">NIV (N. International)</option>
                      <option value="GOODNEWS" className="bg-panel-dark text-slate-300">GOODNEWS (Good News)</option>
                      <option value="AMP" className="bg-panel-dark text-slate-300">AMP (Amplified)</option>
                      <option value="NASB" className="bg-panel-dark text-slate-300">NASB (New American)</option>
                    </select>
                  </div>
                </div>
                
                <form onSubmit={handleSearchVerse} className="relative mb-3">
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search e.g. John 3:16 or 'faith is assurance'"
                     className="w-full bg-panel-mid border border-tech-border placeholder-slate-600 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-neon-blue/25 focus:border-neon-blue text-white focus:outline-none"
                     id="input-scripture-search-query"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-2.5 hover:text-neon-blue text-slate-500 transition-colors cursor-pointer animate-smooth"
                    id="btn-scripture-search-submit"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </button>
                </form>

                {isSearching && (
                  <div className="text-center py-6 text-xs text-slate-400 flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-neon-blue" />
                    <span>Searching celestial databases...</span>
                  </div>
                )}

                {searchError && (
                  <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start space-x-1.5">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{searchError}</span>
                  </div>
                )}

                {searchResult && (
                  <div className="bg-panel-mid/80 border border-tech-border rounded-lg p-3 space-y-2 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-extrabold text-white uppercase tracking-wide">
                        {searchResult.reference}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 font-semibold">{searchResult.translation}</span>
                    </div>
                    
                    <p className="text-xs leading-relaxed text-slate-300 italic">
                      &ldquo;{searchResult.text}&rdquo;
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handlePresentVerseDirect(searchResult.reference, searchResult.text)}
                        className="bg-neon-blue hover:bg-blue-600 text-white py-1.5 rounded uppercase font-bold text-center cursor-pointer font-mono"
                        id="btn-present-search-result"
                      >
                        Present Live Now
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSearchResultToTimeline}
                        className="bg-panel-light hover:bg-panel-mid text-slate-300 py-1.5 rounded uppercase font-bold text-center cursor-pointer border border-tech-border font-mono hover:text-white"
                        id="btn-add-search-to-timeline"
                      >
                        Add to Timeline
                      </button>
                    </div>
                  </div>
                )}

                {!searchResult && !isSearching && (
                  <div className="p-3 bg-panel-mid/30 rounded-lg border border-dashed border-tech-border text-slate-500 text-center py-9">
                    <HelpCircle className="h-5 w-5 mx-auto mb-1 text-slate-600" />
                    <p className="text-[10px] font-mono uppercase tracking-wide text-slate-400">Enter scripture parameters</p>
                    <p className="text-[9px] text-slate-500 px-2 mt-0.5">Example: "Romans 8:28" to query fully translated texts.</p>
                  </div>
                )}
              </div>

              {/* Instant guidelines */}
              <div className="mt-3 text-[10px] bg-panel-light/35 border border-tech-border rounded p-2 text-slate-400 leading-normal flex items-start space-x-1.5 font-medium">
                <Sliders className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-neon-blue" />
                <span>Search hits dynamic server API, and pulls standard translation instantly for flawless worship slide presentation.</span>
              </div>
            </div>

          </div>

          {/* Row 3: Song / Lyric slides Selector or Segment Slides & Details */}
          <div className="bg-panel-dark border border-tech-border shadow-2xl rounded-xl p-4">
            {(() => {
              const activeItem = getActiveItem();
              const isWorshipActive = activeItem ? (activeItem.title.toLowerCase().includes("worship") || activeItem.id === "item-2") : false;

              if (isWorshipActive) {
                return (
                  <>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-tech-border">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
                        <div className="flex items-center space-x-2 shrink-0">
                          <Music className="h-4.5 w-4.5 text-neon-blue animate-pulse" />
                          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                            WORSHIP SONG & LYRICS CONTROLLER
                          </h3>
                        </div>
                        
                        {/* Search query input */}
                        <div className="relative flex-1 max-w-sm">
                          <input
                            type="text"
                            value={songSearchQuery}
                            onChange={(e) => setSongSearchQuery(e.target.value)}
                            placeholder="🔍 Filter songs by title or lyrics..."
                            className="w-full bg-panel-mid border border-tech-border placeholder-slate-600 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-neon-blue/25 focus:border-neon-blue"
                            id="keyboard-song-search"
                          />
                          {songSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setSongSearchQuery("")}
                              className="absolute right-2.5 top-2 hover:text-rose-500 text-slate-500 text-xs transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="text-[11px] font-bold text-slate-505 uppercase">Select Song:</span>
                          <select
                            value={selectedSongId}
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setSelectedSongId(e.target.value);
                              setSelectedSongPartsIndex(0);
                              setActiveSlideIndex(0);
                              const standardSong = WORSHIP_SONGS.find(s => s.id === e.target.value);
                              if (standardSong) {
                                setSuccessToast(`Congregation presentation set to: ${standardSong.title}`);
                              }
                            }}
                            className="bg-panel-mid border border-tech-border rounded px-2.5 py-1 text-xs text-neon-blue font-bold focus:outline-none cursor-pointer font-sans"
                            id="select-active-song"
                          >
                            {(() => {
                              const filtered = WORSHIP_SONGS.filter(song => {
                                const query = songSearchQuery.toLowerCase().trim();
                                if (!query) return true;
                                const matchesTitle = song.title.toLowerCase().includes(query) || song.author.toLowerCase().includes(query);
                                const matchesLyrics = song.slides.some(slide => 
                                  slide.some(line => line.toLowerCase().includes(query))
                                );
                                return matchesTitle || matchesLyrics;
                              });

                              if (filtered.length === 0) {
                                  return <option value="" className="bg-panel-dark text-slate-400">No matching songs</option>;
                              }
                              return filtered.map(song => (
                                <option key={song.id} value={song.id} className="bg-panel-dark text-slate-200">
                                  {song.title} — {song.author}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>

                      {/* Indicator if worship item is selected to inform operator */}
                      {getActiveItem()?.id !== "item-2" && (
                        <div 
                          onClick={() => handleSelectServiceItem("item-2")}
                          className="bg-sovereign-amber/10 hover:bg-sovereign-amber/20 border border-sovereign-amber/30 text-sovereign-amber text-[10px] px-2.5 py-1.5 rounded cursor-pointer transition-all uppercase tracking-wider font-mono font-bold shrink-0 text-center"
                        >
                          ⚠️ Connect Lyrics Screen to Projector
                        </div>
                      )}
                    </div>

                    {/* Quick-select matched badges if searching */}
                    {(() => {
                      const queryStr = songSearchQuery.toLowerCase().trim();
                      if (!queryStr) return null;
                      const matches = WORSHIP_SONGS.filter(song => {
                        const matchesTitle = song.title.toLowerCase().includes(queryStr) || song.author.toLowerCase().includes(queryStr);
                        const matchesLyrics = song.slides.some(s => s.some(l => l.toLowerCase().includes(queryStr)));
                        return matchesTitle || matchesLyrics;
                      });

                      if (matches.length === 0) return null;
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 mb-3 bg-panel-mid border border-tech-border p-2 rounded-lg">
                          <span className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-wider">Matches:</span>
                          {matches.slice(0, 4).map(song => (
                            <button
                              key={song.id}
                              onClick={() => {
                                setSelectedSongId(song.id);
                                setSelectedSongPartsIndex(0);
                                setActiveSlideIndex(0);
                                setSuccessToast(`Active lyrics switched to: ${song.title}`);
                              }}
                              className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                selectedSongId === song.id
                                  ? "bg-neon-blue text-white border-neon-blue shadow-sm"
                                  : "bg-panel-light hover:bg-panel-mid text-slate-300 border-tech-border"
                              }`}
                            >
                              🎵 {song.title}
                            </button>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Tab selection for lyrics section */}
                    {(() => {
                      const song = WORSHIP_SONGS.find(s => s.id === selectedSongId);
                      if (!song) return null;

                      const totalSlidesCount = song.slides.length;
                      const chorusCount = song.slides.filter(s => 
                        s.some(line => line.toLowerCase().includes("[chorus]") || line.toLowerCase().includes("chorus"))
                      ).length;
                      const verseCount = totalSlidesCount - chorusCount;

                      return (
                        <div className="flex border-b border-tech-border mb-3 space-x-1 overflow-x-auto">
                          <button
                            type="button"
                            onClick={() => setActiveLyricTab('all')}
                            className={`px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider relative -mb-[1px] transition-all cursor-pointer ${
                              activeLyricTab === 'all'
                                ? "text-neon-blue border-b-2 border-neon-blue font-extrabold"
                                : "text-slate-500 hover:text-white font-medium"
                            }`}
                          >
                            All Slides ({totalSlidesCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveLyricTab('chorus')}
                            className={`px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider relative -mb-[1px] transition-all cursor-pointer ${
                              activeLyricTab === 'chorus'
                                ? "text-neon-blue border-b-2 border-neon-blue font-extrabold"
                                : "text-slate-500 hover:text-white font-medium"
                            }`}
                          >
                            Choruses ({chorusCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveLyricTab('verse')}
                            className={`px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider relative -mb-[1px] transition-all cursor-pointer ${
                              activeLyricTab === 'verse'
                                ? "text-neon-blue border-b-2 border-neon-blue font-extrabold"
                                : "text-slate-500 hover:text-white font-medium"
                            }`}
                          >
                            Verses ({verseCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveLyricTab('lines')}
                            className={`px-3 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wider relative -mb-[1px] transition-all cursor-pointer ${
                              activeLyricTab === 'lines'
                                ? "text-neon-blue border-b-2 border-neon-blue font-extrabold"
                                : "text-slate-500 hover:text-white font-medium"
                            }`}
                          >
                            Lyrics Jump List ⚡
                          </button>
                        </div>
                      );
                    })()}

                    {/* Lyric slide content display based on activeLyricTab */}
                    {(() => {
                      const song = WORSHIP_SONGS.find(s => s.id === selectedSongId);
                      if (!song) return <p className="text-xs text-slate-500 py-3 font-mono">No active song selected.</p>;

                      // continuous lines list
                      if (activeLyricTab === 'lines') {
                        return (
                          <div className="bg-panel-mid border border-tech-border rounded-xl p-3 max-h-64 overflow-y-auto text-left space-y-1.5 custom-scrollbar">
                            <p className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest border-b border-tech-border pb-1 mb-2">
                              ⚡ LIVE DRILL-DOWN JUMP LIST (Click any line to display instantly on congregation screen)
                            </p>
                            {song.slides.flatMap((stanzaLines, slideIdx) => 
                              stanzaLines.map((line, lineIdx) => {
                                  if (line.startsWith("[") && line.endsWith("]")) return null; // Skip header formatting lines
                                  const isCurrentSlide = activeItemId === "item-2" && activeSlideIndex === slideIdx && !blackoutActive && !showLogoActive;
                                  return (
                                    <div
                                      key={`${slideIdx}-${lineIdx}`}
                                      onClick={() => {
                                        if (activeItemId !== "item-2") {
                                          setActiveItemId("item-2");
                                        }
                                        setActiveSlideIndex(slideIdx);
                                        setBlackoutActive(false);
                                        setShowLogoActive(false);
                                        setSuccessToast(`Jumped to slide ${slideIdx + 1}: "${line.slice(0, 30)}..."`);
                                      }}
                                      className={`px-3 py-2 rounded-lg transition-all cursor-pointer text-xs flex justify-between items-center ${
                                        isCurrentSlide 
                                          ? "bg-panel-light border-l-4 border-neon-blue text-white font-extrabold ring-1 ring-neon-blue/20" 
                                          : "hover:bg-panel-mid text-slate-305 bg-panel-dark border border-tech-border shadow-sm"
                                      }`}
                                    >
                                      <span className="font-serif leading-snug">{line}</span>
                                      <span className="text-[8px] font-mono bg-panel-light border border-tech-border text-slate-400 px-1.5 py-0.5 rounded shrink-0 ml-4 font-bold">
                                        Slide {slideIdx + 1}
                                      </span>
                                    </div>
                                  );
                              })
                            )}
                          </div>
                        );
                      }

                      // Otherwise render standard slide deck tiles
                      const slidesWithOriginalIdx = song.slides.map((stanzaLines, stanzaIdx) => ({
                        stanzaLines,
                        stanzaIdx
                      }));

                      let filteredSlides = slidesWithOriginalIdx;
                      if (activeLyricTab === 'chorus') {
                        filteredSlides = slidesWithOriginalIdx.filter(item => 
                          item.stanzaLines.some(line => line.toLowerCase().includes("[chorus]") || line.toLowerCase().includes("chorus"))
                        );
                      } else if (activeLyricTab === 'verse') {
                        filteredSlides = slidesWithOriginalIdx.filter(item => 
                          !item.stanzaLines.some(line => line.toLowerCase().includes("[chorus]") || line.toLowerCase().includes("chorus"))
                        );
                      }

                      if (filteredSlides.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-500 bg-panel-mid/50 rounded-lg border border-dashed border-tech-border">
                            <p className="text-xs font-mono font-bold">No slides match this tab's constraints.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {filteredSlides.map(({ stanzaLines, stanzaIdx }) => {
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
                                className={`p-3 rounded-lg border text-left cursor-pointer transition-all select-none h-28 flex flex-col justify-between shadow-xs ${
                                  isCurrentDisplayStanza
                                    ? "bg-panel-light border-neon-blue text-white ring-1 ring-neon-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-smooth"
                                    : "bg-panel-mid border-tech-border text-slate-300 hover:border-slate-750 hover:bg-panel-light/60"
                                }`}
                                id={`lyric-card-${selectedSongId}-${stanzaIdx}`}
                              >
                                <div>
                                  {stanzaLines[0]?.startsWith("[") ? (
                                    <span className="text-[8px] font-mono tracking-widest text-neon-blue uppercase block mb-1 font-extrabold">
                                      {stanzaLines[0]}
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-mono text-slate-500 font-semibold block mb-1">
                                      STANZA {stanzaIdx + 1}
                                    </span>
                                  )}
                                  <p className="text-[10px] line-clamp-3 leading-tight font-serif text-slate-100">
                                    {stanzaLines.filter(l => !l.startsWith("[")).slice(0, 3).join(" / ")}
                                  </p>
                                </div>

                                <div className="text-[8px] font-mono text-slate-500 flex justify-between items-center mt-1 pt-1 border-t border-tech-border/30">
                                  <span>Click to project</span>
                                  {isCurrentDisplayStanza && <span className="text-neon-blue font-bold">• ON SCREEN</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                );
              } else {
                return (
                  <div className="space-y-4">
                    {/* Header segment flow details */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-tech-border">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                        <div className="flex items-center space-x-2 shrink-0">
                          <Sliders className="h-4.5 w-4.5 text-neon-blue animate-pulse" />
                          <h3 className="text-xs font-display font-bold uppercase tracking-wider text-white">
                            {activeItem?.title || "SEGMENT"} CONTROLLER
                          </h3>
                        </div>

                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="text-[10px] font-mono bg-panel-mid text-neon-blue font-bold px-2 py-0.5 rounded uppercase border border-tech-border">
                            Duration: {activeItem?.duration || "N/A"}
                          </span>
                          <span className="text-[10px] font-mono bg-panel-mid text-slate-350 font-bold px-2 py-0.5 rounded uppercase border border-tech-border">
                            Status: {activeItem?.status || "pending"}
                          </span>
                        </div>
                      </div>

                      {/* Status Update Quick Buttons */}
                      <div className="flex items-center space-x-1.5 self-start lg:self-center">
                        <span className="text-[10px] font-bold text-slate-505 uppercase tracking-widest font-mono">Mark active:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeItem) return;
                            const updated = serviceItems.map(it => it.id === activeItem.id ? { ...it, status: "pending" as const } : it);
                            setServiceItems(updated);
                            setSuccessToast(`"${activeItem.title}" marked as Pending`);
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-all border cursor-pointer font-mono ${
                            activeItem?.status === "pending"
                              ? "bg-panel-light text-white border-neon-blue font-black shadow-xs"
                              : "bg-panel-mid hover:bg-panel-light text-slate-300 border-tech-border"
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeItem) return;
                            const updated = serviceItems.map(it => it.id === activeItem.id ? { ...it, status: "active" as const } : it);
                            setServiceItems(updated);
                            setSuccessToast(`"${activeItem.title}" marked as Active`);
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-all border cursor-pointer font-mono ${
                            activeItem?.status === "active"
                              ? "bg-neon-blue text-white border-neon-blue font-black shadow-sm"
                              : "bg-panel-mid hover:bg-panel-light text-slate-300 border-tech-border"
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!activeItem) return;
                            const updated = serviceItems.map(it => it.id === activeItem.id ? { ...it, status: "completed" as const } : it);
                            setServiceItems(updated);
                            setSuccessToast(`"${activeItem.title}" marked as Completed`);
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-all border cursor-pointer font-mono ${
                            activeItem?.status === "completed"
                              ? "bg-emerald-600 text-white border-emerald-600 font-black shadow-sm"
                              : "bg-panel-mid hover:bg-panel-light text-slate-300 border-tech-border"
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                    </div>

                    {/* Main content split: Left = notes/controls, Right = segment slides list */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      
                      {/* Left - segment meta, instructions, edit button */}
                      <div className="md:col-span-4 bg-panel-mid/40 rounded-xl p-3.5 border border-tech-border flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-wider mb-2">
                            Notes & Instructions
                          </h4>
                          <p className="text-xs text-slate-300 leading-relaxed italic bg-panel-dark p-2.5 rounded-lg border border-tech-border shadow-2xl">
                            {activeItem?.notes || "No extra instructions or notes provided for this service segment."}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-tech-border/55 flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 font-bold font-mono">
                            {activeItem?.slides?.length || 0} Slides Total
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (activeItem) {
                                setEditingItem(activeItem);
                              }
                            }}
                            className="flex items-center space-x-1 hover:bg-panel-mid font-bold bg-panel-light border border-tech-border text-neon-blue rounded px-2.5 py-1 uppercase text-[10px] transition-all cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit Notes</span>
                          </button>
                        </div>
                      </div>

                      {/* Right - Interactive slide cards */}
                      <div className="md:col-span-8 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[10px] font-mono text-slate-550 font-black uppercase tracking-wider mb-2">
                            Interactive Slide Deck (Select to display/cast)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {activeItem?.slides && activeItem.slides.length > 0 ? (
                              activeItem.slides.map((slideObj, slideIdx) => {
                                const isCurrentActive = activeSlideIndex === slideIdx && !blackoutActive && !showLogoActive;
                                return (
                                  <div
                                    key={slideIdx}
                                    onClick={() => {
                                      setActiveSlideIndex(slideIdx);
                                      setBlackoutActive(false);
                                      setShowLogoActive(false);
                                      setSuccessToast(`Presented "${activeItem.title}" — Slide ${slideIdx + 1}`);
                                    }}
                                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all select-none min-h-[96px] flex flex-col justify-between shadow-xs ${
                                      isCurrentActive
                                        ? "bg-panel-light border-neon-blue text-white ring-1 ring-neon-blue/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-smooth"
                                        : "bg-panel-mid border-tech-border text-slate-400 hover:bg-panel-light/65 hover:border-slate-700 hover:text-slate-200"
                                    }`}
                                    id={`segment-slide-${activeItem?.id}-${slideIdx}`}
                                  >
                                    <div>
                                      <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[9px] font-mono font-bold ${isCurrentActive ? "text-neon-blue" : "text-slate-500"}`}>
                                          SLIDE 0{slideIdx + 1}
                                        </span>
                                        {isCurrentActive && (
                                          <span className="text-[8px] bg-white text-dark-space font-mono font-black uppercase px-2 py-0.2 rounded shadow-xs">
                                            LIVE
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] leading-snug font-serif line-clamp-3 font-semibold text-slate-105">
                                        {slideObj.text}
                                      </p>
                                    </div>
                                    
                                    <div className="text-[8px] font-mono opacity-80 mt-2 border-t border-tech-border/30 pt-1 flex justify-between items-center">
                                      <span>{isCurrentActive ? "On projection screen" : "Click to cast..."}</span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="sm:col-span-2 p-8 text-center bg-panel-mid/30 rounded-xl border border-dashed border-tech-border flex flex-col items-center justify-center">
                                <HelpCircle className="h-6 w-6 text-slate-600 mb-2" />
                                <span className="text-xs text-slate-500 font-bold font-mono">NO SLIDES DEFINED</span>
                                <p className="text-[10px] text-slate-500 mt-1">This segment has no static slide cards. You can add one below.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Slide operation toolbar */}
                        <div className="mt-4 pt-3 border-t border-tech-border flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-500">
                            💡 Click the slides to trigger instant projection.
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (!activeItem) return;
                              const defaultText = `Interactive Custom Slide Content\n• Edit this point\n• Custom congregation notes`;
                              const updated = serviceItems.map(it => {
                                if (it.id === activeItem.id) {
                                  return {
                                    ...it,
                                    slides: [...(it.slides || []), { text: defaultText }]
                                  };
                                }
                                return it;
                              });
                              setServiceItems(updated);
                              setSuccessToast(`Added custom slide to "${activeItem.title}"`);
                              setActiveSlideIndex(activeItem.slides?.length || 0);
                            }}
                            className="flex items-center space-x-1 hover:bg-panel-mid bg-panel-light border border-tech-border text-slate-300 hover:text-white rounded px-2.5 py-1 font-bold uppercase text-[10px] transition-all cursor-pointer"
                          >
                            <Plus className="h-3 w-3 text-neon-blue" />
                            <span>Add Slide Deck</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              }
            })()}
          </div>

          {/* Operator Action Hot Keys & slide selector panel */}
          <div className="bg-panel-dark border border-tech-border shadow-2xl rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Previous slide control */}
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex <= 0}
              className="bg-panel-mid border border-tech-border hover:bg-panel-light disabled:opacity-20 disabled:pointer-events-none py-3 px-2 rounded-lg text-xs font-bold uppercase text-slate-300 hover:text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer font-mono"
              id="btn-prev-slide"
            >
              <ChevronLeft className="h-4 w-4 text-neon-blue" />
              <span className="text-[10px] tracking-wider">Prev Slide</span>
            </button>

            {/* Next slide control */}
            <button
              onClick={handleNextSlide}
              disabled={activeSlideIndex >= slides.length - 1}
              className="bg-neon-blue hover:bg-blue-600 disabled:opacity-20 disabled:pointer-events-none py-3 px-2 rounded-lg text-xs font-bold uppercase text-white transition-all flex flex-col items-center justify-center gap-1 cursor-pointer font-mono shadow-lg shadow-neon-blue/15 animate-smooth"
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
              className={`border py-3 px-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer font-mono ${
                blackoutActive
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.1)] animate-pulse"
                  : "bg-panel-mid border-tech-border text-slate-400 hover:text-rose-400 hover:bg-panel-light hover:border-rose-500/30"
              }`}
              id="btn-blackout-toggle"
            >
              <EyeOff className="h-4 w-4" />
              <span className="text-[10px] tracking-wider">Black screen</span>
            </button>

            {/* Project church welcome logo */}
            <button
              onClick={() => {
                setShowLogoActive(!showLogoActive);
                setBlackoutActive(false);
                setSuccessToast("Logo theme projected live");
              }}
              className={`border py-3 px-2 rounded-lg text-xs font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer font-mono ${
                showLogoActive
                  ? "bg-sovereign-amber/10 border-sovereign-amber/40 text-sovereign-amber shadow-[0_0_10px_rgba(212,175,55,0.15)] animate-pulse"
                  : "bg-panel-mid border-tech-border text-slate-400 hover:bg-panel-light hover:border-sovereign-amber/30 hover:text-sovereign-amber"
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
            <div className="bg-panel-dark border border-tech-border shadow-2xl rounded-xl p-4 mt-4 text-xs space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-white block">
                SYSTEM INSTRUCTION GUIDE (MEDIA DESK)
              </span>
              <ul className="space-y-1.5 text-slate-400 pl-1.5 text-[11px] leading-relaxed list-none font-medium">
                <li className="flex items-center gap-1 px-1.5 py-1 rounded bg-sovereign-amber/5 border border-sovereign-amber/20 mb-2">
                  <span className="text-sovereign-amber mr-1.5">●</span>
                  <span>Use the <strong className="text-white">Fullscreen PIN</strong> button inside the live preview output when running a multi-projector setup during church services.</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-neon-blue mr-1.5">●</span>
                  <span>Press <strong className="text-white">Extract Scriptures</strong> to feed pastor's spoken commentary to Gemini AI, returning exact scripture matching references.</span>
                </li>
                <li className="flex items-center gap-1">
                  <span className="text-neon-blue mr-1.5">●</span>
                  <span>Select any segment on <strong className="text-white">Service Timeline</strong> to review related guides, annotations, or launch slide stanzas.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </main>
      )}

      {/* Footer Branding Margins */}
      <footer className="border-t border-tech-border bg-panel-dark py-3.5 px-4 flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-wider">
        <div>
          <span>MEDIA DESK CONTROLS — <span className="text-emerald-500 font-bold">CONNECTED SECURE</span></span>
        </div>
        <div>
          <span>LITE WORSHIP SYSTEM v2.1 — <span className="text-neon-blue font-bold">AI ASSISTED</span></span>
        </div>
      </footer>
    </div>
  );
}

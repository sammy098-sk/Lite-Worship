import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Sparkles, 
  User, 
  Calendar, 
  Music, 
  Clock, 
  Check, 
  Layers, 
  Heart, 
  Flame, 
  CloudRain, 
  Library,
  BookOpen,
  Sliders,
  ChevronRight,
  RefreshCw,
  Edit,
  Smile
} from "lucide-react";
import { ServiceItem, WorshipSong } from "../types";

interface ServiceDesignerHomeProps {
  serviceItems: ServiceItem[];
  onChangeServiceItems: (items: ServiceItem[]) => void;
  selectedSongId: string;
  onChangeSelectedSong: (songId: string) => void;
  serviceTitle: string;
  onChangeServiceTitle: (title: string) => void;
  speakerName: string;
  onChangeSpeakerName: (name: string) => void;
  worshipSongs: WorshipSong[];
  onLaunch: () => void;
}

// Preset service flows
const PRESET_TEMPLATES = [
  {
    name: "Classic Worship Sunday",
    description: "Standard morning liturgical layout: announcements, 2 primary congregational worship tracks, Scripture reading, sermon, offering, and response benediction.",
    icon: Layers,
    colorClass: "from-sky-500 to-indigo-500",
    badge: "Most Common",
    items: [
      {
        id: "classic-1",
        title: "Welcome & Announcements",
        duration: "5 min",
        status: "pending",
        notes: "Welcoming visitors. Highlight community food drive next Saturday.",
        slides: [
          { text: "Welcome to Lite Worship Church\nHouse of Peace & Love" },
          { text: "Today's Announcements\n• Youth Gathering: Wednesday at 7 PM\n• Community Outreach: Saturday 9 AM" }
        ]
      },
      {
        id: "classic-2",
        title: "Worship Congregrational Session",
        duration: "15 min",
        status: "pending",
        notes: "Sarah on lead vocals. Start ambient, transition directly to Way Maker.",
        slides: [
          { text: "I love You, Lord\nFor Your mercy never fails me" }
        ]
      },
      {
        id: "classic-3",
        title: "Scripture Reading: Matthew 6",
        duration: "5 min",
        status: "pending",
        notes: "Matthew 6:25-34. Bible Reader: Joseph.",
        slides: [
          { text: "Therefore I tell you, do not be anxious about your life,\nwhat you will eat or what you will drink..." }
        ]
      },
      {
        id: "classic-4",
        title: "Sermon: Living with Faith",
        duration: "30 min",
        status: "pending",
        notes: "Preacher: Pastor David. AI Transcriber listens for reference tags.",
        slides: [
          { text: "Living with Faith & Courage\nPastor David" },
          { text: "Hebrews 11:1\nNow faith is the assurance of things hoped for,\nthe conviction of things not seen." }
        ]
      },
      {
        id: "classic-5",
        title: "Offering & Communion Service",
        duration: "10 min",
        status: "pending",
        notes: "Soft piano backtrack. Display secure online giving.",
        slides: [
          { text: "Giving & Generosity\nMalachi 3:10" },
          { text: "Online Giving: liteworship.org/give\nText 'GIVE' to (555) 123-4567" }
        ]
      },
      {
        id: "classic-6",
        title: "Closing Blessing & Fellowship",
        duration: "5 min",
        status: "pending",
        notes: "Benediction and announcement for lobby coffee fellowship.",
        slides: [
          { text: "Go in peace to love and serve the Lord.\nAmen." }
        ]
      }
    ]
  },
  {
    name: "Worship & Altar Night",
    description: "Multi-song continuous worship set with custom breathing sequences, deep reflective prayer loops, and flexible scriptures for responsive altar call ministry.",
    icon: Flame,
    colorClass: "from-amber-500 to-rose-500",
    badge: "Deep Worship",
    items: [
      {
        id: "worship-1",
        title: "Opening Praises & Prayer",
        duration: "10 min",
        status: "pending",
        notes: "Warm prayer opening, centering hearts before Praise starts.",
        slides: [
          { text: "Enter His gates with Thanksgiving\nAnd His courts with Praise" }
        ]
      },
      {
        id: "worship-2",
        title: "Extended Worship Set (All Songs)",
        duration: "35 min",
        status: "pending",
        notes: "Continuously transition: Goodness of God, Way Maker, and 10,000 Reasons.",
        slides: [
          { text: "[Worship Focus Session]\nSinging and seeking God's face in deep meditation" }
        ]
      },
      {
        id: "worship-3",
        title: "Spoken Devotional Teaching",
        duration: "15 min",
        status: "pending",
        notes: "Short scripture meditation: Worship in Spirit and in Truth.",
        slides: [
          { text: "John 4:24\nGod is spirit, and those who worship him must worship in spirit and truth." }
        ]
      },
      {
        id: "worship-4",
        title: "Altar Ministry / Prayer Line",
        duration: "20 min",
        status: "pending",
        notes: "Continuous prayer requests and active responsive counseling slides.",
        slides: [
          { text: "Commit your worries to Him\nFor He cares for you." }
        ]
      }
    ]
  },
  {
    name: "Youth Night Experience",
    description: "Fast-paced modern layout centering around relevance messages, interactive video, youth testimonies, and decentralized small discussion circles.",
    icon: Sparkles,
    colorClass: "from-purple-500 to-pink-500",
    badge: "Interactive & Fast",
    items: [
      {
        id: "youth-1",
        title: "Icebreaker & Group Challenge",
        duration: "10 min",
        status: "pending",
        notes: "High energy greeting. Kick off with a trivia poll question.",
        slides: [
          { text: "Youth Fire Night!\nAre you ready for the team challenge?" }
        ]
      },
      {
        id: "youth-2",
        title: "Lively Acoustic Praises",
        duration: "15 min",
        status: "pending",
        notes: "Acoustic versions of Goodness of God & Way Maker.",
        slides: [
          { text: "All my life You have been faithful..." }
        ]
      },
      {
        id: "youth-3",
        title: "Reflective Testimony Focus",
        duration: "10 min",
        status: "pending",
        notes: "Live testimony shared by Chloe from the college ministry.",
        slides: [
          { text: "Overcoming Anxiety: Chloe's Story\nIsaiah 41:10" }
        ]
      },
      {
        id: "youth-4",
        title: "Message: Walk by Faith, Not Phones",
        duration: "20 min",
        status: "pending",
        notes: "Speaker: Pastor Daniel. Keeping slides light and graphic-friendly.",
        slides: [
          { text: "Focusing on what's eternal, not instant reactions.\n2 Corinthians 5:7" }
        ]
      },
      {
        id: "youth-5",
        title: "Small Groups & Pizza Fellowship",
        duration: "25 min",
        status: "pending",
        notes: "Break out in the cafe. Coffee and pizza served.",
        slides: [
          { text: "Small Group Discussion Questions:\n1) Where do you struggle with comparison?\n2) How can we pray for you this week?" }
        ]
      }
    ]
  },
  {
    name: "Midweek Prayer Focus",
    description: "Compact devotional service built around continuous prayer loops, targeted Bible readings, and active congregation scripture input.",
    icon: Clock,
    colorClass: "from-emerald-500 to-teal-500",
    badge: "Reflective Devotion",
    items: [
      {
        id: "mid-1",
        title: "Call to Sincere Prayer",
        duration: "5 min",
        status: "pending",
        notes: "Opening devotional segment setup.",
        slides: [
          { text: "Midweek Covenant Prayer Session" }
        ]
      },
      {
        id: "mid-2",
        title: "Shared Testimonies & Praise",
        duration: "15 min",
        status: "pending",
        notes: "Congregants share quick answers to prayer.",
        slides: [
          { text: "Philippians 4:6\nDo not be anxious about anything, but in everything by prayer and supplication..." }
        ]
      },
      {
        id: "mid-3",
        title: "Intercessory Prayer & Scripture",
        duration: "20 min",
        status: "pending",
        notes: "Targeted prayer points. Play soft backing track.",
        slides: [
          { text: "1. For healing and comfort in our community\n2. For families and local school kids" }
        ]
      }
    ]
  }
];

export default function ServiceDesignerHome({
  serviceItems,
  onChangeServiceItems,
  selectedSongId,
  onChangeSelectedSong,
  serviceTitle,
  onChangeServiceTitle,
  speakerName,
  onChangeSpeakerName,
  worshipSongs,
  onLaunch
}: ServiceDesignerHomeProps) {
  // Local form for adding items
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("10 min");
  const [newNotes, setNewNotes] = useState("");
  const [newSlidesText, setNewSlidesText] = useState("");
  
  // Local state for editing an item inline in the workflow preview
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDuration, setEditedDuration] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedSlidesText, setEditedSlidesText] = useState("");

  // Preset quick appliers
  const handleApplyTemplate = (templateIndex: number) => {
    const template = PRESET_TEMPLATES[templateIndex];
    onChangeServiceItems(JSON.parse(JSON.stringify(template.items))); // Deep copy
    
    // Auto populate service metadata depending on the template
    if (template.name.toLowerCase().includes("youth")) {
      onChangeServiceTitle("Youth Encounter Night");
      onChangeSpeakerName("Pastor Daniel");
      onChangeSelectedSong("song-3"); // Way Maker
    } else if (template.name.toLowerCase().includes("altar") || template.name.toLowerCase().includes("worship")) {
      onChangeServiceTitle("Saturdays Praise & Altar ministry");
      onChangeSpeakerName("Lead Singer Sarah");
      onChangeSelectedSong("song-2"); // Goodness of God
    } else if (template.name.toLowerCase().includes("midweek")) {
      onChangeServiceTitle("Midweek Devotional Covenant");
      onChangeSpeakerName("Elder David");
      onChangeSelectedSong("song-4"); // 10,000 Reasons
    } else {
      onChangeServiceTitle("Sunday Celebrations");
      onChangeSpeakerName("Pastor David");
      onChangeSelectedSong("song-2"); // Goodness of God
    }
  };

  // Up/down movers
  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const updated = [...serviceItems];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onChangeServiceItems(updated);
  };

  const moveItemDown = (index: number) => {
    if (index === serviceItems.length - 1) return;
    const updated = [...serviceItems];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onChangeServiceItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = serviceItems.filter(item => item.id !== id);
    onChangeServiceItems(updated);
  };

  // Add a new segment
  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newId = `item-custom-${Date.now()}`;
    const newSlides = newSlidesText.trim() 
      ? newSlidesText.split("\n\n").map(text => ({ text }))
      : [{ text: `${newTitle}\nJoin in unified meditation.` }];

    const newItem: ServiceItem = {
      id: newId,
      title: newTitle,
      duration: newDuration,
      status: "pending",
      notes: newNotes || "Custom visual announcement slide segment",
      slides: newSlides
    };

    onChangeServiceItems([...serviceItems, newItem]);
    
    // Reset form
    setNewTitle("");
    setNewDuration("10 min");
    setNewNotes("");
    setNewSlidesText("");
  };

  // Start editing line
  const handleStartEditing = (item: ServiceItem) => {
    setActiveEditingId(item.id);
    setEditedTitle(item.title);
    setEditedDuration(item.duration);
    setEditedNotes(item.notes);
    setEditedSlidesText(item.slides.map(s => s.text).join("\n\n"));
  };

  // Save changes
  const handleSaveInlineEdit = (id: string) => {
    const updated = serviceItems.map(item => {
      if (item.id === id) {
        const customSlides = editedSlidesText.trim()
          ? editedSlidesText.split("\n\n").map(text => ({ text }))
          : [{ text: `${editedTitle}\nJoin in meditation.` }];

        return {
          ...item,
          title: editedTitle,
          duration: editedDuration,
          notes: editedNotes,
          slides: customSlides
        };
      }
      return item;
    });

    onChangeServiceItems(updated);
    setActiveEditingId(null);
  };

  return (
    <div className="flex-1 bg-space-bg text-slate-100 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-32">
      {/* Intro hero container */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 bg-panel-dark border border-tech-border rounded-full py-1 px-3.5 mb-4 shadow-sm">
          <Sparkles className="h-4 w-4 text-neon-blue animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-neon-blue font-bold uppercase">
            Service Workflow Manager
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-[1.05]">
          DESIGN YOUR <span className="text-neon-blue underline decoration-neon-blue/30 decoration-wavy">WORSHIP SERVICE</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Craft your precise timeline, schedule songs, configure details, and prepare Gemini-powered scripture listening tools. Select a starter template below or customize your segments manually.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (COL SPAN 5): Configurations & Starter blueprints */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section A: Basic parameters */}
          <div className="bg-panel-dark border border-tech-border rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 border-b border-tech-border pb-3">
              <Sliders className="h-4 w-4 text-neon-blue" />
              <h2 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                Primary Service Details
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase font-black text-slate-500 tracking-wider mb-1">
                  Service Title / Theme
                </label>
                <input 
                  type="text" 
                  value={serviceTitle}
                  onChange={(e) => onChangeServiceTitle(e.target.value)}
                  className="w-full bg-panel-mid border border-tech-border rounded px-3 py-2 text-xs font-bold text-slate-100 focus:bg-panel-light focus:border-neon-blue focus:outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. Sunday Morning Liturgy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-slate-500 tracking-wider mb-1">
                    Preacher / Speaker
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input 
                      type="text" 
                      value={speakerName}
                      onChange={(e) => onChangeSpeakerName(e.target.value)}
                      className="w-full bg-panel-mid border border-tech-border rounded pl-8 pr-3 py-2 text-xs font-bold text-slate-100 focus:bg-panel-light focus:border-neon-blue focus:outline-none transition-all placeholder-slate-600"
                      placeholder="David Wallace"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-black text-slate-500 tracking-wider mb-1">
                    Primary Worship Song
                  </label>
                  <div className="relative">
                    <Music className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <select
                      value={selectedSongId}
                      onChange={(e) => onChangeSelectedSong(e.target.value)}
                      className="w-full bg-panel-mid border border-tech-border rounded pl-8 pr-3 py-2 text-xs font-bold text-slate-200 focus:bg-panel-light focus:border-neon-blue focus:outline-none transition-all cursor-pointer"
                    >
                      {worshipSongs.map(song => (
                        <option key={song.id} value={song.id} className="bg-panel-dark text-slate-200">
                          {song.title} ({song.author})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: Preset starter blueprints cards */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono uppercase font-black text-slate-500 tracking-widest block pl-1">
              Select Starter Template Flow
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {PRESET_TEMPLATES.map((tpl, idx) => {
                const IconComp = tpl.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => handleApplyTemplate(idx)}
                    className="group relative bg-panel-dark border border-tech-border rounded-xl p-4 hover:border-neon-blue hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer transition-all duration-300 text-left"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${tpl.colorClass} text-white shadow-sm shrink-0`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-sans font-bold text-slate-200 group-hover:text-neon-blue transition-colors">
                            {tpl.name}
                          </h4>
                          <span className="shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 bg-panel-mid border border-tech-border text-slate-400 rounded">
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-455 font-medium leading-normal line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (COL SPAN 7): Service timeline visual blueprint designer */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-panel-dark border border-tech-border rounded-2xl shadow-lg p-5 space-y-4">
            
            <div className="flex justify-between items-center border-b border-tech-border pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4.5 w-4.5 text-neon-blue" />
                <h2 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                  Service Timeline Segments ({serviceItems.length})
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase">
                Active Setup Draft
              </span>
            </div>

            {/* Empty list illustration */}
            {serviceItems.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-tech-border rounded-xl">
                <Smile className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-bounce" />
                <span className="block text-xs font-bold text-slate-400">No active timeline segments</span>
                <p className="text-[11px] text-slate-550 mt-0.5">Click a starter template or use the form below to begin.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {serviceItems.map((item, index) => {
                  const isEditing = activeEditingId === item.id;
                  
                  return (
                    <div 
                      key={item.id}
                      className={`group border rounded-xl p-3 flex flex-col transition-all duration-150 ${
                        isEditing 
                          ? "border-neon-blue/60 bg-panel-mid" 
                          : "border-tech-border bg-panel-dark hover:bg-panel-mid hover:border-tech-border"
                      }`}
                    >
                      {isEditing ? (
                        /* Inline Edit Form */
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] text-neon-blue font-bold uppercase">
                              Edit Segment details
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                              Seg #{index + 1}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <input 
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="col-span-2 bg-panel-dark border border-tech-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neon-blue font-bold placeholder-slate-600"
                                placeholder="Segment Name"
                              />
                              <input 
                                type="text"
                                value={editedDuration}
                                onChange={(e) => setEditedDuration(e.target.value)}
                                className="bg-panel-dark border border-tech-border rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-neon-blue placeholder-slate-600"
                                placeholder="e.g. 10 min"
                              />
                            </div>

                            <textarea
                              value={editedNotes}
                              onChange={(e) => setEditedNotes(e.target.value)}
                              rows={1}
                              className="w-full bg-panel-dark border border-tech-border rounded p-1.5 text-xs text-white focus:outline-none focus:border-neon-blue placeholder-slate-600"
                              placeholder="Notes & operator guidelines"
                            />

                            <div>
                              <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">
                                Presentation Slide Content (Separate Slides with empty line spacing)
                              </label>
                              <textarea
                                value={editedSlidesText}
                                onChange={(e) => setEditedSlidesText(e.target.value)}
                                rows={2}
                                className="w-full h-14 bg-panel-dark border border-tech-border rounded p-1.5 font-mono text-[10px] text-slate-305 focus:outline-none focus:border-neon-blue placeholder-slate-600"
                                placeholder="Slide 1 text here&#10;&#10;Slide 2 text here (empty line separator)"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setActiveEditingId(null)}
                              className="px-2 py-1 bg-panel-light border border-tech-border text-slate-300 hover:text-white font-mono text-[10px] uppercase rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveInlineEdit(item.id)}
                              className="px-2.5 py-1 bg-neon-blue hover:bg-blue-600 text-white font-mono text-[10px] uppercase rounded font-bold cursor-pointer"
                            >
                              Apply updates
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal display item row */
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            {/* Sequence dot indicator */}
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              0{index + 1}
                            </span>
                            
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-sans font-bold text-slate-200 truncate">
                                  {item.title}
                                </h4>
                                <span className="bg-panel-mid text-slate-400 text-[8px] font-mono px-1.5 py-0.2 rounded border border-tech-border uppercase font-bold shrink-0">
                                  {item.duration}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate leading-relaxed">
                                {item.notes}
                              </p>
                            </div>
                          </div>

                          {/* Quick utility controls */}
                          <div className="flex items-center space-x-1 shrink-0">
                            {/* edit index inline btn */}
                            <button
                              onClick={() => handleStartEditing(item)}
                              className="p-1 text-slate-550 hover:text-neon-blue hover:bg-panel-light rounded cursor-pointer"
                              title="Edit parameters"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {/* Move Up/Down helpers */}
                            <button
                              disabled={index === 0}
                              onClick={() => moveItemUp(index)}
                              className="p-1 text-slate-550 hover:text-neon-blue hover:bg-panel-light rounded disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>

                            <button
                              disabled={index === serviceItems.length - 1}
                              onClick={() => moveItemDown(index)}
                              className="p-1 text-slate-550 hover:text-neon-blue hover:bg-panel-light rounded disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>

                            {/* Delete timeline element */}
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="p-1 text-slate-550 hover:text-rose-500 hover:bg-rose-950/20 rounded cursor-pointer"
                              title="Remove Segment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Row C: Add Custom Segment input card Form */}
            <form onSubmit={handleAddSegment} className="bg-panel-mid rounded-xl p-3.5 border border-tech-border text-xs space-y-3">
              <div className="flex items-center space-x-1.5">
                <Plus className="h-3.5 w-3.5 text-neon-blue" />
                <span className="font-mono text-[10px] text-neon-blue font-bold uppercase">
                  Add Custom Service Segment
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Altar Prayer Call"
                    className="w-full bg-panel-dark border border-tech-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neon-blue placeholder-slate-600 font-bold"
                  />
                </div>
                <div>
                  <input 
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="e.g. 10 min"
                    className="w-full bg-panel-dark border border-tech-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neon-blue placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <input 
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Sarah prays. Slides have responsive scriptures"
                  className="w-full bg-panel-dark border border-tech-border rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-neon-blue placeholder-slate-600"
                />
              </div>

              <div>
                <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase mb-0.5">
                  Initial Presentation Slide Text (Optional. Press Enter twice for next slide)
                </label>
                <textarea 
                  value={newSlidesText}
                  onChange={(e) => setNewSlidesText(e.target.value)}
                  rows={2}
                  placeholder="Slide 1 content&#10;&#10;Slide 2 content (with spacer row)"
                  className="w-full h-14 bg-panel-dark border border-tech-border rounded text-[10px] font-mono p-1.5 text-slate-300 focus:outline-none focus:border-neon-blue placeholder-slate-600"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="bg-panel-light hover:bg-panel-dark border border-tech-border text-neon-blue text-[10px] font-mono uppercase font-black px-3.5 py-1.5 rounded cursor-pointer transition-all"
                >
                  + Add Segment to Timeline
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* FOOTER PINNED HIGH CTA: Launch Presentation Desk */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-panel-dark border-t border-tech-border flex justify-center items-center backdrop-blur-md bg-panel-dark/95 shadow-2xl z-40">
        <button
          onClick={onLaunch}
          disabled={serviceItems.length === 0}
          className="bg-neon-blue hover:bg-blue-600 text-white font-display font-black uppercase text-xs tracking-widest px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 flex items-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
        >
          <span>Launch Worship Operator Desk</span>
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

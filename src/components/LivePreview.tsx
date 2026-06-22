/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ActiveSlideState } from "../types";
import { Maximize2, Minimize2, Video, Sparkles, Sliders } from "lucide-react";

interface LivePreviewProps {
  slideState: ActiveSlideState;
  onThemeChange?: (themeName: string) => void;
}

export default function LivePreview({ slideState, onThemeChange }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Maintain aspect ratio scaling relative to parent container width
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      // Widescreen standard width is 960px. Calculate scale factor.
      const calculatedScale = width / 960;
      setScaleFactor(Math.max(calculatedScale, 0.45)); // Ensure a responsive lower bound
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((e) => console.log("Fullscreen request failed", e));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Theme definition styles
  const getThemeBackgroundStyles = () => {
    switch (slideState.backgroundTheme) {
      case "gradient-navy":
        return "bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 text-white";
      case "ambient-worship":
        return "bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden";
      case "gold-vintage":
        return "bg-zinc-950 text-amber-100/90 border-2 border-amber-900/40";
      case "cross-graphic":
        return "bg-gradient-to-r from-slate-950 to-stone-950 text-white relative overflow-hidden";
      case "solid-dark":
      default:
        return "bg-neutral-950 text-neutral-100";
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl">
      {/* Title / Action bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800 select-none">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-xs tracking-wider text-neutral-400 font-bold uppercase">
            LIVE CONGREGATION DISPLAY (16:9 VIEWPORT)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Quick info tag of active slide */}
          <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-sovereign-amber/10 text-sovereign-amber border border-sovereign-amber/20">
            {slideState.type}
          </span>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Project Fullscreen"}
            className="p-1 px-2 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors flex items-center space-x-1 sm:text-xs"
            id="btn-toggle-fullscreen"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Minimize</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Fullscreen PIN</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Virtual Projector Canvas Box */}
      <div 
        ref={containerRef}
        className="flex-1 w-full flex items-center justify-center p-3 sm:p-6 bg-radial from-neutral-900 to-black select-none overflow-hidden relative"
      >
        {/* Aspect Ratio Constraint Box (960x540 inside viewport) */}
        <div
          id="projector-screen-frame"
          style={{
            width: "960px",
            height: "540px",
            transform: `scale(${scaleFactor})`,
            transformOrigin: "center center",
            transition: "transform 0.1s ease-out",
          }}
          className={`flex-shrink-0 relative overflow-hidden rounded-lg shadow-2xl flex flex-col items-center justify-center p-12 transition-all duration-700 ${getThemeBackgroundStyles()}`}
        >
          {/* Ambient Animation Sparks inside Worshipping Space */}
          {slideState.backgroundTheme === "ambient-worship" && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 h-80 w-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
              <div className="absolute bottom-1/3 right-1/4 h-80 w-80 bg-indigo-500/10 rounded-full blur-[130px] animate-pulse duration-[12000ms]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            </div>
          )}

          {/* Large elegant cross graphics element */}
          {slideState.backgroundTheme === "cross-graphic" && (
            <div className="absolute right-12 top-12 bottom-12 w-64 pointer-events-none select-none opacity-[0.06] z-0 flex items-center justify-center text-white">
              <svg viewBox="0 0 100 150" className="h-full w-auto fill-current">
                {/* Minimalist Christian Cross */}
                <path d="M 45 10 L 55 10 L 55 40 L 85 40 L 85 50 L 55 50 L 55 140 L 45 140 L 45 50 L 15 50 L 15 40 L 45 40 Z" />
              </svg>
            </div>
          )}

          {/* Gold vintage style frame lines */}
          {slideState.backgroundTheme === "gold-vintage" && (
            <div className="absolute inset-4 border border-amber-900/30 rounded pointer-events-none z-0">
              <div className="absolute inset-1 border border-amber-500/10 rounded" />
            </div>
          )}

          {/* Main Slide Content Presentation Area */}
          <div className="z-10 w-full max-w-4xl text-center flex flex-col justify-between h-full">
            
            {/* Top Info line (Optional: Song title or Scripture name) */}
            <div className="h-6">
              {slideState.type !== "blank" && slideState.type !== "logo" && slideState.title && (
                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] opacity-40 select-none">
                  {slideState.title}
                </span>
              )}
            </div>

            {/* Inner Content with Animation Transitions */}
            <div className="flex-1 flex items-center justify-center my-4 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${slideState.type}-${slideState.title}-${slideState.content}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full"
                >
                  {slideState.type === "blank" ? (
                    <div className="text-neutral-600/40 font-mono italic text-sm tracking-wide">
                      [ Screen Blanked - Congregation View Cleared ]
                    </div>
                  ) : slideState.type === "logo" ? (
                    <div className="flex flex-col items-center justify-center space-y-5">
                      {/* Logo Icon */}
                      <div className="h-24 w-24 rounded-full border-2 border-sovereign-amber bg-sovereign-amber/10 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] animate-pulse">
                        <Sparkles className="h-12 w-12 text-sovereign-amber" />
                      </div>
                      <div className="space-y-1.5">
                        <h1 className="text-5xl sm:text-6xl font-serif font-bold italic tracking-tight text-white drop-shadow-md">
                          LITE WORSHIP
                        </h1>
                        <p className="text-xs font-mono tracking-[0.25em] text-sovereign-amber font-bold uppercase">
                          IN SPIRIT AND IN TRUTH
                        </p>
                      </div>
                    </div>
                  ) : slideState.type === "scripture" ? (
                    <div className="space-y-6 max-w-4xl mx-auto px-4">
                      <p className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium italic leading-relaxed tracking-normal text-white drop-shadow-xl">
                        &ldquo;{slideState.content}&rdquo;
                      </p>
                      <h3 className="font-mono text-xs sm:text-sm tracking-[0.25em] font-black text-sovereign-amber uppercase">
                        — {slideState.title}
                      </h3>
                    </div>
                  ) : (
                    /* Song lyrics rendering with gorgeous serif typography */
                    <div className="space-y-4 px-4">
                      {slideState.content.split("\n").map((line, idx) => (
                        <p 
                          key={idx}
                          className={`drop-shadow-md leading-relaxed ${
                            line.startsWith("[") 
                              ? "text-sovereign-amber font-mono text-[11px] sm:text-xs tracking-[0.35em] uppercase py-2 font-bold" 
                              : "text-white font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-wide italic"
                          }`}
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom display page index slider */}
            <div className="h-6 flex items-center justify-between text-[11px] font-mono tracking-widest opacity-40 px-3">
              <div>
                {slideState.type !== "blank" && slideState.type !== "logo" && (
                  <span>LITE WORSHIP презентация</span>
                )}
              </div>
              <div>
                {slideState.type !== "blank" && slideState.type !== "logo" && slideState.total > 0 && (
                  <span>SLIDE {slideState.index + 1} OF {slideState.total}</span>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Backdrop Theme Quick Selector on Widescreen Mockup */}
      <div className="p-3.5 bg-neutral-950 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1.5 text-neutral-400">
          <Sliders className="h-3.5 w-3.5 text-neutral-500" />
          <span className="font-semibold text-[11px] tracking-wider uppercase">Projector Backdrop:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "solid-dark", name: "Solid Slate", dot: "bg-neutral-800" },
            { id: "gradient-navy", name: "Deep Grace Navy", dot: "bg-blue-900" },
            { id: "ambient-worship", name: "Celestial Aurora", dot: "bg-indigo-700" },
            { id: "cross-graphic", name: "Sovereign Cross", dot: "bg-stone-700" },
            { id: "gold-vintage", name: "Golden Sanctuary", dot: "bg-amber-600" },
          ].map((themeOpt) => (
            <button
              key={themeOpt.id}
              onClick={() => onThemeChange && onThemeChange(themeOpt.id)}
              className={`p-1.5 px-3 rounded-lg border flex items-center space-x-1.5 transition-all text-[11px] ${
                slideState.backgroundTheme === themeOpt.id
                  ? "bg-sovereign-amber/10 border-sovereign-amber/80 text-sovereign-amber font-medium"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
              }`}
              id={`theme-btn-${themeOpt.id}`}
            >
              <span className={`w-2 h-2 rounded-full ${themeOpt.dot}`} />
              <span>{themeOpt.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

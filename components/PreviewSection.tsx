import React, { useState, useEffect } from "react";
import { GeneratorState } from "../types";
import { FIXED_BACKGROUND_URL } from "../constants";
import { Button } from "./ui/Button";

interface PreviewSectionProps {
  state: GeneratorState;
}

const RENDERING_STEPS = [
  "Analyzing Brand Geometry...",
  "Synthesizing Material Textures...",
  "Orchestrating Light Diffusion...",
  "Calibrating Color Profiles...",
  "Finalizing High-Res Output...",
];

export const PreviewSection: React.FC<PreviewSectionProps> = ({ state }) => {
  const [stepIndex, setStepIndex] = useState(0);

  // Rotate through professional rendering messages
  useEffect(() => {
    let interval: number;
    if (state.isGenerating) {
      setStepIndex(0);
      interval = window.setInterval(() => {
        setStepIndex((prev) => (prev + 1) % RENDERING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [state.isGenerating]);

  const handleDownload = () => {
    if (!state.generatedImageUrl) return;
    const link = document.createElement("a");
    link.href = state.generatedImageUrl;
    link.download = `taste-studio-render-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .grid-bg {
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 30px 30px;
        }
      `}</style>
      
      {/* Top Bar / Toolbar */}
      <div className="h-14 border-b bg-background/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${state.isGenerating ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
          <div className="text-sm font-semibold tracking-tight text-foreground/80">
            {state.isGenerating ? "ENGINE ACTIVE" : (state.generatedImageUrl ? "RENDER COMPLETE" : "STUDIO CANVAS")}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {state.generatedImageUrl && !state.isGenerating && (
            <Button onClick={handleDownload} variant="primary" size="sm" className="gap-2 font-bold uppercase tracking-wider text-[10px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export High-Res
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12 overflow-hidden relative">
        
        {/* Shadow Casting Container */}
        <div className={`
            relative w-full max-w-[min(100%,85vh)] aspect-square rounded-lg shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden bg-black
            transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
            ${state.isGenerating ? "scale-[0.98] ring-1 ring-primary/50" : "scale-100 ring-0"}
        `}>
          
          {/* ADVANCED LOADING EFFECT */}
          {state.isGenerating && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-hidden">
               {/* Blurred Background Preview during generation */}
               <div className="absolute inset-0 opacity-40 blur-xl scale-110">
                  <img src={FIXED_BACKGROUND_URL} className="w-full h-full object-cover" alt="" />
               </div>

               {/* Digital Grid Overlay */}
               <div className="absolute inset-0 grid-bg opacity-30 z-0"></div>

               {/* Scanning Laser Beam */}
               <div className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] z-10 animate-scan"></div>
               <div className="absolute left-0 right-0 h-[100px] bg-gradient-to-b from-primary/20 to-transparent z-10 animate-scan"></div>

               {/* Progress Content */}
               <div className="relative z-20 flex flex-col items-center text-center">
                  <div className="mb-8 relative">
                    <div className="w-20 h-20 rounded-full border-2 border-primary/20 animate-ping absolute inset-0"></div>
                    <div className="w-20 h-20 rounded-full border-b-2 border-primary animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[10px] font-black text-primary">GPU</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-white text-xs font-black uppercase tracking-[0.3em] opacity-50">Studio Engine</h4>
                    <p className="text-primary text-sm font-bold tracking-widest uppercase transition-all duration-500">
                      {RENDERING_STEPS[stepIndex]}
                    </p>
                  </div>

                  {/* Mock Technical Data */}
                  <div className="mt-12 flex gap-8 text-[8px] font-mono text-white/30 uppercase tracking-widest">
                     <div className="flex flex-col"><span>VRAM Usage</span><span className="text-white/60">8.4 GB</span></div>
                     <div className="flex flex-col"><span>Resolution</span><span className="text-white/60">4096 x 4096</span></div>
                     <div className="flex flex-col"><span>Sampling</span><span className="text-white/60">Stochastic</span></div>
                  </div>
               </div>
            </div>
          )}

          {/* Rendering Logic */}
          <div className="absolute inset-0 w-full h-full bg-[#0a0a0a]">
            {state.generatedImageUrl ? (
               <img 
                 src={state.generatedImageUrl} 
                 alt="Generated Asset" 
                 className={`w-full h-full object-contain transition-opacity duration-1000 ${state.isGenerating ? 'opacity-0' : 'opacity-100'}`}
               />
            ) : (
               <div className="relative w-full h-full">
                 <img 
                   src={FIXED_BACKGROUND_URL} 
                   alt="Studio Background" 
                   className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-90"
                   onError={(e) => {
                     console.error("Background failed to load", e);
                     (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000';
                   }}
                 />
                 {/* Subtle vignette for depth */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"></div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Notifications */}
      {state.error && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-50">
          <div className="bg-destructive text-destructive-foreground px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-in fade-in zoom-in-95">
             <div className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
             </div>
             <p className="text-xs font-bold uppercase tracking-tight leading-snug">{state.error}</p>
          </div>
        </div>
      )}

    </div>
  );
};
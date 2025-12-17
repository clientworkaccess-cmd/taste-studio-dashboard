import React from "react";
import { GeneratorState } from "../types";
import { FIXED_BACKGROUND_URL } from "../constants";
import { Button } from "./ui/Button";

interface PreviewSectionProps {
  state: GeneratorState;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({ state }) => {
  
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
      
      {/* Top Bar / Toolbar */}
      <div className="h-14 border-b bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between z-10">
        <div className="text-sm font-medium text-muted-foreground">
          {state.generatedImageUrl ? "Render Complete" : "Canvas Preview"}
        </div>
        
        <div className="flex items-center gap-2">
           {state.generatedImageUrl && !state.isGenerating && (
            <Button onClick={handleDownload} variant="primary" size="sm" className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export PNG
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        
        <div className={`
            relative max-w-5xl max-h-full aspect-square rounded shadow-2xl overflow-hidden bg-white
            transition-all duration-500 ease-in-out
            ${state.isGenerating ? "scale-[0.98] ring-4 ring-primary/20" : "scale-100 ring-1 ring-border"}
        `}>
          
          {/* Loading Overlay */}
          {state.isGenerating && (
            <div className="absolute inset-0 z-30 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
               <div className="w-16 h-16 relative">
                 <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
               </div>
               <p className="mt-4 text-sm font-medium text-foreground tracking-wide animate-pulse">RENDERING ASSET</p>
            </div>
          )}

          {/* Image Content */}
          {state.generatedImageUrl ? (
             <img 
               src={state.generatedImageUrl} 
               alt="Generated Result" 
               className="w-full h-full object-contain bg-checkers"
             />
          ) : (
             <div className="relative w-full h-full">
               <img 
                 src={FIXED_BACKGROUND_URL} 
                 alt="Placeholder" 
                 className="w-full h-full object-cover opacity-90"
               />
               <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                 <div className="text-center text-white p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 mb-3 backdrop-blur-md border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><image x="0" y="0" width="24" height="24" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSIzIiB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHJ4PSIyIiByeT0iMiIvPjxsaW5lIHgxPSI4IiB5MT0iMjEiIHgyPSIxNiIgeTI9IjIxIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTciIHgyPSIxMiIgeTI9IjIxIi8+PC9zdmc+" opacity="0.8" /></svg>
                    </div>
                    <h3 className="text-lg font-medium">Ready to Create</h3>
                    <p className="text-sm text-white/70 mt-1 max-w-xs mx-auto">Upload a logo or provide a URL to generate high-fidelity brand assets.</p>
                 </div>
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Error Toast Area (Bottom Right) */}
      {state.error && (
        <div className="absolute bottom-6 right-6 max-w-md bg-destructive text-destructive-foreground px-4 py-3 rounded-md shadow-lg border border-destructive/50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
           <span className="text-sm">{state.error}</span>
        </div>
      )}

    </div>
  );
};
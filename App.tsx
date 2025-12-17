import React, { useState } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { PreviewSection } from "./components/PreviewSection";
import { InputMode, GeneratorState, NanoBananaPayload } from "./types";
import { DEFAULT_COLOR } from "./constants";
import { generateBrandedImage } from "./services/geminiService";

const App: React.FC = () => {
  const [state, setState] = useState<GeneratorState>({
    mode: InputMode.UPLOAD,
    logoFile: null,
    color: DEFAULT_COLOR,
    websiteUrl: "",
    socialUrl: "",
    isGenerating: false,
    generatedImageUrl: null,
    error: null,
  });

  const handleStateChange = (updates: Partial<GeneratorState>) => {
    setState((prev) => ({ ...prev, ...updates, error: null }));
  };

  const handleGenerate = async () => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const payload: NanoBananaPayload = {
        mode: state.mode,
        color: state.color,
        url: state.mode === InputMode.WEBSITE ? state.websiteUrl : state.socialUrl
      };

      if (state.mode === InputMode.UPLOAD && state.logoFile) {
        payload.logo = state.logoFile;
      }

      const resultImage = await generateBrandedImage(payload);
      
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generatedImageUrl: resultImage,
      }));

    } catch (err: any) {
      console.error(err);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        error: err.message || "Something went wrong interacting with the studio backend.",
      }));
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/10">
      
      {/* Sidebar Controls */}
      <aside className="w-[400px] flex-shrink-0 border-r bg-background flex flex-col z-20 shadow-xl shadow-black/5">
        <ControlPanel 
          state={state} 
          onStateChange={handleStateChange}
          onGenerate={handleGenerate}
        />
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative bg-muted/30 overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
             style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
        <PreviewSection state={state} />
      </main>

    </div>
  );
};

export default App;
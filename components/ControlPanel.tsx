import React from "react";
import { InputMode, GeneratorState } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { TabsList, TabsTrigger } from "./ui/Tabs";

interface ControlPanelProps {
  state: GeneratorState;
  onStateChange: (updates: Partial<GeneratorState>) => void;
  onGenerate: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, onStateChange, onGenerate }) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onStateChange({ logoFile: e.target.files[0] });
    }
  };

  const isFormValid = () => {
    if (state.mode === InputMode.UPLOAD) return !!state.logoFile;
    if (state.mode === InputMode.WEBSITE) return state.websiteUrl.length > 3;
    if (state.mode === InputMode.SOCIAL) return state.socialUrl.length > 3;
    return false;
  };

  const getButtonText = () => {
    if (state.isGenerating) {
      if (state.mode !== InputMode.UPLOAD) return "Analyzing & Rendering...";
      return "Processing...";
    }
    return "Generate Asset";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header / Branding */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-background rounded-full" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Taste Studio</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Generative Brand Asset Platform
        </p>
      </div>
      
      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Mode Selection */}
        <div className="space-y-3">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Source Material</Label>
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              className="text-xs"
              active={state.mode === InputMode.UPLOAD} 
              onClick={() => onStateChange({ mode: InputMode.UPLOAD })}
            >
              Upload
            </TabsTrigger>
            <TabsTrigger 
              className="text-xs"
              active={state.mode === InputMode.WEBSITE} 
              onClick={() => onStateChange({ mode: InputMode.WEBSITE })}
            >
              Website
            </TabsTrigger>
            <TabsTrigger 
              className="text-xs"
              active={state.mode === InputMode.SOCIAL} 
              onClick={() => onStateChange({ mode: InputMode.SOCIAL })}
            >
              Social
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Input Fields */}
        <div className="space-y-6">
          {state.mode === InputMode.UPLOAD && (
            <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="space-y-2">
                <Label htmlFor="logo">Brand Logo</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:bg-muted/30 text-center cursor-pointer relative group">
                  <Input 
                    id="logo" 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-1">
                    <div className="mx-auto w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <p className="text-sm font-medium">{state.logoFile ? state.logoFile.name : "Click to upload"}</p>
                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Accent Color</Label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                     <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: state.color }} />
                     <Input 
                      type="text" 
                      value={state.color} 
                      onChange={(e) => onStateChange({ color: e.target.value })}
                      className="font-mono pl-8"
                    />
                  </div>
                  <div className="relative w-10 h-9 overflow-hidden rounded-md border shadow-sm">
                    <Input 
                      id="color" 
                      type="color" 
                      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0" 
                      value={state.color}
                      onChange={(e) => onStateChange({ color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.mode === InputMode.WEBSITE && (
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <Label htmlFor="website">Website URL</Label>
              <Input 
                id="website" 
                placeholder="https://www.brand.com"
                value={state.websiteUrl}
                onChange={(e) => onStateChange({ websiteUrl: e.target.value })}
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">The studio will analyze brand assets from the site.</p>
            </div>
          )}

          {state.mode === InputMode.SOCIAL && (
            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <Label htmlFor="social">Profile URL</Label>
              <Input 
                id="social" 
                placeholder="https://instagram.com/brand"
                value={state.socialUrl}
                onChange={(e) => onStateChange({ socialUrl: e.target.value })}
                className="h-10"
              />
               <p className="text-[11px] text-muted-foreground">Compatible with Instagram and Facebook.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t bg-muted/10 space-y-4">
        <Button 
          className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all" 
          onClick={onGenerate} 
          disabled={!isFormValid() || state.isGenerating}
        >
          {state.isGenerating ? (
            <span className="flex items-center gap-2">
               <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
               {getButtonText()}
            </span>
          ) : "Generate Asset"}
        </Button>
        
        <div className="text-[10px] text-center text-muted-foreground">
          Powered by Cloud Workflow Orchestration
        </div>
      </div>
    </div>
  );
};
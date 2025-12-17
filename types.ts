export enum InputMode {
  UPLOAD = 'upload',
  WEBSITE = 'website',
  SOCIAL = 'social',
}

export interface GeneratorState {
  mode: InputMode;
  logoFile: File | null;
  color: string;
  websiteUrl: string;
  socialUrl: string;
  isGenerating: boolean;
  generatedImageUrl: string | null;
  error: string | null;
}

export interface NanoBananaPayload {
  mode: InputMode;
  logo?: File;  // Changed to File for binary upload
  color?: string;
  url?: string;
}
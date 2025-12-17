export interface BrandAssets {
  file: File;
  color: string;
}

// Helper: Get average color from an image blob
const getDominantColor = (imageBlob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve("#000000");
        return;
      }

      // Resize to 1x1 to get average color
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      
      // Convert RGB to Hex
      const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      resolve(hex);
    };

    img.onerror = () => resolve("#000000");
    img.src = url;
  });
};

// Helper: Try fetching a URL through a CORS proxy
const fetchImageViaProxy = async (targetUrl: string): Promise<Blob> => {
  // Array of proxies to try in order
  const proxies = [
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
  ];

  for (const proxyGen of proxies) {
    try {
      const proxyUrl = proxyGen(targetUrl);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) continue;
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) continue;
      
      const blob = await response.blob();
      if (blob.size < 100) continue; // Ignore tiny errors/pixels
      
      return blob;
    } catch (e) {
      console.warn("Proxy attempt failed", e);
      continue;
    }
  }
  throw new Error("Failed to fetch image via proxies");
};

export const extractBrandAssets = async (inputUrl: string): Promise<BrandAssets> => {
  let hostname = "";
  try {
    // 1. URL Cleanup
    let processedUrl = inputUrl.trim();
    if (!processedUrl.startsWith('http')) {
      processedUrl = `https://${processedUrl}`;
    }
    const urlObj = new URL(processedUrl);
    hostname = urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    throw new Error("Please enter a valid URL (e.g., brand.com)");
  }

  // 2. Define Logo Sources (Priority Order)
  // Google is often most reliable for favicons/logos of modern tech sites like chatgpt.com
  const sources = [
    // High-res Google Favicon
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=256`,
    // Clearbit Logo API
    `https://logo.clearbit.com/${hostname}`,
    // Icon Horse
    `https://icon.horse/icon/${hostname}`
  ];

  let bestBlob: Blob | null = null;

  // 3. Attempt to fetch from sources
  for (const sourceUrl of sources) {
    try {
      const blob = await fetchImageViaProxy(sourceUrl);
      bestBlob = blob;
      break; // Found a valid image
    } catch (e) {
      continue; // Try next source
    }
  }

  if (!bestBlob) {
    throw new Error(`Could not auto-detect a logo for ${hostname}. Please upload one manually.`);
  }

  // 4. Create File & Extract Color
  const file = new File([bestBlob], `${hostname}-logo.png`, { type: bestBlob.type });
  const color = await getDominantColor(bestBlob);

  return { file, color };
};
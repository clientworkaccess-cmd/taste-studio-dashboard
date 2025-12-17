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

// Helper: Detect Social Media URLs and extract username
const getSocialDetails = (url: URL) => {
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const pathSegments = url.pathname.split('/').filter(p => p.length > 0);
  
  if (pathSegments.length === 0) return null;
  
  const username = pathSegments[0]; // Usually the first segment is the username

  // Support for common platforms
  if (hostname.includes('instagram.com')) return { provider: 'instagram', username };
  if (hostname.includes('facebook.com')) return { provider: 'facebook', username };
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return { provider: 'twitter', username };
  if (hostname.includes('linkedin.com')) {
    // linkedin.com/in/username or linkedin.com/company/name
    if (pathSegments.length >= 2 && (pathSegments[0] === 'in' || pathSegments[0] === 'company')) {
      return { provider: 'linkedin', username: pathSegments[1] };
    }
    return null;
  }
  if (hostname.includes('youtube.com')) {
    // youtube.com/@username
    if (username.startsWith('@')) return { provider: 'youtube', username: username.substring(1) };
    return { provider: 'youtube', username };
  }
  if (hostname.includes('github.com')) return { provider: 'github', username };
  
  return null;
};

export const extractBrandAssets = async (inputUrl: string): Promise<BrandAssets> => {
  let urlObj: URL;
  let hostname = "";
  
  try {
    // 1. URL Cleanup
    let processedUrl = inputUrl.trim();
    if (!processedUrl.startsWith('http')) {
      processedUrl = `https://${processedUrl}`;
    }
    urlObj = new URL(processedUrl);
    hostname = urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    throw new Error("Please enter a valid URL (e.g., brand.com)");
  }

  // 2. Identify Source Type (Social vs Website)
  const social = getSocialDetails(urlObj);
  let sources: string[] = [];

  if (social) {
    // SOCIAL: Use Unavatar to get the specific profile picture
    // We append ?fallback=false to ensure we get a 404 if the user doesn't exist, rather than a generated placeholder
    sources = [
      `https://unavatar.io/${social.provider}/${social.username}?fallback=false`,
      `https://unavatar.io/${social.username}?fallback=false` // Fallback generic lookup
    ];
  } else {
    // WEBSITE: Use Favicon/Logo extractors
    sources = [
      `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=256`,
      `https://logo.clearbit.com/${hostname}`,
      `https://icon.horse/icon/${hostname}`
    ];
  }

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
    const context = social ? `profile picture for ${social.username}` : `logo for ${hostname}`;
    throw new Error(`Could not auto-detect a ${context}. Please upload one manually.`);
  }

  // 4. Create File & Extract Color
  const filename = social ? `${social.provider}-${social.username}.png` : `${hostname}-logo.png`;
  const file = new File([bestBlob], filename, { type: bestBlob.type });
  const color = await getDominantColor(bestBlob);

  return { file, color };
};
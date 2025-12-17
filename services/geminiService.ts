import { NanoBananaPayload } from "../types";
import { N8N_WEBHOOK_URL } from "../constants";

export const generateBrandedImage = async (payload: NanoBananaPayload): Promise<string> => {
  if (N8N_WEBHOOK_URL.includes("your-n8n-instance")) {
    throw new Error("Please configure your N8N_WEBHOOK_URL in constants.ts");
  }

  try {
    // Construct FormData for binary file upload
    const formData = new FormData();
    formData.append('mode', payload.mode);
    
    if (payload.color) formData.append('color', payload.color);
    if (payload.url) formData.append('url', payload.url);
    
    // Append binary file if it exists
    if (payload.logo) {
      formData.append('logo', payload.logo);
    }

    // Call n8n Webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`n8n Error (${response.status}): ${errorText}`);
    }

    // Check Content-Type to determine how to parse the response
    const contentType = response.headers.get('content-type');

    // 1. If n8n returns JSON (e.g. { "image": "base64..." } or error details)
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.image) return data.image;
      if (data.output) return data.output;
      if (typeof data === 'string' && data.startsWith('data:image')) return data;
      throw new Error("n8n returned JSON but no valid image property was found.");
    }

    // 2. If n8n returns Binary Image directly (Fix for "Unexpected token..." error)
    // We treat the response body as a Blob (Binary Large Object)
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error("Received empty response from n8n.");
    }

    // Create a local object URL that React can use as an <img src="..." />
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Nano Banana (n8n) generation failed:", error);
    throw error;
  }
};
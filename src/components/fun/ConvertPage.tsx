import React, { useEffect } from "react";
import { decode as decodeJXL } from "@jsquash/jxl";

const ConvertPage: React.FC = () => {
  useEffect(() => {
    (async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const base64Data = urlParams.get("data");
      if (!base64Data) return;

      try {
        const binary = atob(base64Data);
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          buffer[i] = binary.charCodeAt(i);
        }

        // Decode JXL to raw image data
        const { data, width, height } = await decodeJXL(buffer.buffer);
        const imageData = new ImageData(data, width, height);

        // Convert to PNG via canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        ctx.putImageData(imageData, 0, 0);
        
        // Convert canvas to data URL and redirect
        const dataUrl = canvas.toDataURL("image/png");
        window.location.href = dataUrl;
      } catch (err) {
        console.error("Decoding failed:", err);
      }
    })();
  }, []);

  return <p>Converting...</p>;
};

export default ConvertPage;
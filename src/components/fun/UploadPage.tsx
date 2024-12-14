import React, { useState, useRef } from "react";
import { encode as encodeJXL } from "@jsquash/jxl";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import 'svg2pdf.js';

interface Attempt {
  scale: number;
  width: number;
  height: number;
  urlLength: number;
  imageUrl: string;
}

const UploadPage: React.FC = () => {
  const [link, setLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [iterations, setIterations] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [finalScale, setFinalScale] = useState<number>(1.0);
  const [originalDims, setOriginalDims] = useState<[number, number]>([0, 0]);
  const [finalDims, setFinalDims] = useState<[number, number]>([0, 0]);
  const [attempts, setAttempts] = useState<Array<Attempt>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const qrRef = useRef<SVGSVGElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setLink(null);
    setAttempts([]);
    setIterations(0);
    setDuration(0);
    setFinalScale(1.0);
    setFinalDims([0,0]);
    setOriginalDims([0,0]);

    setStatus("Reading image...");
    try {
      const imgData = await loadImageFile(file);
      setOriginalDims([imgData.width, imgData.height]);

      setStatus("Downsizing and encoding to JXL...");
      const startTime = performance.now();

      const { url: jxlDataUrl, scale, count, width, height } = await reduceAndEncodeJXLWithLiveUpdates(
        imgData,
        2500,
        (attempt) => {
          setAttempts((prev) => [...prev, attempt]);
        }
      );

      const endTime = performance.now();
      setLink(jxlDataUrl);
      setIterations(count);
      setDuration(endTime - startTime);
      setFinalScale(scale);
      setFinalDims([width, height]);

      setStatus("Done!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred.");
      setStatus(null);
    }
  };

  const handleDownloadSVG = () => {
    if (!qrRef.current || !link) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(qrRef.current);

    const blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr_code.svg';
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!qrRef.current) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(qrRef.current);

    // Create a temporary container for the SVG
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.src = url;

    // Wait for image to load
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
    });

    // Create a jsPDF instance and convert SVG to PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [img.width, img.height]
    });

    const svgElement = qrRef.current.cloneNode(true) as SVGSVGElement;
    // svg2pdf requires the element to be in the DOM
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.visibility = 'hidden';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.top = '-9999px';
    hiddenDiv.appendChild(svgElement);
    document.body.appendChild(hiddenDiv);

    await doc.svg(svgElement, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height
    });

    document.body.removeChild(hiddenDiv);

    doc.save('qr_code.pdf');
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1>Upload & Compress</h1>
      <p>
        Upload an image, and we'll compress it into a JPEG XL small
        enough to fit in a short URL.
      </p>
      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={handleUpload}
      />
      {status && <p>{status}</p>}
      {errorMessage && <p style={{color: "red"}}>{errorMessage}</p>}

      {link && (
        <div>
          <p>Link to conversion page:</p>
          <a href={link} target="_blank" rel="noreferrer">
            {link}
          </a>
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: 'inline-block', padding: '10px', backgroundColor: '#fff', border: '5px solid #fff' }}>
              <QRCodeSVG value={link} ref={qrRef} />
            </div>
          </div>
          <div style={{ marginTop: "10px" }}>
            <button onClick={handleDownloadSVG}>Download SVG</button>
            <button onClick={handleDownloadPDF} style={{ marginLeft: "10px" }}>Download PDF</button>
          </div>
        </div>
      )}

      {link && (
        <div style={{ marginTop: "20px" }}>
          <h2>Report</h2>
          <p><strong>Iterations:</strong> {iterations}</p>
          <p><strong>Time Taken:</strong> {duration.toFixed(2)} ms</p>
          <p><strong>Final Scale:</strong> {finalScale.toFixed(4)} (relative to original)</p>
          <p>
            <strong>Original Dimensions:</strong> {originalDims[0]}x{originalDims[1]}
          </p>
          <p>
            <strong>Final Dimensions:</strong> {finalDims[0]}x{finalDims[1]}
          </p>
          <p>
            Reduced to {((finalDims[0]*finalDims[1])/(originalDims[0]*originalDims[1]) * 100).toFixed(2)}% of original pixel count.
          </p>
        </div>
      )}

      {attempts.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h2>Attempts</h2>
          <p>Each iteration of the binary search is shown below:</p>
          {attempts.map((attempt, i) => (
            <div key={i} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
              <p><strong>Iteration:</strong> {i+1}</p>
              <p><strong>Scale:</strong> {attempt.scale.toFixed(4)}</p>
              <p><strong>Dimensions:</strong> {attempt.width}x{attempt.height}</p>
              <p><strong>URL Length:</strong> {attempt.urlLength}</p>
              <p><strong>Image Preview:</strong></p>
              <img src={attempt.imageUrl} alt={`Attempt ${i+1}`} style={{ maxWidth: "200px", border: "1px solid #000" }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper: load uploaded image into ImageData
async function loadImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      resolve(data);
    };
    img.onerror = (err) => reject(err);
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Attempt to reduce and encode JXL, performing a binary search on scale factor,
 * calling `onAttempt` at each iteration.
 */
async function reduceAndEncodeJXLWithLiveUpdates(
  data: ImageData,
  target: number,
  onAttempt: (attempt: Attempt) => void
): Promise<{ url: string; scale: number; count: number; width: number; height: number }> {
  const { width, height } = data;
  let low = 0.01;
  let high = 1.0;
  let bestUrl = "";
  let bestScale = high;
  let count = 0;

  while ((high - low) > 0.0001) {
    count++;
    const scale = (low + high) / 2.0;

    const scaledWidth = Math.max(1, Math.round(width * scale));
    const scaledHeight = Math.max(1, Math.round(height * scale));
    const scaledData = scaleImageData(data, scaledWidth, scaledHeight);

    const jxlBuffer = await encodeJXL(scaledData, {quality: 10, effort: 8, lossyPalette: true, lossyModular: true});
    const base64 = arrayBufferToBase64(jxlBuffer);
    const fullUrl = `${window.location.origin}/decode?data=${encodeURIComponent(base64)}`;

    // Create a preview for the attempt
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = scaledWidth;
    previewCanvas.height = scaledHeight;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) throw new Error("Failed to get canvas context for preview");
    previewCtx.putImageData(scaledData, 0, 0);
    const previewDataUrl = previewCanvas.toDataURL("image/png");

    onAttempt({
      scale,
      width: scaledWidth,
      height: scaledHeight,
      urlLength: fullUrl.length,
      imageUrl: previewDataUrl,
    });

    await new Promise(r => requestAnimationFrame(r)); // allow UI to update

    if (fullUrl.length < target) {
      bestUrl = fullUrl;
      bestScale = scale;
      low = scale;
    } else {
      high = scale;
    }
  }

  if (!bestUrl) {
    throw new Error("Could not compress under target characters.");
  }
  const finalWidth = Math.max(1, Math.round(width * bestScale));
  const finalHeight = Math.max(1, Math.round(height * bestScale));
  return {
    url: bestUrl,
    scale: bestScale,
    count,
    width: finalWidth,
    height: finalHeight,
  };
}

function scaleImageData(imageData: ImageData, newWidth: number, newHeight: number): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Failed to get canvas context");

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = imageData.width;
  tmpCanvas.height = imageData.height;
  const tmpCtx = tmpCanvas.getContext('2d');
  if (!tmpCtx) throw new Error("Failed to get temp canvas context");
  tmpCtx.putImageData(imageData, 0, 0);

  ctx.drawImage(tmpCanvas, 0, 0, imageData.width, imageData.height, 0, 0, newWidth, newHeight);
  return ctx.getImageData(0, 0, newWidth, newHeight);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default UploadPage;

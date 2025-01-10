import React, { useState, useRef } from "react";
import { encode as encodeJXL, decode as decodeJXL } from "@jsquash/jxl";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import "svg2pdf.js";
import "../../styles/encode.scss";

interface Attempt {
	scale: number;
	width: number;
	height: number;
	urlLength: number;
	imageUrl: string;
}

const ImageEncoder: React.FC = () => {
	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [iterations, setIterations] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);
	const [finalScale, setFinalScale] = useState<number>(1.0);
	const [originalDims, setOriginalDims] = useState<[number, number]>([0, 0]);
	const [finalDims, setFinalDims] = useState<[number, number]>([0, 0]);
	const [attempts, setAttempts] = useState<Array<Attempt>>([]);
	const [finalLink, setFinalLink] = useState<string | null>(null);

	const [finalDecodedImage, setFinalDecodedImage] = useState<string | null>(
		null
	);
	const [finalScaledPreview, setFinalScaledPreview] = useState<string | null>(
		null
	);

	// Use strings for numeric inputs to allow clearing them
	const [targetBytesInput, setTargetBytesInput] = useState<string>("2500");
	const [effortInput, setEffortInput] = useState<string>("8");
	const [qualityInput, setQualityInput] = useState<string>("10");
	const [decodingSpeedTierInput, setDecodingSpeedTierInput] =
		useState<string>("0");
	const [photonNoiseIsoInput, setPhotonNoiseIsoInput] = useState<string>("0");

	// Derived numeric values
	const targetBytes = parseInt(targetBytesInput, 10) || 0;
	const effort = parseInt(effortInput, 10) || 0;
	const quality = parseInt(qualityInput, 10) || 0;
	const decodingSpeedTier = parseInt(decodingSpeedTierInput, 10) || 0;
	const photonNoiseIso = parseInt(photonNoiseIsoInput, 10) || 0;

	const [progressive, setProgressive] = useState<boolean>(true);
	const [lossyPalette, setLossyPalette] = useState<boolean>(true);
	const [lossyModular, setLossyModular] = useState<boolean>(true);
	const [generateQR, setGenerateQR] = useState<boolean>(true);

	const qrRef = useRef<SVGSVGElement>(null);

	const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const uploadedFile = e.target.files?.[0] ?? null;
		setFile(uploadedFile);
		resetState();
	};

	const resetState = () => {
		setErrorMessage(null);
		setStatus(null);
		setFinalLink(null);
		setAttempts([]);
		setIterations(0);
		setDuration(0);
		setFinalScale(1.0);
		setFinalDims([0, 0]);
		setOriginalDims([0, 0]);
		setFinalDecodedImage(null);
		setFinalScaledPreview(null);
	};

	const handleEncode = async () => {
		if (!file) return;
		resetState();

		// Validate numeric inputs before proceeding
		if (!targetBytes || targetBytes < 100) {
			setErrorMessage("Invalid target byte length.");
			return;
		}
		if (quality < 1 || quality > 100) {
			setErrorMessage("Quality must be between 1 and 100.");
			return;
		}
		if (effort < 1 || effort > 9) {
			setErrorMessage("Effort must be between 1 and 9.");
			return;
		}
		if (decodingSpeedTier < 0 || decodingSpeedTier > 3) {
			setErrorMessage("Decoding Speed Tier must be between 0 and 3.");
			return;
		}

		setStatus("Reading image...");
		try {
			const imgData = await loadImageFile(file);
			setOriginalDims([imgData.width, imgData.height]);

			setStatus("Downsizing and encoding to JXL...");
			const startTime = performance.now();

			const {
				url: jxlDataUrl,
				scale,
				count,
				width,
				height,
			} = await reduceAndEncodeJXLWithLiveUpdates(
				imgData,
				targetBytes,
				effort,
				quality,
				progressive,
				lossyPalette,
				decodingSpeedTier,
				photonNoiseIso,
				lossyModular,
				(attempt) => setAttempts((prev) => [...prev, attempt])
			);

			const endTime = performance.now();

			setFinalLink(jxlDataUrl);
			setIterations(count);
			setDuration(endTime - startTime);
			setFinalScale(scale);
			setFinalDims([width, height]);
			setStatus("Done!");

			const base64Data = extractBase64FromUrl(jxlDataUrl);
			if (base64Data) {
				const {
					data: decodedData,
					width: decW,
					height: decH,
				} = await decodeBase64JXL(base64Data);

				const decodedPngUrl = imageDataToDataUrl(
					decodedData,
					decW,
					decH
				);
				setFinalDecodedImage(decodedPngUrl);

				const scaledData = scaleImageData(imgData, width, height);
				const scaledPngUrl = imageDataToDataUrl(
					scaledData.data,
					width,
					height
				);
				setFinalScaledPreview(scaledPngUrl);
			}
		} catch (err: any) {
			console.error(err);
			setErrorMessage(err.message || "An error occurred.");
			setStatus(null);
		}
	};

	const [copyQRLabel, setCopyQRLabel] = useState("Copy QR as PNG");

	const handleCopyQRPNG = async () => {
        const qrScale = 4;

		if (!qrRef.current) return;

		try {
			// Clone and serialize the SVG
			const clonedSvg = qrRef.current.cloneNode(true) as SVGSVGElement;
			const serializer = new XMLSerializer();
			const svgString = serializer.serializeToString(clonedSvg);
			const blob = new Blob([svgString], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);

			// Draw onto a canvas
			const img = new Image();
			await new Promise<void>((resolve) => {
				img.onload = () => resolve();
				img.src = url;
			});

			const canvas = document.createElement("canvas");
			canvas.width = img.width * qrScale;
            canvas.height = img.height * qrScale;
			const ctx = canvas.getContext("2d");
            ctx?.scale(qrScale, qrScale);
			if (!ctx) return;
			ctx.drawImage(img, 0, 0);

			// Convert the canvas to a PNG blob
			const pngBlob = await new Promise<Blob | null>((resolve) =>
				canvas.toBlob(resolve, "image/png")
			);
			if (!pngBlob) return;

			// Write the PNG blob to clipboard
			await navigator.clipboard.write([
				new ClipboardItem({ [pngBlob.type]: pngBlob }),
			]);

			// Update button text
			setCopyQRLabel("Copied!");
			setTimeout(() => setCopyQRLabel("Copy QR as PNG"), 2000);
		} catch (err) {
			console.error("Failed to copy QR code PNG:", err);
		}
	};

	const handleDownloadSVG = () => {
		if (!qrRef.current || !finalLink) return;
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(qrRef.current);

		const blob = new Blob([svgString], {
			type: "image/svg+xml;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = "qr_code.svg";
		a.click();

		URL.revokeObjectURL(url);
	};

	const handleDownloadPDF = async () => {
		if (!qrRef.current) return;

		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(qrRef.current);

		const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
		const url = URL.createObjectURL(svgBlob);
		const img = new Image();
		img.src = url;

		await new Promise<void>((resolve) => {
			img.onload = () => resolve();
		});

		const doc = new jsPDF({
			orientation: "portrait",
			unit: "pt",
			format: [img.width, img.height],
		});

		const svgElement = qrRef.current.cloneNode(true) as SVGSVGElement;
		const hiddenDiv = document.createElement("div");
		hiddenDiv.style.visibility = "hidden";
		hiddenDiv.style.position = "absolute";
		hiddenDiv.style.top = "-9999px";
		hiddenDiv.appendChild(svgElement);
		document.body.appendChild(hiddenDiv);

		await doc.svg(svgElement, {
			x: 0,
			y: 0,
			width: img.width,
			height: img.height,
		});

		document.body.removeChild(hiddenDiv);

		doc.save("qr_code.pdf");
		URL.revokeObjectURL(url);
	};

	const handleCopyURL = async () => {
		if (!finalLink) return;
		try {
			await navigator.clipboard.writeText(finalLink);
			alert("URL copied to clipboard!");
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<div className="encoder-container">
			<h1>Image Encoder</h1>
			<p className="intro-text">
				Upload an image, adjust parameters, and encode it as a JPEG-XL
				fitting your target size.
			</p>

			<div className="encoder-config">
				<fieldset className="basic-settings">
					<legend>Basic Settings</legend>
					<label className="encoder-label">
						Choose image:
						<input
							type="file"
							accept="image/*"
							onChange={handleUpload}
						/>
					</label>

					<label className="encoder-label">
						Target Byte Length:
						<input
							type="number"
							value={targetBytesInput}
							onChange={(e) =>
								setTargetBytesInput(e.target.value)
							}
						/>
					</label>

					<label className="encoder-label">
						Quality (1-100):
						<input
							type="number"
							value={qualityInput}
							onChange={(e) => setQualityInput(e.target.value)}
						/>
					</label>

					<label className="encoder-label">
						Effort (1-9):
						<input
							type="number"
							value={effortInput}
							onChange={(e) => setEffortInput(e.target.value)}
						/>
					</label>

					<label className="encoder-checkbox-label">
						<input
							type="checkbox"
							checked={generateQR}
							onChange={(e) => setGenerateQR(e.target.checked)}
						/>
						Generate QR Code
					</label>
				</fieldset>

				<fieldset className="advanced-settings">
					<legend>Advanced Settings</legend>
					<label className="encoder-checkbox-label">
						<input
							type="checkbox"
							checked={progressive}
							onChange={(e) => setProgressive(e.target.checked)}
						/>
						Progressive
					</label>

					<label className="encoder-checkbox-label">
						<input
							type="checkbox"
							checked={lossyPalette}
							onChange={(e) => setLossyPalette(e.target.checked)}
						/>
						Lossy Palette
					</label>

					<label className="encoder-checkbox-label">
						<input
							type="checkbox"
							checked={lossyModular}
							onChange={(e) => setLossyModular(e.target.checked)}
						/>
						Lossy Modular
					</label>

					<label className="encoder-label">
						Decoding Speed Tier (0-3):
						<input
							type="number"
							value={decodingSpeedTierInput}
							onChange={(e) =>
								setDecodingSpeedTierInput(e.target.value)
							}
						/>
					</label>

					<label className="encoder-label">
						Photon Noise Iso:
						<input
							type="number"
							value={photonNoiseIsoInput}
							onChange={(e) =>
								setPhotonNoiseIsoInput(e.target.value)
							}
						/>
					</label>
				</fieldset>

				<div className="encode-button-container">
					<button
						className="encode-button"
						onClick={handleEncode}
						disabled={!file}
					>
						Encode
					</button>
				</div>
			</div>

			{status && <p className="status-message">{status}</p>}
			{errorMessage && <p className="error-message">{errorMessage}</p>}

			{finalLink && (
				<div className="report-section">
					<h2>Report</h2>
					<p>
						<strong>Iterations:</strong> {iterations}
					</p>
					<p>
						<strong>Time Taken:</strong> {duration.toFixed(2)} ms
					</p>
					<p>
						<strong>Final Scale:</strong> {finalScale.toFixed(4)}
					</p>
					<p>
						<strong>Original Dimensions:</strong> {originalDims[0]}x
						{originalDims[1]}
					</p>
					<p>
						<strong>Final Dimensions:</strong> {finalDims[0]}x
						{finalDims[1]}
					</p>
					<p>
						Reduced to{" "}
						{(
							((finalDims[0] * finalDims[1]) /
								(originalDims[0] * originalDims[1])) *
							100
						).toFixed(2)}
						% of original pixel count.
					</p>
				</div>
			)}

			{finalLink && (
				<div className="result-section">
					<h2>Results</h2>
					{finalDecodedImage && finalScaledPreview && (
						<div className="final-images">
							<div className="image-preview">
								<h3>Final Decoded Image (from JXL):</h3>
								<img
									src={finalDecodedImage}
									alt="Final Decoded PNG"
									className="final-image"
								/>
							</div>
							<div className="image-preview">
								<h3>Final Downsized PNG (Scaled Preview):</h3>
								<img
									src={finalScaledPreview}
									alt="Downsized PNG"
									className="final-image"
								/>
							</div>
							<p>Final Image Size: {finalLink.length} bytes</p>
						</div>
					)}

					<div className="url-section">
						<p>Link to decoded image page:</p>
						<a
							href={finalLink}
							target="_blank"
							rel="noreferrer"
							className="encoded-link"
						>
							{finalLink}
						</a>
						<button onClick={handleCopyURL} className="qr-button">
							Copy URL
						</button>
					</div>

					{generateQR && (
						<div className="qr-section">
							<h3>QR Code for Decoded Image</h3>
							<div className="qr-preview">
								<QRCodeSVG
									value={finalLink}
									marginSize={4}
									ref={qrRef}
								/>
							</div>
							<div className="qr-buttons">
								<button
									onClick={handleCopyQRPNG}
									className="qr-button"
								>
									{copyQRLabel}
								</button>
								<button
									onClick={handleDownloadSVG}
									className="qr-button"
								>
									Download SVG
								</button>
								<button
									onClick={handleDownloadPDF}
									className="qr-button"
								>
									Download PDF
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{attempts.length > 0 && (
				<div className="attempts-section">
					<h2>Attempts</h2>
					<p>Each iteration of the binary search is shown below:</p>
					<div className="attempt-cards">
						{attempts.map((attempt, i) => (
							<div key={i} className="attempt-card">
								<p>
									<strong>Iteration:</strong> {i + 1}
								</p>
								<p>
									<strong>Scale:</strong>{" "}
									{attempt.scale.toFixed(4)}
								</p>
								<p>
									<strong>Dimensions:</strong> {attempt.width}
									x{attempt.height}
								</p>
								<p>
									<strong>URL Length:</strong>{" "}
									{attempt.urlLength}
								</p>
								<img
									src={attempt.imageUrl}
									alt={`Attempt ${i + 1}`}
									className="attempt-image"
								/>
							</div>
						))}
					</div>
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
	effort: number,
	quality: number,
	progressive: boolean,
	lossyPalette: boolean,
	decodingSpeedTier: number,
	photonNoiseIso: number,
	lossyModular: boolean,
	onAttempt: (attempt: Attempt) => void
): Promise<{
	url: string;
	scale: number;
	count: number;
	width: number;
	height: number;
}> {
	const { width, height } = data;
	let low = 0.01;
	let high = 1.0;
	let bestUrl = "";
	let bestScale = high;
	let count = 0;

	while (high - low > 0.0001) {
		count++;
		const scale = (low + high) / 2.0;

		const scaledWidth = Math.max(1, Math.round(width * scale));
		const scaledHeight = Math.max(1, Math.round(height * scale));
		const scaledData = scaleImageData(data, scaledWidth, scaledHeight);

		const jxlBuffer = await encodeJXL(scaledData, {
			effort,
			quality,
			progressive,
			lossyPalette,
			decodingSpeedTier,
			photonNoiseIso,
			lossyModular,
		});
		const base64 = arrayBufferToBase64(jxlBuffer);
		const fullUrl = `${window.location.origin}/decode?data=${encodeURIComponent(
			base64
		)}`;

		// Create a preview
		const previewCanvas = document.createElement("canvas");
		previewCanvas.width = scaledWidth;
		previewCanvas.height = scaledHeight;
		const previewCtx = previewCanvas.getContext("2d");
		if (!previewCtx)
			throw new Error("Failed to get canvas context for preview");
		previewCtx.putImageData(scaledData, 0, 0);
		const previewDataUrl = previewCanvas.toDataURL("image/png");

		onAttempt({
			scale,
			width: scaledWidth,
			height: scaledHeight,
			urlLength: fullUrl.length,
			imageUrl: previewDataUrl,
		});

		await new Promise((r) => requestAnimationFrame(r)); // allow UI to update

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

function scaleImageData(
	imageData: ImageData,
	newWidth: number,
	newHeight: number
): ImageData {
	const canvas = document.createElement("canvas");
	canvas.width = newWidth;
	canvas.height = newHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get canvas context");

	const tmpCanvas = document.createElement("canvas");
	tmpCanvas.width = imageData.width;
	tmpCanvas.height = imageData.height;
	const tmpCtx = tmpCanvas.getContext("2d");
	if (!tmpCtx) throw new Error("Failed to get temp canvas context");
	tmpCtx.putImageData(imageData, 0, 0);

	ctx.drawImage(
		tmpCanvas,
		0,
		0,
		imageData.width,
		imageData.height,
		0,
		0,
		newWidth,
		newHeight
	);
	return ctx.getImageData(0, 0, newWidth, newHeight);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function extractBase64FromUrl(url: string): string | null {
	const match = url.match(/data=([^&]+)/);
	console.log(url, match);
	// unurl the base64
	if (match) {
		return decodeURIComponent(match[1]);
	}
	return null;
}

async function decodeBase64JXL(base64Data: string) {
	const binary = atob(base64Data);
	const len = binary.length;
	const buffer = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		buffer[i] = binary.charCodeAt(i);
	}

	return await decodeJXL(buffer.buffer);
}

function imageDataToDataUrl(
	data: Uint8ClampedArray,
	width: number,
	height: number
): string {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get canvas context");
	const imageData = new ImageData(data, width, height);
	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL("image/png");
}

export default ImageEncoder;

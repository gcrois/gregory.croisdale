import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import "../../styles/encode.scss";
import { ImageRunner, Bitmap, ShapeTypes, ShapeJsonExporter, SvgExporter } from "geometrizer-js";
import pako from "pako";

// Default values for shape generation
const DEFAULT_SHAPE_COUNT = 100;
const DEFAULT_ALPHA = 128;
const DEFAULT_CANDIDATE_SHAPES = 5;
const DEFAULT_SHAPE_MUTATIONS = 5;

interface Attempt {
	shapeCount: number;
	urlLength: number;
	imageUrl: string;
}

const GeometrizeImageEncoder: React.FC = () => {
	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [duration, setDuration] = useState<number>(0);
	const [originalDims, setOriginalDims] = useState<[number, number]>([0, 0]);
	const [finalLink, setFinalLink] = useState<string | null>(null);
	const [finalSvgPreview, setFinalSvgPreview] = useState<string | null>(null);

	// Use strings for numeric inputs to allow clearing them
	const [targetBytesInput, setTargetBytesInput] = useState<string>("2500");
	const [shapeCountInput, setShapeCountInput] = useState<string>(DEFAULT_SHAPE_COUNT.toString());
	const [alphaInput, setAlphaInput] = useState<string>(DEFAULT_ALPHA.toString());
	const [candidateShapesInput, setCandidateShapesInput] = useState<string>(DEFAULT_CANDIDATE_SHAPES.toString());
	const [shapeMutationsInput, setShapeMutationsInput] = useState<string>(DEFAULT_SHAPE_MUTATIONS.toString());

	// Derived numeric values
	const targetBytes = parseInt(targetBytesInput, 10) || 0;
	const shapeCount = parseInt(shapeCountInput, 10) || 0;
	const alpha = parseInt(alphaInput, 10) || 0;
	const candidateShapes = parseInt(candidateShapesInput, 10) || 0;
	const shapeMutations = parseInt(shapeMutationsInput, 10) || 0;

	// Shape types selection
	const [selectedShapeTypes, setSelectedShapeTypes] = useState<{
		[key: string]: boolean;
	}>({
		RECTANGLE: true,
		ROTATED_RECTANGLE: false,
		TRIANGLE: true,
		ELLIPSE: false,
		ROTATED_ELLIPSE: false,
		CIRCLE: true,
		LINE: false,
	});

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
		setDuration(0);
		setOriginalDims([0, 0]);
		setFinalSvgPreview(null);
	};

	const handleShapeTypeChange = (shapeType: string) => {
		setSelectedShapeTypes({
			...selectedShapeTypes,
			[shapeType]: !selectedShapeTypes[shapeType],
		});
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

	// Convert ImageData to Bitmap for geometrize
	function imageToBitmap(imageData: ImageData): any {
		// Create a bitmap with the same dimensions as the image
		const bitmap = Bitmap.create(imageData.width, imageData.height, 0);
		
		// Set each pixel in the bitmap
		for (let y = 0; y < imageData.height; y++) {
			for (let x = 0; x < imageData.width; x++) {
				const i = (y * imageData.width + x) * 4;
				const r = imageData.data[i];
				const g = imageData.data[i + 1];
				const b = imageData.data[i + 2];
				const a = imageData.data[i + 3];
				
				// Pack RGBA into a single value (format expected by geometrize-js)
				// This is a simplification - the actual implementation might differ
				const rgba = (r << 24) | (g << 16) | (b << 8) | a;
				bitmap.setPixel(x, y, rgba);
			}
		}
		
		return bitmap;
	}

	// Convert shape type strings to ShapeTypes enum values
	function getSelectedShapeTypes(): number[] {
		const types: number[] = [];
		if (selectedShapeTypes.RECTANGLE) types.push(ShapeTypes.RECTANGLE);
		if (selectedShapeTypes.ROTATED_RECTANGLE) types.push(ShapeTypes.ROTATED_RECTANGLE);
		if (selectedShapeTypes.TRIANGLE) types.push(ShapeTypes.TRIANGLE);
		if (selectedShapeTypes.ELLIPSE) types.push(ShapeTypes.ELLIPSE);
		if (selectedShapeTypes.ROTATED_ELLIPSE) types.push(ShapeTypes.ROTATED_ELLIPSE);
		if (selectedShapeTypes.CIRCLE) types.push(ShapeTypes.CIRCLE);
		if (selectedShapeTypes.LINE) types.push(ShapeTypes.LINE);
		return types;
	}

	// Fix JSON formatting issues from geometrize-js
	function fixJsonFormat(jsonStr: string): string {
		// Add missing commas between objects in arrays
		return jsonStr.replace(/\}\s*\{/g, '},{');
	}

	// Compress shape data for QR code
	function compressShapeData(data: string): string {
		// Use pako to compress the data
		const compressed = pako.deflate(data);
		
		// Convert to base64
		let binary = '';
		const bytes = new Uint8Array(compressed);
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	const handleEncode = async () => {
		if (!file) return;
		resetState();

		// Validate numeric inputs before proceeding
		if (!targetBytes || targetBytes < 100) {
			setErrorMessage("Invalid target byte length.");
			return;
		}
		if (shapeCount < 1) {
			setErrorMessage("Shape count must be at least 1.");
			return;
		}
		if (alpha < 1 || alpha > 255) {
			setErrorMessage("Alpha must be between 1 and 255.");
			return;
		}
		if (candidateShapes < 1) {
			setErrorMessage("Candidate shapes must be at least 1.");
			return;
		}
		if (shapeMutations < 1) {
			setErrorMessage("Shape mutations must be at least 1.");
			return;
		}

		// Check if at least one shape type is selected
		const activeShapeTypes = Object.values(selectedShapeTypes).filter(Boolean).length;
		if (activeShapeTypes === 0) {
			setErrorMessage("Please select at least one shape type.");
			return;
		}

		setStatus("Reading image...");
		try {
			// Load the image
			const imgData = await loadImageFile(file);
			setOriginalDims([imgData.width, imgData.height]);

			setStatus("Converting to bitmap...");
			const bitmap = imageToBitmap(imgData);

			setStatus("Processing with geometrize...");
			const startTime = performance.now();

			// Create an image runner with the bitmap
			const runner = new ImageRunner(bitmap);
			
			// Get the selected shape types
			const shapeTypeValues = getSelectedShapeTypes();
			
			// Run the algorithm for the specified number of shapes
			const allShapes = [];
			const options = {
				shapeTypes: shapeTypeValues,
				alpha: alpha,
				candidateShapesPerStep: candidateShapes,
				shapeMutationsPerStep: shapeMutations
			};
			
			// Run the algorithm for the specified number of shapes
			const shapes = [];
			for (let i = 0; i < shapeCount; i++) {
				const result = runner.step(options);
				shapes.push(...result);
				
				// Update progress every 10 shapes
				if (i % 10 === 0) {
					setStatus(`Processing shapes... ${i + 1}/${shapeCount}`);
					await new Promise(r => setTimeout(r, 0)); // Allow UI to update
				}
			}
			
			// Export the shapes to SVG
			const width = imgData.width;
			const height = imgData.height;
			const svg = SvgExporter.export(shapes, width, height);
			
			// Create a preview image
			const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
			setFinalSvgPreview(svgDataUrl);
			
			// Export the shapes to JSON
			const jsonData = ShapeJsonExporter.export(shapes);
			
			// Fix JSON formatting issues
			const fixedJsonData = fixJsonFormat(jsonData);
			console.log("Original JSON:", jsonData);
			console.log("Fixed JSON:", fixedJsonData);
			
			// Create a compact representation for the QR code
			const compactData = JSON.stringify({
				width,
				height,
				shapes: JSON.parse(fixedJsonData)
			});
			
			// Compress the data
			const compressedData = compressShapeData(compactData);
			
			// Create the URL
			const url = `${window.location.origin}/geometrize-decode?data=${encodeURIComponent(compressedData)}`;
			
			// Check if the URL is within the target byte length
			if (url.length <= targetBytes) {
				setFinalLink(url);
			} else {
				setErrorMessage(`URL length (${url.length} bytes) exceeds target byte length (${targetBytes} bytes). Try reducing the number of shapes or increasing the target byte length.`);
			}
			
			const endTime = performance.now();
			setDuration(endTime - startTime);
			setStatus("Done!");

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
			<h1>Geometrize Image Encoder</h1>
			<p className="intro-text">
				Upload an image, select shape types, adjust parameters, and encode it as geometric shapes.
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
						Shape Count:
						<input
							type="number"
							value={shapeCountInput}
							onChange={(e) => setShapeCountInput(e.target.value)}
						/>
					</label>

					<label className="encoder-label">
						Alpha (1-255):
						<input
							type="number"
							value={alphaInput}
							onChange={(e) => setAlphaInput(e.target.value)}
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
					<legend>Shape Types</legend>
					{Object.keys(selectedShapeTypes).map((shapeType) => (
						<label key={shapeType} className="encoder-checkbox-label">
							<input
								type="checkbox"
								checked={selectedShapeTypes[shapeType]}
								onChange={() => handleShapeTypeChange(shapeType)}
							/>
							{shapeType.replace(/_/g, " ")}
						</label>
					))}
				</fieldset>

				<fieldset className="advanced-settings">
					<legend>Advanced Settings</legend>
					<label className="encoder-label">
						Candidate Shapes Per Step:
						<input
							type="number"
							value={candidateShapesInput}
							onChange={(e) =>
								setCandidateShapesInput(e.target.value)
							}
						/>
					</label>

					<label className="encoder-label">
						Shape Mutations Per Step:
						<input
							type="number"
							value={shapeMutationsInput}
							onChange={(e) =>
								setShapeMutationsInput(e.target.value)
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
				<div className="result-section">
					<h2>Results</h2>
					{finalSvgPreview && (
						<div className="final-images">
							<div className="image-preview">
								<h3>Geometrized Image:</h3>
								<img
									src={finalSvgPreview}
									alt="Geometrized SVG"
									className="final-image"
								/>
							</div>
							<p>Final Data Size: {finalLink.length} bytes</p>
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

		</div>
	);
};

export default GeometrizeImageEncoder;

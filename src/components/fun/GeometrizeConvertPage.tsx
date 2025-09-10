import React, { useEffect, useState, useRef } from "react";
import pako from "pako";

// Function to fix JSON formatting issues from geometrize-js
function fixJsonFormat(jsonStr: string): string {
	// Add missing commas between objects in arrays
	return jsonStr.replace(/\}\s*\{/g, '},{');
}

const GeometrizeConvertPage: React.FC = () => {
	const [status, setStatus] = useState<string>("Initializing...");
	const [error, setError] = useState<string | null>(null);
	const [finalUrl, setFinalUrl] = useState<string | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		(async () => {
			const urlParams = new URLSearchParams(window.location.search);
			const base64Data = urlParams.get("data");
			if (!base64Data) {
				setError("No data parameter found in URL.");
				return;
			}

			try {
				setStatus("Decoding shape data...");
				
				// Decode and decompress the data
				// Convert base64 to binary
				const binary = atob(base64Data);
				
				// Convert binary to Uint8Array
				const bytes = new Uint8Array(binary.length);
				for (let i = 0; i < binary.length; i++) {
					bytes[i] = binary.charCodeAt(i);
				}
				
				// Decompress the data
				const decompressed = pako.inflate(bytes);
				
				// Convert to string
				let jsonString = '';
				const chunkSize = 0xffff;
				for (let i = 0; i < decompressed.length; i += chunkSize) {
					jsonString += String.fromCharCode.apply(null, 
						// @ts-ignore - TypeScript doesn't like the apply with Uint8Array
						decompressed.subarray(i, i + chunkSize));
				}
				
				// Fix any JSON formatting issues that might have occurred
				const fixedJsonString = fixJsonFormat(jsonString);
				
				// Parse the JSON
				const shapeData = JSON.parse(fixedJsonString);
			
				setStatus("Rendering shapes...");
				
				// Render the shapes to the canvas
				if (canvasRef.current) {
					const canvas = canvasRef.current;
					canvas.width = shapeData.width;
					canvas.height = shapeData.height;
					const ctx = canvas.getContext("2d");
					
					if (ctx) {
						// Clear the canvas
						ctx.fillStyle = "white";
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						
						// Draw each shape
						shapeData.shapes.forEach((shape: any) => {
							ctx.globalAlpha = shape.opacity || 1;
							ctx.fillStyle = shape.color || "black";
							
							switch (shape.type) {
								case "rect":
									ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
									break;
								case "circle":
									ctx.beginPath();
									ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
									ctx.fill();
									break;
								case "polygon":
									const points = shape.points.split(" ");
									ctx.beginPath();
									for (let i = 0; i < points.length; i++) {
										const [x, y] = points[i].split(",");
										if (i === 0) {
											ctx.moveTo(parseFloat(x), parseFloat(y));
										} else {
											ctx.lineTo(parseFloat(x), parseFloat(y));
										}
									}
									ctx.closePath();
									ctx.fill();
									break;
								default:
									console.warn(`Unknown shape type: ${shape.type}`);
							}
						});
					}
				}
				
				// Create a blob URL for the canvas
				if (canvasRef.current) {
					canvasRef.current.toBlob((blob) => {
						if (blob) {
							const url = URL.createObjectURL(blob);
							setFinalUrl(url);
							setStatus("Done!");
						} else {
							throw new Error("Failed to create blob from canvas");
						}
					}, "image/png");
				}
				
			} catch (err: any) {
				console.error("Decoding failed:", err);
				setError(`Decoding failed: ${err?.message || err.toString()}`);
			}
		})();
	}, []);

	const handleDownload = () => {
		if (!finalUrl) return;
		
		const a = document.createElement("a");
		a.href = finalUrl;
		a.download = "geometrized_image.png";
		a.click();
	};

	return (
		<div style={{ textAlign: "center", padding: "20px" }}>
			{error ? (
				<div style={{ color: "red" }}>
					<p>Error encountered:</p>
					<pre>{error}</pre>
				</div>
			) : (
				<>
					<p>{status}</p>
					<canvas 
						ref={canvasRef} 
						style={{ 
							display: "block", 
							margin: "20px auto", 
							border: "1px solid #ccc",
							maxWidth: "100%" 
						}}
					/>
					{finalUrl && (
						<div>
							<p>
								<a href={finalUrl} target="_blank" rel="noreferrer">
									Open image in new tab
								</a>
							</p>
							<button 
								onClick={handleDownload}
								style={{
									padding: "10px 20px",
									background: "#4CAF50",
									color: "white",
									border: "none",
									borderRadius: "4px",
									cursor: "pointer",
									margin: "10px"
								}}
							>
								Download Image
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default GeometrizeConvertPage;

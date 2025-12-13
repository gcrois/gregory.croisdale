import React, { useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import sanitize from "sanitize-filename";

const QRCodeGenerator: React.FC = () => {
	const [text, setText] = useState<string>("https://g.regory.dev");
	const [size, setSize] = useState<number>(256);
	const [isTransparent, setIsTransparent] = useState<boolean>(false);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const svgRef = React.useRef<SVGSVGElement>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value);
	};

	const downloadSVG = () => {
		if (svgRef.current) {
			const svgData = new XMLSerializer().serializeToString(
				svgRef.current
			);
			const blob = new Blob([svgData], {
				type: "image/svg+xml;charset=utf-8",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${sanitize(text)}-qr.svg`;
			a.click();
			URL.revokeObjectURL(url);
		}
	};

	return (
		<div className="util-card glass-panel">
			<h2>QR Code Generator</h2>
			<input
				className="util-input"
				type="text"
				value={text}
				onChange={handleChange}
				placeholder="Enter text to generate QR code"
			/>

			<div className="input-group">
				<label htmlFor="sizeInput">Resolution (px):</label>
				<div
					style={{
						display: "flex",
						gap: "10px",
						alignItems: "center",
					}}
				>
					<input
						id="sizeRange"
						type="range"
						min="128"
						max="4096"
						step="32"
						value={size}
						onChange={(e) => setSize(Number(e.target.value))}
						style={{ flex: 1 }}
					/>
					<input
						id="sizeInput"
						className="util-input"
						type="number"
						min="1"
						value={size}
						onChange={(e) => setSize(Number(e.target.value))}
						style={{ width: "80px", padding: "5px" }}
					/>
				</div>
			</div>

			<div className="input-group checkbox-row">
				<input
					id="transparentInput"
					type="checkbox"
					checked={isTransparent}
					onChange={(e) => setIsTransparent(e.target.checked)}
				/>
				<label htmlFor="transparentInput">Transparent Background</label>
			</div>

			<div
				className="qr-container"
				style={{ background: isTransparent ? "transparent" : "white" }}
			>
				<QRCodeCanvas
					value={text}
					size={size}
					marginSize={1}
					bgColor={isTransparent ? "transparent" : "#ffffff"}
					ref={canvasRef}
					style={{ width: "100%", height: "auto", maxWidth: "256px" }}
				/>
			</div>

			{/* Hidden SVG for download purposes */}
			<div style={{ display: "none" }}>
				<QRCodeSVG
					value={text}
					size={size}
					marginSize={1}
					bgColor={isTransparent ? "transparent" : "#ffffff"}
					ref={svgRef}
				/>
			</div>

			<div className="button-group">
				<button
					className="util-btn primary"
					onClick={() =>
						canvasRef.current?.toBlob((blob) => {
							const url = URL.createObjectURL(blob!);
							const a = document.createElement("a");
							a.href = url;
							a.download = `${sanitize(text)}-qr.png`;
							a.click();
							URL.revokeObjectURL(url);
						})
					}
				>
					Download PNG
				</button>
				<button className="util-btn secondary" onClick={downloadSVG}>
					Download SVG
				</button>
				<button
					className="util-btn secondary"
					onClick={() => {
						canvasRef.current?.toBlob((blob) => {
							try {
								navigator.clipboard.write([
									new ClipboardItem({
										"image/png": blob!,
									}),
								]);
							} catch (error) {
								console.error(error);
							}
						});
					}}
				>
					Copy PNG
				</button>
			</div>
		</div>
	);
};

export default QRCodeGenerator;

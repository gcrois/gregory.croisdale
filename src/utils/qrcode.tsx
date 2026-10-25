import React, { useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
	createQRPayload,
	createQRRoute,
	initialQRFields,
	qrModes,
	type QRFields,
	type QRMode,
} from "./qr-payload";

const QRCodeGenerator: React.FC = () => {
	const [mode, setMode] = useState<QRMode>("url");
	const [fields, setFields] = useState<QRFields>(initialQRFields);
	const [size, setSize] = useState(256);
	const [isTransparent, setIsTransparent] = useState(false);
	const [status, setStatus] = useState("");
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const svgRef = React.useRef<SVGSVGElement>(null);
	const { value, error } = createQRPayload(mode, fields);
	const qrRoutePath = createQRRoute(mode, value);
	const qrRouteUrl =
		typeof window === "undefined"
			? qrRoutePath
			: `${window.location.origin}${qrRoutePath}`;
	const filename = `${mode}-qr`;
	const activeMode = qrModes.find((item) => item.value === mode)!;
	const update = <K extends keyof QRFields>(key: K, next: QRFields[K]) => {
		setFields((previous) => ({ ...previous, [key]: next }));
		setStatus("");
	};

	const input = (
		key: keyof QRFields,
		label: string,
		placeholder: string,
		type = "text",
		multiline = false
	) => (
		<div className="qr-field">
			<label htmlFor={`qr-${key}`}>{label}</label>
			{multiline ? (
				<textarea
					id={`qr-${key}`}
					className="util-input"
					rows={4}
					value={String(fields[key])}
					placeholder={placeholder}
					onChange={(event) => update(key, event.target.value)}
				/>
			) : (
				<input
					id={`qr-${key}`}
					className="util-input"
					type={type}
					value={String(fields[key])}
					placeholder={placeholder}
					onChange={(event) => update(key, event.target.value)}
				/>
			)}
		</div>
	);

	const download = (blob: Blob, extension: string) => {
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${filename}.${extension}`;
		anchor.click();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
	};
	const downloadSVG = () => {
		if (!svgRef.current) return;
		const data = new XMLSerializer().serializeToString(svgRef.current);
		download(
			new Blob([data], { type: "image/svg+xml;charset=utf-8" }),
			"svg"
		);
	};
	const downloadPNG = () =>
		canvasRef.current?.toBlob((blob) => {
			if (blob) download(blob, "png");
		});
	const copyPNG = async () => {
		try {
			const blob = await new Promise<Blob>((resolve, reject) => {
				if (!canvasRef.current) return reject(new Error("No QR code"));
				canvasRef.current.toBlob((blob) =>
					blob ? resolve(blob) : reject(new Error("No image"))
				);
			});
			await navigator.clipboard.write([
				new ClipboardItem({ "image/png": blob }),
			]);
			setStatus("PNG copied.");
		} catch {
			setStatus(
				"Couldn't copy the image. Try downloading the PNG instead."
			);
		}
	};

	return (
		<div className="util-card glass-panel">
			<div>
				<div className="qr-heading">
					<h2>QR Code Generator</h2>
					<select
						className="qr-type"
						aria-label="Content type"
						value={mode}
						onChange={(event) => {
							setMode(event.target.value as QRMode);
							setStatus("");
						}}
					>
						{qrModes.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</select>
				</div>
				<p className="qr-description">
					{mode === "url"
						? "Your QR code updates as you type."
						: activeMode.hint}
				</p>
			</div>

			<div className="qr-fields">
				{mode === "url" &&
					input("url", "Website URL", "https://example.com", "url")}
				{mode === "text" &&
					input(
						"text",
						"Text",
						"Write anything you'd like to share…",
						"text",
						true
					)}
				{mode === "email" && (
					<>
						{input(
							"email",
							"Email address",
							"hello@example.com",
							"email"
						)}
						{input("subject", "Subject (optional)", "Hello!")}
						{input(
							"emailBody",
							"Message (optional)",
							"Write your email…",
							"text",
							true
						)}
					</>
				)}
				{(mode === "phone" || mode === "sms") &&
					input("phone", "Phone number", "+1 212 555 0123", "tel")}
				{mode === "sms" &&
					input(
						"smsBody",
						"Message (optional)",
						"Write your text message…",
						"text",
						true
					)}
				{mode === "wifi" && (
					<>
						{input(
							"ssid",
							"Network name (SSID)",
							"Your Wi-Fi network"
						)}
						<div className="qr-field">
							<label htmlFor="qr-security">Security</label>
							<select
								id="qr-security"
								className="util-input"
								value={fields.security}
								onChange={(event) =>
									update(
										"security",
										event.target
											.value as QRFields["security"]
									)
								}
							>
								<option value="WPA">
									WPA / WPA2 / WPA3 Personal
								</option>
								<option value="WEP">WEP</option>
								<option value="nopass">No password</option>
							</select>
						</div>
						{fields.security !== "nopass" &&
							input(
								"password",
								"Password",
								"Network password",
								"password"
							)}
						<div className="checkbox-row">
							<input
								id="qr-hidden"
								type="checkbox"
								checked={fields.hidden}
								onChange={(event) =>
									update("hidden", event.target.checked)
								}
							/>
							<label htmlFor="qr-hidden">Hidden network</label>
						</div>
					</>
				)}
			</div>

			<div className="qr-field">
				<label htmlFor="sizeInput">Resolution (px)</label>
				<div className="qr-resolution">
					<input
						id="sizeRange"
						aria-label="QR code resolution"
						type="range"
						min="128"
						max="4096"
						step="32"
						value={size}
						onChange={(event) =>
							setSize(Number(event.target.value))
						}
					/>
					<input
						id="sizeInput"
						className="util-input"
						type="number"
						min="128"
						max="4096"
						value={size}
						onChange={(event) =>
							setSize(
								Math.max(
									128,
									Math.min(
										4096,
										Number(event.target.value) || 128
									)
								)
							)
						}
					/>
				</div>
			</div>
			<div className="checkbox-row">
				<input
					id="transparentInput"
					type="checkbox"
					checked={isTransparent}
					onChange={(event) => setIsTransparent(event.target.checked)}
				/>
				<label htmlFor="transparentInput">Transparent background</label>
			</div>

			{error ? (
				<p className="qr-empty" role="status">
					{error}
				</p>
			) : (
				<>
					<div
						className="qr-container"
						role="img"
						aria-label={`${activeMode.label} QR code preview`}
						style={{
							background: isTransparent ? "transparent" : "white",
						}}
					>
						<QRCodeCanvas
							value={value}
							size={size}
							level="M"
							marginSize={4}
							bgColor={isTransparent ? "transparent" : "#ffffff"}
							ref={canvasRef}
							style={{
								width: "100%",
								height: "auto",
								maxWidth: "256px",
							}}
						/>
					</div>
					<div style={{ display: "none" }}>
						<QRCodeSVG
							value={value}
							size={size}
							level="M"
							marginSize={4}
							bgColor={isTransparent ? "transparent" : "#ffffff"}
							ref={svgRef}
						/>
					</div>
				</>
			)}

			<div className="button-group">
				<button
					className="util-btn primary"
					disabled={!!error}
					onClick={downloadPNG}
				>
					Download PNG
				</button>
				<button
					className="util-btn secondary"
					disabled={!!error}
					onClick={downloadSVG}
				>
					Download SVG
				</button>
				<button
					className="util-btn secondary"
					disabled={!!error}
					onClick={copyPNG}
				>
					Copy PNG
				</button>
			</div>
			{!error && (
				<div className="result-container">
					<h3>Fullscreen QR</h3>
					<p className="result-text qr-route">{qrRouteUrl}</p>
					<div className="button-group">
						<a
							className="util-btn secondary"
							href={qrRoutePath}
							target="_blank"
							rel="noopener noreferrer"
						>
							Open fullscreen
						</a>
						<button
							className="util-btn secondary"
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(
										qrRouteUrl
									);
									setStatus("Link copied.");
								} catch {
									setStatus(
										"Couldn't copy the link. You can select and copy it above."
									);
								}
							}}
						>
							Copy link
						</button>
					</div>
				</div>
			)}
			{status && (
				<p className="qr-description" role="status">
					{status}
				</p>
			)}
		</div>
	);
};

export default QRCodeGenerator;

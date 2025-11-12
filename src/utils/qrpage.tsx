// https://chatgpt.com/share/6914f547-e91c-8008-b8f8-34088b46d4d9

import React, { useMemo, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

type FullscreenQRProps = {
	queryKey?: string;
	background?: string;
	fgColor?: string;
	bgColor?: string;
	level?: "L" | "M" | "Q" | "H";
	padding?: number;
};

const FullscreenQR: React.FC<FullscreenQRProps> = ({
	queryKey = "url",
	background = "#0b0b0b",
	fgColor = "#000000",
	bgColor = "#ffffff",
	level = "M",
	padding = 24,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const value = useMemo(() => {
		if (typeof window === "undefined") return "";
		const sp = new URLSearchParams(window.location.search);
		const keys = [queryKey, "url", "q", "text"];
		for (const k of keys) {
			const v = sp.get(k);
			if (v && v.trim().length > 0)
				return v.replace(/\$SNAKE/g, window.location.href).trim();
		}
		return "";
	}, [queryKey]);

	return (
		<div
			style={{
				background,
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding,
				boxSizing: "border-box",
			}}
		>
			{value ? (
				<div
					style={{
						// Maintain square aspect ratio
						aspectRatio: "1 / 1",
						width: "min(90vmin, 90%)",
						height: "auto",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<QRCodeSVG
						value={value}
						level={level}
						bgColor={bgColor}
						fgColor={fgColor}
						style={{
							width: "100%",
							height: "100%",
						}}
					/>
				</div>
			) : (
				<div
					style={{
						color: "#ffffff",
						fontFamily:
							"ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
						textAlign: "center",
						lineHeight: 1.3,
					}}
				>
					<div style={{ opacity: 0.75, fontSize: 16, marginBottom: 8 }}>
						Provide a querystring like:
					</div>
					<code
						style={{
							display: "inline-block",
							padding: "8px 12px",
							borderRadius: 8,
							background: "rgba(255,255,255,0.1)",
							fontSize: 14,
						}}
					>
						?{queryKey}=https%3A%2F%2Fg.regory.dev
					</code>
				</div>
			)}
		</div>
	);
};

export default FullscreenQR;

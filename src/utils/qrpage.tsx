import React, { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Confetti from "react-confetti";

type FullscreenQRProps = {
	queryKey?: string;
	background?: string;
	fgColor?: string;
	bgColor?: string;
	level?: "L" | "M" | "Q" | "H";
	padding?: number;
	disco?: boolean;
};

type Spotlight = {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	hue: number;
	radius: number;
};

const FullscreenQR: React.FC<FullscreenQRProps> = ({
	queryKey = "url",
	background = "#0b0b0b",
	fgColor = "#000000",
	bgColor = "#ffffff",
	level = "M",
	padding = 24,
	disco = false,
}) => {
	const [colorPhase, setColorPhase] = useState(0);
	const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const [wobble, setWobble] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
	const frameRef = useRef(0);
	const animationRef = useRef<number>();

	// Disco mode detection
	const discoEnabled = useMemo(() => {
		if (disco) return true;
		if (typeof window === "undefined") return false;
		const sp = new URLSearchParams(window.location.search);
		return sp.get("disco") === "true";
	}, [disco]);

	// Initialize spotlights
	useEffect(() => {
		if (!discoEnabled) return;

		const spots: Spotlight[] = Array.from({ length: 4 }, (_, i) => ({
			id: i,
			x: Math.random() * window.innerWidth,
			y: Math.random() * window.innerHeight,
			vx: (Math.random() - 0.5) * 4,
			vy: (Math.random() - 0.5) * 4,
			hue: i * 90,
			radius: 200 + Math.random() * 100,
		}));
		setSpotlights(spots);
	}, [discoEnabled]);

	// Window dimensions
	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		updateDimensions();
		window.addEventListener("resize", updateDimensions);
		return () => window.removeEventListener("resize", updateDimensions);
	}, []);

	useEffect(() => {
		if (!discoEnabled) return;

		let lastTime = 0;
		const targetFPS = 60;
		const frameInterval = 1000 / targetFPS;

		const animate = (currentTime: number) => {
			if (currentTime - lastTime >= frameInterval) {
				lastTime = currentTime;
				frameRef.current++;

				// Color cycling
				setColorPhase((prev) => (prev + 6) % 360);

				// Chaotic wobble for QR code
				const t = frameRef.current * 0.05;
				setWobble({
					x: Math.sin(t * 1.3) * 20 + Math.sin(t * 2.1) * 10,
					y: Math.cos(t * 1.7) * 20 + Math.cos(t * 1.9) * 10,
					scale:
						1 + Math.sin(t * 0.7) * 0.2 + Math.sin(t * 3.3) * 0.1,
					rotate: Math.sin(t) * 15 + Math.sin(t * 2.7) * 5,
				});

				// Update spotlights
				setSpotlights((spots) =>
					spots.map((spot) => {
						let newX = spot.x + spot.vx;
						let newY = spot.y + spot.vy;
						let newVx = spot.vx;
						let newVy = spot.vy;

						// Bounce
						if (
							newX <= -spot.radius ||
							newX >= dimensions.width + spot.radius
						) {
							newVx = -newVx;
						}
						if (
							newY <= -spot.radius ||
							newY >= dimensions.height + spot.radius
						) {
							newVy = -newVy;
						}

						return {
							...spot,
							x: newX,
							y: newY,
							vx: newVx,
							vy: newVy,
							hue: (spot.hue + 3) % 360,
						};
					})
				);
			}

			animationRef.current = requestAnimationFrame(animate);
		};

		animationRef.current = requestAnimationFrame(animate);

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [discoEnabled, dimensions.width, dimensions.height]);

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

	const dynamicPageBg = discoEnabled
		? `hsl(${colorPhase}, 100%, 15%)`
		: background;

	return (
		<div
			style={{
				background: dynamicPageBg,
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding,
				boxSizing: "border-box",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Spotlights behind everything */}
			{discoEnabled &&
				spotlights.map((spot) => (
					<div
						key={spot.id}
						style={{
							position: "absolute",
							left: spot.x,
							top: spot.y,
							width: spot.radius * 2,
							height: spot.radius * 2,
							transform: "translate(-50%, -50%)",
							background: `radial-gradient(circle, hsla(${spot.hue}, 100%, 60%, 0.4) 0%, hsla(${spot.hue}, 100%, 50%, 0.2) 30%, transparent 70%)`,
							pointerEvents: "none",
							zIndex: 1,
						}}
					/>
				))}

			{value ? (
				<div
					style={{
						aspectRatio: "1 / 1",
						width: "min(70vmin, 70%)",
						height: "auto",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						position: "relative",
						zIndex: 5,
						transform: discoEnabled
							? `translate(${wobble.x}px, ${wobble.y}px) scale(${wobble.scale}) rotate(${wobble.rotate}deg)`
							: "none",
					}}
				>
					<QRCodeSVG
						value={value}
						level={level}
						bgColor="transparent"
						fgColor={
							discoEnabled
								? `hsl(${colorPhase}, 100%, 60%)`
								: fgColor
						}
						style={{
							width: "100%",
							height: "100%",
							filter: discoEnabled
								? `drop-shadow(0 0 20px hsl(${colorPhase}, 100%, 60%))`
								: "none",
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
						zIndex: 20,
						position: "relative",
					}}
				>
					<div
						style={{ opacity: 0.75, fontSize: 16, marginBottom: 8 }}
					>
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

			{/* Confetti on top */}
			{discoEnabled && (
				<Confetti
					width={dimensions.width}
					height={dimensions.height}
					recycle={true}
					numberOfPieces={1000}
					gravity={0.03}
					wind={0.01}
					opacity={0.8}
					colors={[
						"#ff0000",
						"#ff7f00",
						"#ffff00",
						"#00ff00",
						"#0000ff",
						"#ff00ff",
						"#00ffff",
						"#ffffff",
					]}
					style={{ position: "absolute", zIndex: 10 }}
				/>
			)}
		</div>
	);
};

export default FullscreenQR;

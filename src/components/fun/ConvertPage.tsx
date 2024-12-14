import React, { useEffect, useState } from "react";
import { decode as decodeJXL } from "@jsquash/jxl";

const ConvertPage: React.FC = () => {
	const [imgSrc, setImgSrc] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			const urlParams = new URLSearchParams(window.location.search);
			const base64Data = urlParams.get("data");
			if (!base64Data) return;

			try {
				const binary = atob(base64Data);
				const len = binary.length;
				const buffer = new Uint8Array(len);
				for (let i = 0; i < len; i++) {
					buffer[i] = binary.charCodeAt(i);
				}

				// Decode JXL to raw image data
				const { data, width, height } = await decodeJXL(buffer.buffer);
				const imageData = new ImageData(data, width, height);

				// Convert raw image data to PNG blob via a canvas
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Failed to get canvas context");
				ctx.putImageData(imageData, 0, 0);

				canvas.toBlob((blob) => {
					if (!blob) return;
					const url = URL.createObjectURL(blob);
					setImgSrc(url);
				}, "image/png");
			} catch (err) {
				console.error("Decoding failed:", err);
			}
		})();
	}, []);

	return (
		<div>
			<h1>Converted PNG</h1>
			{imgSrc ? <img src={imgSrc} alt="Converted" /> : <p>Loading...</p>}
		</div>
	);
};

export default ConvertPage;

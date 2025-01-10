import React, { useEffect, useState } from "react";
import { decode as decodeJXL } from "@jsquash/jxl";

const ConvertPage: React.FC = () => {
	const [status, setStatus] = useState<string>("Initializing...");
	const [error, setError] = useState<string | null>(null);
	const [finalUrl, setFinalUrl] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			const urlParams = new URLSearchParams(window.location.search);
			const base64Data = urlParams.get("data");
			if (!base64Data) {
				setError("No data parameter found in URL.");
				return;
			}

			try {
				setStatus("Converting base64 to binary...");
				const binary = atob(base64Data);
				const buffer = new Uint8Array(binary.length);
				for (let i = 0; i < binary.length; i++) {
					buffer[i] = binary.charCodeAt(i);
				}

				setStatus("Decoding JXL image...");
				const { data, width, height } = await decodeJXL(buffer.buffer);

				setStatus("Creating ImageData...");
				const imageData = new ImageData(data, width, height);

				setStatus("Rendering to canvas...");
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) throw new Error("Failed to get canvas context");

				ctx.putImageData(imageData, 0, 0);

				setStatus("Converting to PNG via blob...");
				canvas.toBlob((blob) => {
					if (!blob) {
						throw new Error("Failed to create blob from canvas");
					}

					const objectURL = URL.createObjectURL(blob);
					setStatus("Attempting redirect...");
					try {
						window.location.replace(objectURL);
						// If replace doesn't work, the user will see the link below.
						setFinalUrl(objectURL);
					} catch (err: any) {
						console.error("Redirect failed:", err);
						setFinalUrl(objectURL);
					}
				}, "image/png");
			} catch (err: any) {
				console.error("Decoding failed:", err);
				setError(`Decoding failed: ${err?.message || err.toString()}`);
			}
		})();
	}, []);

	return (
		<div>
			{error ? (
				<div style={{ color: "red" }}>
					<p>Error encountered:</p>
					<pre>{error}</pre>
				</div>
			) : (
				<>
					<p>{status}</p>
					{finalUrl && (
						<p>
							If you're stuck,{" "}
							<a href={finalUrl}>click here to open the image</a>.
						</p>
					)}
				</>
			)}
		</div>
	);
};

export default ConvertPage;

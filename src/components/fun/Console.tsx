import devtoolsDetect from "devtools-detect";
import { useState, useEffect } from "react";

export function DevToolsStatus() {
	const [isDevToolsOpen, setIsDevToolsOpen] = useState(devtoolsDetect.isOpen);

	useEffect(() => {
		const handleChange = (e: { detail: { isOpen: boolean } }) => {
			setIsDevToolsOpen(e.detail.isOpen);
		};

		window.addEventListener("devtoolschange", handleChange);

		return () => {
			window.removeEventListener("devtoolschange", handleChange);
		};
	}, []);

	useEffect(() => {
		if (isDevToolsOpen)
			console.log("Hello snoopy person 👀 Enjoy my website!");
	}, [isDevToolsOpen]);

	return <></>;
}

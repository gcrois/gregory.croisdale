export const qrModes = [
	{ value: "url", label: "URL", hint: "Open a website when scanned." },
	{
		value: "text",
		label: "Text",
		hint: "Share plain text, including multiple lines and emoji.",
	},
	{
		value: "email",
		label: "Email",
		hint: "Start an email with a recipient, subject, and message.",
	},
	{
		value: "phone",
		label: "Phone",
		hint: "Open the dialer with your phone number.",
	},
	{
		value: "sms",
		label: "SMS",
		hint: "Start a text message with an optional message.",
	},
	{
		value: "wifi",
		label: "Wi-Fi",
		hint: "Let someone join your wireless network.",
	},
] as const;

export type QRMode = (typeof qrModes)[number]["value"];

export type QRFields = {
	url: string;
	text: string;
	email: string;
	subject: string;
	emailBody: string;
	phone: string;
	smsBody: string;
	ssid: string;
	password: string;
	security: "WPA" | "WEP" | "nopass";
	hidden: boolean;
};

export const initialQRFields: QRFields = {
	url: "https://g.regory.dev",
	text: "",
	email: "",
	subject: "",
	emailBody: "",
	phone: "",
	smsBody: "",
	ssid: "",
	password: "",
	security: "WPA",
	hidden: false,
};

// ZXing's Wi-Fi format escapes delimiters inside network names and passwords.
const escapeWifi = (value: string) => value.replace(/[\\;,:\"]/g, "\\$&");
const normalizePhone = (value: string) => value.replace(/[\s().-]/g, "");

export function createQRPayload(mode: QRMode, fields: QRFields) {
	let value = "";
	let error = "";
	const phone = normalizePhone(fields.phone);
	switch (mode) {
		case "url":
			value = fields.url.trim();
			try {
				const url = new URL(value);
				if (!["http:", "https:"].includes(url.protocol))
					throw new Error();
			} catch {
				error =
					"Enter a complete website URL, starting with https:// or http://.";
			}
			break;
		case "text":
			value = fields.text;
			if (!value.trim()) error = "Enter some text to generate a QR code.";
			break;
		case "email": {
			const address = fields.email.trim();
			if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(address)) {
				error = "Enter a valid email address.";
			}
			const query = [
				fields.subject
					? `subject=${encodeURIComponent(fields.subject)}`
					: "",
				fields.emailBody
					? `body=${encodeURIComponent(fields.emailBody)}`
					: "",
			]
				.filter(Boolean)
				.join("&");
			value = `mailto:${encodeURIComponent(address).replace(/%40/g, "@").replace(/%2B/g, "+")}${query ? `?${query}` : ""}`;
			break;
		}
		case "phone":
		case "sms":
			if (!/^\+?\d{3,15}$/.test(phone))
				error =
					"Enter a phone number, including the country code (e.g. +1 212 555 0123).";
			value =
				mode === "phone"
					? `tel:${phone}`
					: `sms:${phone}${fields.smsBody ? `?body=${encodeURIComponent(fields.smsBody)}` : ""}`;
			break;
		case "wifi":
			if (!fields.ssid.trim()) error = "Enter a network name.";
			else if (fields.security !== "nopass" && !fields.password)
				error = "Enter the network password, or choose No password.";
			value = `WIFI:T:${fields.security};S:${escapeWifi(fields.ssid)};${fields.security !== "nopass" ? `P:${escapeWifi(fields.password)};` : ""}H:${fields.hidden};;`;
			break;
	}
	// Stay within the byte capacity of a single QR at medium error correction.
	if (new TextEncoder().encode(value).length > 2000) {
		error =
			"This content is too long. Keep the encoded content under 2,000 bytes.";
	}
	return { value, error };
}

export function createQRRoute(mode: QRMode, value: string) {
	const key = mode === "url" ? "url" : "text";
	return `/qr/?${key}=${encodeURIComponent(value)}`;
}

import React, { useState } from "react";
import RandExp from "randexp";
import { generate } from "random-words";

const regexOptions = [
	{
		value: "strong",
		regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=.{12,})[A-Za-z\\d@#$%^&+=!]{12,32}$",
		label: "Strong Password",
		description:
			"At least 12 characters, max 32. Includes uppercase, lowercase, number, and special character.",
	},
	{
		value: "very-strong",
		regex: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?=.{16,})[A-Za-z\\d@#$%^&+=!]{16,64}$",
		label: "Very Strong Password",
		description:
			"At least 16 characters, max 64. Includes uppercase, lowercase, number, and special character.",
	},
	{
		value: "memorable",
		regex: "^($word){3}\\d{2,4}[@#$%^&+=!]{1,2}$", // Use custom $word token here
		label: "Memorable Password",
		description:
			"3 random words, followed by 2-4 digits and 1-2 special characters.",
	},
	{
		value: "pin",
		regex: "\\d{6}",
		label: "PIN",
		description: "6-digit PIN number.",
	},
];

// Function to replace custom tokens after the base password is generated
const transformCustomTokens = (generatedString: string): string => {
	// Replace each occurrence of $word with a random capitalized word
	return generatedString.replace(/word/g, () => {
		const word = generate({ exactly: 1, maxLength: 12 })[0];
		return word.charAt(0).toUpperCase() + word.slice(1);
	});
};

const PasswordGenerator = () => {
	const [password, setPassword] = useState("");
	const [currentRegex, setCurrentRegex] = useState(regexOptions[0].regex);
	const [selectedOption, setSelectedOption] = useState("strong");

	const generatePassword = () => {
		try {
			// Generate the base string using RandExp
			const randexp = new RandExp(new RegExp(currentRegex));
			let basePassword = randexp.gen();

			// Apply custom transformations to the generated base string
			const transformedPassword = transformCustomTokens(basePassword);

			// Set the final password
			setPassword(transformedPassword);
		} catch (error) {
			setPassword("Invalid regex pattern");
		}
	};

	const handleRegexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCurrentRegex(e.target.value);
		setSelectedOption("custom");
	};

	const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selected = regexOptions.find(
			(option) => option.value === e.target.value
		);
		setSelectedOption(selected?.value || "custom");
		setCurrentRegex(selected?.regex || "");
	};

	return (
		<div className="util-card glass-panel">
			<h2>Password Generator</h2>

			<div className="input-group">
				<label htmlFor="regexInput">Custom Regex Pattern:</label>
				<input
					id="regexInput"
					className="util-input"
					type="text"
					value={currentRegex}
					onChange={handleRegexChange}
				/>
			</div>

			<div className="options-group">
				<h3>Preset Patterns:</h3>
				{regexOptions.map((option) => (
					<div key={option.value} className="radio-option">
						<input
							type="radio"
							id={option.value}
							name="regexOption"
							value={option.value}
							checked={selectedOption === option.value}
							onChange={handleOptionChange}
						/>
						<label htmlFor={option.value}>
							<strong>{option.label}</strong>
							<p className="option-desc">{option.description}</p>
						</label>
					</div>
				))}
			</div>

			<button className="util-btn primary" onClick={generatePassword}>
				Generate Password
			</button>

			{password && (
				<div className="result-container">
					<h3>Generated Password:</h3>
					<div className="result-row">
						<p className="result-text">{password}</p>
						<button
							className="util-btn secondary small"
							onClick={() => {
								navigator.clipboard.writeText(password);
							}}
							title="Copy to clipboard"
						>
							Copy
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default PasswordGenerator;

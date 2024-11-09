import React, { useState } from "react";
import { BsSun, BsMoonStars } from "react-icons/bs";
import "../styles/scheme.scss";

const MaterialColorSystem = () => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	const colorTokens = [
		{
			category: "Primary",
			tokens: [
				{
					name: "Primary",
					var: "--md-primary",
					onVar: "--md-on-primary",
				},
				{
					name: "Primary Container",
					var: "--md-primary-container",
					onVar: "--md-on-primary-container",
				},
			],
		},
		{
			category: "Secondary",
			tokens: [
				{
					name: "Secondary",
					var: "--md-secondary",
					onVar: "--md-on-secondary",
				},
				{
					name: "Secondary Container",
					var: "--md-secondary-container",
					onVar: "--md-on-secondary-container",
				},
			],
		},
		{
			category: "Tertiary",
			tokens: [
				{
					name: "Tertiary",
					var: "--md-tertiary",
					onVar: "--md-on-tertiary",
				},
				{
					name: "Tertiary Container",
					var: "--md-tertiary-container",
					onVar: "--md-on-tertiary-container",
				},
			],
		},
		{
			category: "Surface",
			tokens: [
				{
					name: "Surface",
					var: "--md-surface",
					onVar: "--md-on-surface",
				},
				{
					name: "Surface Variant",
					var: "--md-surface-variant",
					onVar: "--md-on-surface-variant",
				},
				{
					name: "Background",
					var: "--md-background",
					onVar: "--md-on-background",
				},
				{ name: "Outline", var: "--md-outline" },
				{ name: "Outline Variant", var: "--md-outline-variant" },
			],
		},
		{
			category: "Error",
			tokens: [
				{ name: "Error", var: "--md-error", onVar: "--md-on-error" },
				{
					name: "Error Container",
					var: "--md-error-container",
					onVar: "--md-on-error-container",
				},
			],
		},
	];

	const ColorRole = ({ name, variable, onVariable }) => (
		<div className="color-role">
			<div
				className="color-swatch"
				style={{
					backgroundColor: `var(${variable})`,
					color: onVariable
						? `var(${onVariable})`
						: "var(--md-on-surface)",
				}}
			>
				<span className="color-name">{name}</span>
				<code className="color-code">{variable}</code>
			</div>
			{onVariable && (
				<div
					className="color-swatch on-color"
					style={{
						backgroundColor: `var(${onVariable})`,
						color: `var(${variable})`,
					}}
				>
					<span className="color-name">On {name}</span>
					<code className="color-code">{onVariable}</code>
				</div>
			)}
		</div>
	);

	const ExampleApp = () => {
		return (
			<div className="example-app-container">
				{/* Header */}
				<header className="app-header">
					<h1 className="app-title">Dashboard</h1>
					<div className="user-profile">User</div>
				</header>
				{/* Sidebar and main content */}
				<div className="app-body">
					{/* Sidebar */}
					<nav className="app-sidebar">
						<ul>
							<li className="nav-item">Overview</li>
							<li className="nav-item">Reports</li>
							<li className="nav-item">Analytics</li>
							<li className="nav-item">Settings</li>
						</ul>
					</nav>
					{/* Main content */}
					<main className="app-main">
						{/* Content area */}
						<div className="cards">
							{/* Card components */}
							<div className="card">
								<h2 className="card-title">Sales Report</h2>
								<p className="card-content">
									View detailed sales analytics and reports.
								</p>
								<button className="btn primary-btn">
									View Report
								</button>
							</div>
							<div className="card">
								<h2 className="card-title">User Feedback</h2>
								<p className="card-content">
									Read feedback from your customers.
								</p>
								<button className="btn secondary-btn">
									Read Feedback
								</button>
							</div>
							{/* Additional cards */}
							<div className="card">
								<h2 className="card-title">System Alerts</h2>
								<p className="card-content">
									Check system notifications and alerts.
								</p>
								<button className="btn error-btn">
									View Alerts
								</button>
							</div>
						</div>
					</main>
				</div>
				{/* Footer */}
				<footer className="app-footer">
					<p>&copy; 2023 My Application</p>
				</footer>
			</div>
		);
	};

	return (
		<div className={`app ${isDarkMode ? "dark-mode" : ""}`}>
			<div className="container">
				{/* Header with dark mode toggle */}
				<header className="header">
					<h1>Material Design System</h1>
					<label className="dark-mode-toggle">
						<input
							type="checkbox"
							checked={isDarkMode}
							onChange={(e) => setIsDarkMode(e.target.checked)}
						/>
						<span className="toggle-slider">
							{isDarkMode ? <BsMoonStars /> : <BsSun />}
						</span>
					</label>
				</header>
				{/* Main content */}
				<main className="main-content">
					{/* Color System Display */}
					<section className="color-system">
						<h2>Color System</h2>
						{colorTokens.map((category) => (
							<div key={category.category}>
								<h3>{category.category}</h3>
								{category.tokens.map((token) => (
									<ColorRole
										key={token.var}
										name={token.name}
										variable={token.var}
										onVariable={token.onVar}
									/>
								))}
							</div>
						))}
					</section>
					{/* Example Application */}
					<section className="example-app">
						<h2>Example Application</h2>
						<ExampleApp />
					</section>
				</main>
			</div>
		</div>
	);
};

export default MaterialColorSystem;

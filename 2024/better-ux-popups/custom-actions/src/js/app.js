/** Calcite demo application boilerplate functionality - not related to demo content */

const toggleModeEl = document.getElementById("toggle-mode");
const toggleModalEl = document.getElementById("toggle-modal");

const navigationEl = document.getElementById("nav");
const panelEl = document.getElementById("sheet-panel");
const modalEl = document.getElementById("modal");
const sheetEl = document.getElementById("sheet");
const darkModeCss = document.getElementById("jsapi-mode-dark");
const lightModeCss = document.getElementById("jsapi-mode-light");
const arcgisMap = document.querySelector("arcgis-map");

let mode = "light";

toggleModeEl.addEventListener("click", () => handleModeChange());
toggleModalEl.addEventListener("click", () => handleModalChange());
navigationEl.addEventListener("calciteNavigationActionSelect", () =>
	handleSheetOpen()
);

panelEl.addEventListener("calcitePanelClose", () => handlePanelClose());

function handleModeChange() {
	mode = mode === "dark" ? "light" : "dark";
	const isDarkMode = mode === "dark";
	darkModeCss.disabled = !darkModeCss.disabled;
	lightModeCss.disabled = !lightModeCss.disabled;
	arcgisMap.itemId = isDarkMode
		? "94b59fe7d20545dd8323ec12bab9adce"
		: "0a4a5b9b70c9449b9f2e87a6864db2a7";
	toggleModeEl.icon = isDarkMode ? "moon" : "brightness";
	document.body.className = isDarkMode ? "calcite-mode-dark" : undefined;
	console.log("Light mode", lightModeCss);
	console.log("Dark mode", darkModeCss);
}

function handleModalChange() {
	modalEl.open = !modalEl.open;
}

function handleSheetOpen() {
	sheetEl.open = true;
	panelEl.closed = false;
}

function handlePanelClose() {
	sheetEl.open = false;
}

require(["esri/widgets/Popup"], (Popup) => {
	const actionBarCheck = document.getElementById("action-bar");
	const closeCheck = document.getElementById("close-button");
	const collapseCheck = document.getElementById("collapse-button");
	const featureNavCheck = document.getElementById("feature-navigation");
	const headingCheck = document.getElementById("heading");
	const spinnerCheck = document.getElementById("spinner");

	// Get a reference to the arcgis-layer-list component
	const arcgisMap = document.querySelector("arcgis-map");
	arcgisMap.addEventListener("viewReady", (event) => {
		const view = event.target.view;
		view.constraints = {
			minScale: 2000000,
			maxScale: 0,
		};
		view.popup = new Popup({
			dockEnabled: true,
			dockOptions: {
				breakpoint: false,
				position: "bottom-left",
			},
		});

		view.when(() => {
			const checkboxChanged = (event) => {
				const checkbox = event.target.id;
				switch (checkbox) {
					case "action-bar":
						view.popup.visibleElements.actionBar = event.target.checked
							? true
							: false;
						break;
					case "close-button":
						view.popup.visibleElements.closeButton = event.target.checked
							? true
							: false;
						break;
					case "collapse-button":
						view.popup.visibleElements.collapseButton = event.target.checked
							? true
							: false;
						break;
					case "feature-navigation":
						view.popup.visibleElements.featureNavigation = event.target.checked
							? true
							: false;
						break;
					case "heading":
						view.popup.visibleElements.heading = event.target.checked
							? true
							: false;
						break;
					case "spinner":
						view.popup.visibleElements.spinner = event.target.checked
							? true
							: false;
						break;
				}
			};

			actionBarCheck.addEventListener("calciteCheckboxChange", checkboxChanged);
			closeCheck.addEventListener("calciteCheckboxChange", checkboxChanged);
			collapseCheck.addEventListener("calciteCheckboxChange", checkboxChanged);
			featureNavCheck.addEventListener(
				"calciteCheckboxChange",
				checkboxChanged
			);
			headingCheck.addEventListener("calciteCheckboxChange", checkboxChanged);
			spinnerCheck.addEventListener("calciteCheckboxChange", checkboxChanged);
		});
	});
});

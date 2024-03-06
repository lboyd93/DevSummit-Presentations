(async () => {
	// JS SDK imports
	const reactiveUtils = await $arcgis.import("esri/core/reactiveUtils");
	const Popup = await $arcgis.import("esri/widgets/Popup");
	const RouteLayer = await $arcgis.import("esri/layers/RouteLayer");
	const Stop = await $arcgis.import("esri/rest/support/Stop");

	// UI and map components
	const actionBarCheck = document.getElementById("action-bar");
	const closeCheck = document.getElementById("close-button");
	const collapseCheck = document.getElementById("collapse-button");
	const featureNavCheck = document.getElementById("feature-navigation");
	const headingCheck = document.getElementById("heading");
	const spinnerCheck = document.getElementById("spinner");
	const arcgisMap = document.querySelector("arcgis-map");
	const arcgisExpand = document.querySelector("arcgis-expand");
	const arcgisDirections = document.querySelector("arcgis-directions");

	// Get a reference to the arcgis-map component.
	arcgisMap.addEventListener("arcgisViewReadyChange", (event) => {
		const view = event.target.view;
		// Dock the popup and remove the dock button.
		view.popup = new Popup({
			dockEnabled: true,
			dockOptions: {
				breakpoint: false,
				position: "bottom-left",
				buttonEnabled: false,
			},
		});

		// Add the custom actions to each layer's popup template.
		const pm1Layer = view.map.findLayerById("18dcdae8c96-layer-3");
		const pm10Layer = view.map.findLayerById("18dcdae8c97-layer-4");
		const pm25Layer = view.map.findLayerById("18dcdae8c98-layer-5");
		addCustomActions(pm10Layer);
		addCustomActions(pm1Layer);
		addCustomActions(pm25Layer);

		// Create a new route layer and search source to add to the Directions component.
		let routeLayer = new RouteLayer();
		const pm1LayerSearchSource = {
			layer: pm1Layer,
			searchFields: ["location"],
			displayField: "location",
			exactMatch: false,
			outFields: ["*"],
			name: "PM1",
			placeholder: "Areas with PM1",
		};
		const pm10LayerSearchSource = {
			layer: pm10Layer,
			searchFields: ["location"],
			displayField: "location",
			exactMatch: false,
			outFields: ["*"],
			name: "PM10",
			placeholder: "Areas with PM10",
		};
		const pm25LayerSearchSource = {
			layer: pm25Layer,
			searchFields: ["location"],
			displayField: "location",
			exactMatch: false,
			outFields: ["*"],
			name: "PM 2.5",
			placeholder: "Areas with PM2.5",
		};
		// Set properties on the directions component.
		arcgisDirections.view = view;
		arcgisDirections.layer = routeLayer;
		arcgisDirections.searchProperties = {
			includeDefaultSources: false,
			searchAllEnabled: false,
			sources: [
				pm1LayerSearchSource,
				pm10LayerSearchSource,
				pm25LayerSearchSource,
			],
		};
		view.map.add(routeLayer);

		// Function to watch whether the visibleElement switches are checked.
		const switchChanged = (event) => {
			const switchValue = event.target.id;
			switch (switchValue) {
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

		// Add event listeners on the switches.
		actionBarCheck.addEventListener("calciteSwitchChange", switchChanged);
		closeCheck.addEventListener("calciteSwitchChange", switchChanged);
		collapseCheck.addEventListener("calciteSwitchChange", switchChanged);
		featureNavCheck.addEventListener("calciteSwitchChange", switchChanged);
		headingCheck.addEventListener("calciteSwitchChange", switchChanged);
		spinnerCheck.addEventListener("calciteSwitchChange", switchChanged);

		// When one of the action buttons are triggered, open the website or Directions component.
		reactiveUtils.on(
			() => view.popup?.viewModel,
			"trigger-action",
			(event) => {
				const selectedFeature = view.popup.viewModel.selectedFeature;
				if (event.action.id === "open-site") {
					// Get the 'url' field attribute
					const info = selectedFeature.attributes.url;
					// Make sure the 'url' field value is not null and open the website in a new window.
					if (info) {
						window.open(info.trim());
					}
				} else if (event.action.id === "directions") {
					// Create a new RouteLayer for the Directions component and add it to the map.
					routeLayer = new RouteLayer();
					arcgisDirections.layer = routeLayer;
					view.map.add(routeLayer);
					// Add a stop with the current selected feature and a blank stop.
					const start = new Stop({
						name: selectedFeature.attributes.location,
						geometry: selectedFeature.geometry,
					});
					const end = new Stop();
					arcgisDirections.layer.stops = [end, start];
					// Close the popup and open the edit widget
					view.closePopup();
					arcgisExpand.expanded = true;
				}
			}
		);

		// Add a MutationObserver on the Expand component's expand property to destroy the
		// route layer in the Directions component when it's collapsed.
		const observer = new MutationObserver((mutations, observer) => {
			for (let mutation of mutations) {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "expanded"
				) {
					if (!arcgisExpand.expanded) {
						arcgisDirections.layer.destroy();
					} else {
						view.closePopup();
					}
				}
			}
		});

		// Start observing the expand component's attributes for changes.
		observer.observe(arcgisExpand, { attributes: true });
	});

	// Creates two new custom actions and creates the Directions widget
	function addCustomActions(featureLayer) {
		// Add custom actions to popupTemplate
		featureLayer.popupTemplate.actions = [
			{
				id: "open-site",
				icon: "web",
				title: "More info",
			},
			{
				id: "directions",
				icon: "road-sign",
				title: "Get directions",
			},
		];
	}
})();

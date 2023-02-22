require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Search",
	"esri/widgets/Directions",
	"esri/layers/RouteLayer",
	"esri/rest/support/Stop",
], (WebMap, MapView, Legend, Search, Directions, RouteLayer, Stop) => {
	const webmap = new WebMap({
		portalItem: {
			// autocasts as new PortalItem()
			id: "6f3a55950f56436f925ce4f9d71e941b",
		},
	});
	const view = new MapView({
		container: "viewDiv",
		map: webmap,
		popup: {
			// Dock the popup
			dockEnabled: true,
			dockOptions: {
				breakpoint: false,
				position: "bottom-right",
			},
		},
	});
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");

	webmap.when(() => {
		const layer = webmap.layers.at(1);
		layer.popupTemplate.outFields = ["*"];
		layer.popupTemplate.actions = [
			{
				id: "open-site",
				className: "esri-icon-public",
				title: "Website",
			},
		];

		const layerSearchSource = {
			layer: layer,
			searchFields: ["FIELD_6"],
			displayField: "FIELD_6",
			exactMatch: false,
			outFields: ["*"],
			name: "Art piece",
			placeholder: "Search for art piece",
		};

		const search = new Search({
			view: view,
			includeDefaultSources: false,
			locationEnabled: false,
			popupEnabled: true,
			searchAllEnabled: false,
			suggestionsEnabled: true,
			sources: [layerSearchSource],
		});
		const searchContent = {
			type: "custom",
			outFields: ["*"],
			creator: (event) => {
				return search;
			},
		};

		const routeLayer = new RouteLayer();
		const directions = new Directions({
			view: view,
			layer: routeLayer,
			apiKey:
				"AAPK091ca90725a849f799efca5816dd1035FaUAxHYP7hILxdNFvAzwy4PNCbuKvCqUubORoL0Lu7jTMTjswyxNty4etjYjBfLJ",
			searchProperties: {
				includeDefaultSources: false,
				searchAllEnabled: false,
				sources: [layerSearchSource],
			},
		});

		const directionsContent = {
			type: "custom",
			outFields: ["*"],
			creator: (event) => {
				console.log(event);
				const start = new Stop({
					name: `${event.graphic.attributes.FIELD_6}`,
					geometry: `${event.graphic.geometry}`,
				});
				const end = new Stop();
				directions.layer.stops = [start, end];
				return directions;
			},
		};

		layer.popupTemplate.content.unshift(directionsContent);
		layer.popupTemplate.content.unshift(searchContent);

		console.log(layer.popupTemplate.content);
	});

	// When the action button is triggered, open the website in a new page.
	view.popup.viewModel.on("trigger-action", (event) => {
		if (event.action.id === "open-site") {
			const attributes = view.popup.viewModel.selectedFeature.attributes;
			// Get the 'FIELD_22' field attribute
			const info = attributes.FIELD_22;
			// Make sure the 'FIELD_22' field value is not null
			if (info) {
				// Open up a new browser using the URL value in the 'FIELD_22' field
				window.open(info.trim());
			}
		}
	});
});

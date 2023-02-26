require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Search",
	"esri/widgets/Directions",
	"esri/widgets/Expand",
	"esri/layers/RouteLayer",
	"esri/rest/support/Stop",
	"esri/core/reactiveUtils",
	"esri/popup/content/TextContent",
], (
	WebMap,
	MapView,
	Legend,
	Search,
	Directions,
	Expand,
	RouteLayer,
	Stop,
	reactiveUtils,
	TextContent
) => {
	let directionsWidget;
	let directionsExpand;
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
			{
				id: "directions",
				className: "esri-icon-directions2",
				title: "Get Directions",
			},
		];

		const textContent = new TextContent({
			text: "Created by {FIELD_5} in {FIELD_16}.",
		});

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

		//layer.popupTemplate.content.unshift(textContent);
		layer.popupTemplate.content.forEach((content) => {
			if (content.type === "media") {
				content.mediaInfos[0].title = "Artist: {FIELD_5} circa {FIELD_16}";
			}
		});
		layer.popupTemplate.content.unshift(searchContent);

		createDirectionsWidget(layer);

		reactiveUtils.watch(
			() => directionsExpand.expanded,
			(expanded) => {
				if (!expanded) {
					directionsWidget.layer.destroy();
				}
			}
		);
	});

	function createDirectionsWidget(featureLayer) {
		let routeLayer = new RouteLayer();
		view.map.add(routeLayer);
		const layerSearchSource = {
			layer: featureLayer,
			searchFields: ["FIELD_6"],
			displayField: "FIELD_6",
			exactMatch: false,
			outFields: ["*"],
			name: "Art piece",
			placeholder: "Search for art piece",
		};
		// new RouteLayer must be added to Directions widget
		directionsWidget = new Directions({
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

		directionsExpand = new Expand({
			view: view,
			content: directionsWidget,
		});
		view.ui.add(directionsExpand, "top-right");
	}

	// When the action button is triggered, open the website in a new page.
	view.popup.viewModel.on("trigger-action", (event) => {
		const selectedFeature = view.popup.viewModel.selectedFeature;
		if (event.action.id === "open-site") {
			// Get the 'FIELD_22' field attribute
			const info = selectedFeature.attributes.FIELD_22;
			// Make sure the 'FIELD_22' field value is not null
			if (info) {
				// Open up a new browser using the URL value in the 'FIELD_22' field
				window.open(info.trim());
			}
		} else if (event.action.id === "directions") {
			routeLayer = new RouteLayer();
			directionsWidget.layer = routeLayer;
			view.map.add(routeLayer);
			const start = new Stop({
				name: selectedFeature.attributes.FIELD_6,
				geometry: selectedFeature.geometry,
			});
			const end = new Stop();
			directionsWidget.layer.stops = [start, end];
			view.popup.close();
			directionsExpand.expanded = true;
		}
	});
});

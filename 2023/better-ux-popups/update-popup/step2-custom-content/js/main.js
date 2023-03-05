require([
	"esri/WebMap",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Search",
], (WebMap, MapView, Legend, Search) => {
	// Get the webmap via ID and add it to the View.
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
			// Dock the popup and set the breakpoint to
			// false so it always docks.
			dockEnabled: true,
			dockOptions: {
				breakpoint: false,
				position: "bottom-right",
			},
		},
	});
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");

	// Get the layer to update when the webmap loads.
	webmap.when(() => {
		const artLayer = webmap.layers.at(1);
		artLayer.popupTemplate.outFields = ["*"];

		// Check the array of popup template content for a media element
		// and modify it by adding a title.
		artLayer.popupTemplate.content.forEach((content) => {
			if (content.type === "media") {
				content.mediaInfos[0].caption =
					"Artist: {Artist} circa {Year_installed}";
			}
		});

		// Create a layer search source for the Search and Directions widgets.
		const layerSearchSource = {
			layer: artLayer,
			searchFields: ["Title"],
			displayField: "Title",
			exactMatch: false,
			outFields: ["*"],
			name: "Art piece",
			placeholder: "Search for art piece",
		};

		// Add the custom Search widget to the popup.
		addCustomContent(artLayer, layerSearchSource);
	});

	// Creates a search widget with the art layer as the source
	// then adds that to a custom content element.
	function addCustomContent(featureLayer, layerSearchSource) {
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

		// Add this custom content to the top of the popup.
		featureLayer.popupTemplate.content.unshift(searchContent);
	}
});

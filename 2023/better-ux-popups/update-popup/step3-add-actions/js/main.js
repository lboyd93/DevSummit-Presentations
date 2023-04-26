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
], (
	WebMap,
	MapView,
	Legend,
	Search,
	Directions,
	Expand,
	RouteLayer,
	Stop,
	reactiveUtils
) => {
	let directionsWidget;
	let directionsExpand;

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
		// Add the custom actions to the popup.
		addCustomActions(artLayer, layerSearchSource);

		// Watch when the directions widget is collapsed and destroy the
		// route layer to remove it from the map.
		reactiveUtils.watch(
			() => directionsExpand.expanded,
			(expanded) => {
				if (!expanded) {
					directionsWidget.layer.destroy();
				}
			}
		);
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

	// Creates two new custom actions and creates the Directions widget
	function addCustomActions(featureLayer, layerSearchSource) {
		// Add custom actions to popupTemplate
		featureLayer.popupTemplate.actions = [
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
		createDirectionsWidget(featureLayer, layerSearchSource);
	}

	// When one of the action buttons are triggered, open the website or Directions widget.
	reactiveUtils.on(
		() => view.popup?.viewModel,
		"trigger-action",
		(event) => {
			const selectedFeature = view.popup.viewModel.selectedFeature;
			if (event.action.id === "open-site") {
				// Get the 'Information' field attribute
				const info = selectedFeature.attributes.Information;
				// Make sure the 'Information' field value is not null
				if (info) {
					// Open up a new browser using the URL value in the 'Information' field
					window.open(info.trim());
				}
			} else if (event.action.id === "directions") {
				// Create a new RouteLayer for the Directions widget and add it to the map.
				routeLayer = new RouteLayer();
				directionsWidget.layer = routeLayer;
				view.map.add(routeLayer);
				// Add a stop with the current selected feature and a blank stop.
				const start = new Stop({
					name: selectedFeature.attributes.Title,
					geometry: selectedFeature.geometry,
				});
				const end = new Stop();
				directionsWidget.layer.stops = [start, end];
				// Close the popup and open the directions widget
				view.closePopup();
				directionsExpand.expanded = true;
			}
		}
	);

	function createDirectionsWidget(featureLayer, layerSearchSource) {
		// Create a new Route layer and add it to the map
		let routeLayer = new RouteLayer();
		view.map.add(routeLayer);

		// new RouteLayer must be added to Directions widget
		directionsWidget = new Directions({
			view: view,
			layer: routeLayer,
			//apiKey: "ADD API KEY HERE",
			searchProperties: {
				includeDefaultSources: false,
				searchAllEnabled: false,
				sources: [layerSearchSource],
			},
		});

		// Add the Directions widget to Expand and add to the view.
		directionsExpand = new Expand({
			view: view,
			content: directionsWidget,
		});
		view.ui.add(directionsExpand, "top-right");
	}
});

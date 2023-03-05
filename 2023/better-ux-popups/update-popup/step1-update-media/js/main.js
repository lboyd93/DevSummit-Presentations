require(["esri/WebMap", "esri/views/MapView", "esri/widgets/Legend"], (
	WebMap,
	MapView,
	Legend
) => {
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

	webmap.when(() => {
		const artLayer = webmap.layers.at(1);
		artLayer.popupTemplate.outFields = ["*"];

		artLayer.popupTemplate.content.forEach((content) => {
			if (content.type === "media") {
				content.mediaInfos[0].caption =
					"Artist: {Artist} circa {Year_installed}";
			}
		});
	});
});

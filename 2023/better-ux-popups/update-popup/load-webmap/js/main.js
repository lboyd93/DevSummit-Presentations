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
	});
	// Add the Legend widget
	view.ui.add(new Legend({ view }), "bottom-left");
});

require(["esri/smartMapping/popup/templates"], (popupTemplateCreator) => {
	const control = document.getElementById("control");
	// Get a reference to the arcgis-layer-list component
	const arcgisMap = document.querySelector("arcgis-map");
	arcgisMap.addEventListener("viewReady", (event) => {
		const view = event.target.view;
		view.constraints = {
			minScale: 2000000,
			maxScale: 0,
		};
		view.popup.dockEnabled = true;
		view.popup.dockOptions = {
			breakpoint: false,
			position: "bottom-left",
		};

		const layer = view.map.findLayerById("18db3b41795-layer-3");
		popupTemplateCreator
			.getTemplates({
				layer: layer,
			})
			.then((response) => {
				control.addEventListener("calciteSegmentedControlChange", (event) => {
					const selectedValue = event.target.value;
					if (selectedValue === "Primary") {
						layer.popupTemplate = response.primaryTemplate.value;
					} else if (selectedValue === "Text") {
						const textTemplate = response.secondaryTemplates.find(
							(template) => template.name === "predominant-category"
						);
						layer.popupTemplate = textTemplate.value;
					} else if (selectedValue === "Chart") {
						const chartTemplate = response.secondaryTemplates.find(
							(template) => template.name === "predominant-category-chart"
						);
						layer.popupTemplate = chartTemplate.value;
					}
				});
			});
	});
});

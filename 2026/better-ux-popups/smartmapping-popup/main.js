(async () => {
  const control = document.getElementById("control");
  // Get a reference to the arcgis-map component
  const arcgisMap = document.getElementById("my-map");
  const popupTemplateCreator = await $arcgis.import(
    "@arcgis/core/smartMapping/popup/templates.js",
  );

  await arcgisMap.viewOnReady();

  arcgisMap.popupElement.dockEnabled = true;
  arcgisMap.popupElement.dockOptions = {
    breakpoint: false,
    position: "bottom-left",
  };

  arcgisMap.constraints = {
    minScale: 2000000,
    maxScale: 0,
  };

  const layer = arcgisMap.map.findLayerById("18db3b41795-layer-3");
  await layer.load();


  const response = await popupTemplateCreator.getTemplates({
    layer: layer,
  });
  console.log(response);

  control.addEventListener("calciteSegmentedControlChange", (event) => {
    const selectedValue = event.target.value;
    if (selectedValue === "Primary") {
      layer.popupTemplate = response.primaryTemplate.value;
    } else if (selectedValue === "Text") {
      const textTemplate = response.secondaryTemplates.find(
        (template) => template.name === "predominant-category",
      );
      layer.popupTemplate = textTemplate.value;
    } else if (selectedValue === "Chart") {
      const chartTemplate = response.secondaryTemplates.find(
        (template) => template.name === "predominant-category-chart",
      );
      layer.popupTemplate = chartTemplate.value;
    }
  });
})();

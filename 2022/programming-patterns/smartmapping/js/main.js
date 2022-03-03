require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/smartMapping/renderers/color",
  "esri/smartMapping/renderers/type",
  "esri/smartMapping/renderers/dotDensity",
  "esri/widgets/Legend"
], (
  Map,
  MapView,
  FeatureLayer,
  colorRendererCreator,
  typeRendererCreator,
  dotDensityRendererCreator,
  Legend,
) => {
  const electionURL =
    "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_Presidential_Election_Results_2016/FeatureServer/0";
  // create feature layer and add to map
  const map = new Map({
    basemap: "topo-vector",
  });
  const electionResults = new FeatureLayer({
    url: electionURL,
  });
  map.add(electionResults);
  const view = new MapView({
    container: "viewDiv",
    map: map,
  });
  view.popup.defaultPopupTemplateEnabled = true;

  // when the featurelayer loads, zoom to the extent
  electionResults.when(() => {
    view.extent = electionResults.fullExtent;
  });

  // add legend to view
  const legend = new Legend({
    view: view,
    container: "legendDiv",
  });
  view.ui.add("infoDiv", "top-right");

  // set up event listener for dropdown to change renderer
  const dropdown = document.getElementById("drop-down");
  dropdown.addEventListener("calciteDropdownSelect", (event) => {
    const chosenValue = event.target.selectedItems[0].innerText;
    switch (chosenValue) {
      case "Unique Value Renderer":
        uniqueValue();
        break;
      case "Class Breaks Renderer":
        classBreaks();
        break;
      case "Dot Density Renderer":
        dotDensity();
        break;
      default:
        console.log(`default`);
    }
  });

  // function to create unique value renderer
  function uniqueValue() {
    // visualization based on Arcade Expression
    let typeParams = {
      layer: electionResults,
      view: view,
      valueExpression:
        "IIF($feature.G16PREDCli > $feature.G16PRERTru, 'Democrat', 'Republican')",
      valueExpressionTitle: "Election Winner",
      defaultSymbolEnabled: false,
    };

    // when the promise resolves, apply the visual variables to the renderer
    typeRendererCreator.createRenderer(typeParams).then(function (response) {
      electionResults.renderer = response.renderer;
    });
  }

  // function to create DotDensityRenderer
  function dotDensity() {
    const params = {
      layer: electionResults,
      view: view,
      attributes: [
        {
          field: "G16PRERTru",
          label: "Trump",
        },
        {
          field: "G16PREDCli",
          label: "Clinton",
        },
      ],
      legendOptions: {
        unit: "people",
      },
    };

    // when the promise resolves, apply the renderer to the layer
    dotDensityRendererCreator.createRenderer(params).then(function (response) {
      electionResults.renderer = response.renderer;
    });
  }

  // function to create Class Breaks Renderer
  // +1 if Clinton had the higher distribution
  // -1 if Trump had the higher distribution
  function classBreaks() {
    // visualization based on field and normalization field
    let colorParams = {
      layer: electionResults,
      view: view,
      classificationMethod: "equal-interval",
      numClasses: 6,
      valueExpression:
        "($feature.G16PREDCli - $feature.G16PRERTru) / ($feature.G16PREDCli + $feature.G16PRERTru)",
      valueExpressionTitle: "Voting Distribution",
    };

    // when the promise resolves, apply the renderer to the layer
    colorRendererCreator
      .createClassBreaksRenderer(colorParams)
      .then(function (response) {
        electionResults.renderer = response.renderer;
      });
  }
});

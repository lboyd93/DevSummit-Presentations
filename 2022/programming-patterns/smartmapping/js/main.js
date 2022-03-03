require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/smartMapping/renderers/color",
  "esri/smartMapping/renderers/type",
  "esri/smartMapping/renderers/dotDensity",
  "esri/smartMapping/symbology/dotDensity",
  "esri/widgets/Legend",
  "esri/Color",
], (
  Map,
  MapView,
  FeatureLayer,
  colorRendererCreator,
  typeRendererCreator,
  dotDensityRendererCreator,
  dotDensitySchemes,
  Legend,
  Color
) => {
  const electionURL =
    "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_Presidential_Election_Results_2016/FeatureServer/0";
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

  electionResults.when(() => {
    view.extent = electionResults.fullExtent;
  });

  const legend = new Legend({
    view: view,
    container: "legendDiv",
  });
  view.ui.add("infoDiv", "top-right");

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

  function uniqueValue() {
    // visualization based on categorical field
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
        //unit: "people"
      },
    };

    // when the promise resolves, apply the renderer to the layer
    dotDensityRendererCreator.createRenderer(params).then(function (response) {
      electionResults.renderer = response.renderer;
    });
  }

  function classBreaks(){
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

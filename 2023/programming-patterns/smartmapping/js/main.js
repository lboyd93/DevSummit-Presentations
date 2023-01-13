require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/smartMapping/renderers/predominance",
  "esri/smartMapping/renderers/dotDensity",
  "esri/smartMapping/symbology/dotDensity",
  "esri/smartMapping/renderers/pieChart",
  "esri/widgets/Legend",
  "esri/Color"
], (
  Map,
  MapView,
  FeatureLayer,
  predominanceRendererCreator,
  dotDensityRendererCreator,
  dotDensitySchemes,
  pieChartRendererCreator,
  Legend,
  Color
) => {
  const cropsURL =
      "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/USA_County_Crops_2007/FeatureServer/0";
  let cropsDefaultRenderer;
  // create feature layer and add to map
  const map = new Map({
      basemap: "topo-vector"
  });
  const cropsLayer = new FeatureLayer({
      url: cropsURL
  });
  cropsLayer.when(() => {
      cropsDefaultRenderer = cropsLayer.renderer;
  });
  map.add(cropsLayer);
  const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-86.10509, 37.78353],
      zoom: 4
  });
  view.popup.defaultPopupTemplateEnabled = true;

  // add legend to view
  const legend = new Legend({
      view: view,
      container: "legendDiv"
  });
  view.ui.add("infoDiv", "top-right");

  // set up event listener for dropdown to change renderer
  const dropdown = document.getElementById("drop-down");
  dropdown.addEventListener("calciteDropdownSelect", (event) => {
      const chosenValue = event.target.selectedItems[0].innerText;
      switch (chosenValue) {
          case "Predominance Renderer":
              predominance();
              break;
          case "Dot Density Renderer":
              dotDensity();
              break;
          case "Pie Chart Renderer":
              pieChart();
              break;
          case "Default":
              cropsLayer.renderer = cropsDefaultRenderer;
      }
  });

  // function to create unique value renderer
  function predominance() {
      const fields = [
          {
              name: "M172_07"
          },
          {
              name: "M188_07"
          },
          {
              name: "M193_07"
          },
          {
              name: "M217_07"
          },
          {
              name: "M163_07"
          },
          {
              name: "M233_07"
          }
      ];

      let params = {
          layer: cropsLayer,
          view: view,
          fields: fields,
          legendOptions: {
              title: "Most common crop"
          },
          sortBy: "value",
          defaultSymbolEnabled: false
      };

      // when the promise resolves, apply the visual variables to the renderer
      predominanceRendererCreator
          .createRenderer(params)
          .then(function (response) {
              cropsLayer.renderer = response.renderer;
          });
  }

  // function to create DotDensityRenderer
  // Creates visualization of predominant election result winner
  function dotDensity() {
      const attributes = [
          {
              field: "M172_07",
              label: "Wheat"
          },
          {
              field: "M188_07",
              label: "Cotton"
          },
          {
              field: "M193_07",
              label: "Soybeans"
          },
          {
              field: "M217_07",
              label: "Vegetables"
          },
          {
              field: "M163_07",
              label: "Corn"
          },
          {
              field: "M233_07",
              label: "Orchards"
          }
      ];
      const params = {
          layer: cropsLayer,
          view: view,
          attributes: attributes,
          legendOptions: {
              unit: "Crop"
          }
      };

      // when the promise resolves, apply the renderer to the layer
      dotDensityRendererCreator
          .createRenderer(params)
          .then(function (response) {
              cropsLayer.renderer = response.renderer;
          });
  }

  function pieChart() {
      const attributes = [
          {
              field: "M172_07",
              label: "Wheat"
          },
          {
              field: "M188_07",
              label: "Cotton"
          },
          {
              field: "M193_07",
              label: "Soybeans"
          },
          {
              field: "M217_07",
              label: "Vegetables"
          },
          {
              field: "M163_07",
              label: "Corn"
          },
          {
              field: "M233_07",
              label: "Orchards"
          }
      ];
      // will create a visualization of predominant crop by U.S. county
      const params = {
          layer: cropsLayer,
          view: view,
          attributes: attributes,
          includeSizeVariable: true,
          sizeOptimizationEnabled: true
      };

      // when the promise resolves, apply the renderer to the layer
      pieChartRendererCreator.createRenderer(params).then((response) => {
          cropsLayer.renderer = response.renderer;
      });
  }
});

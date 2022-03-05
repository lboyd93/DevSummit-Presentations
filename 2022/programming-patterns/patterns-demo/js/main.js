require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/widgets/Legend",
  "esri/smartMapping/renderers/color",
], function (Map, MapView, MapImageLayer, Legend, colorRendererCreator) {
  const layer = new MapImageLayer({
    url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer",
    sublayers: [
      {
        id: 0,
        source: {
          mapLayerId: 1,
        },
      },
    ],
  });

  const map = new Map({
    basemap: "streets-vector"
  });
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-122.436, 37.764],
    zoom: 10
  });

  const legend = new Legend({ view });
  view.ui.add(legend, "bottom-right");

  layer.load().then(async (_) => {
    const sublayer = layer.findSublayerById(0);
    const fLayer = await sublayer.createFeatureLayer();
    // Add new feature layer to map to create layerview
    map.add(fLayer);

    // Create smartmapping renderer
    const colorParams = {
      layer: fLayer,
      view,
      field: "RENTER_OCC",
      normalizationField: "HSE_UNITS",
      legendOptions: {
        title: "Renter Occupied (Housing Units)",
      },
    };
    // when the promise resolves, apply the renderer to the sublayer
    colorRendererCreator
      .createClassBreaksRenderer(colorParams)
      .then((response) => {
        fLayer.renderer = response.renderer;
      })
      .catch((error) => console.log(error));

      // Create LayerView
    view.whenLayerView(fLayer).then((layerView) => {
        // Check when it's done updating
        layerView.watch("updating", (value) => {
          if (!value) {
              // Create a query to highlight features
            const query = layerView.createQuery();
            query.where = "RENTER_OCC < 50";
            layerView.queryFeatures(query).then((result) => {
              layerView.highlight(result.features);
            });
          }
        });
      });

  });
});

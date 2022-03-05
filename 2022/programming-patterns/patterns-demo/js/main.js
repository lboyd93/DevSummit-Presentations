require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer"
], function (Map, MapView, MapImageLayer) {
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

  layer.load().then(async (_) => {
    const sublayer = layer.findSublayerById(0);
    const fLayer = await sublayer.createFeatureLayer();
    fLayer.outFields = ['*'];
    // Add new feature layer to map to create layerview
    map.add(fLayer);

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

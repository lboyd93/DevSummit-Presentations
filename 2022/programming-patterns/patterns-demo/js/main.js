require(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer"], (
  Map,
  MapView,
  FeatureLayer
) => {

  const map = new Map({
    basemap: "osm",
  });
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-95.74186, 35.26295],
    zoom: 4,
  });

  const featureLayer = new FeatureLayer({
    portalItem: {
      id: "baa010eda7074ae890c49f313ddc89c1",
    },
  });
  map.layers.add(featureLayer);

  const zoomToButton = document.getElementById("zoom-to-action");
  view.ui.add(zoomToButton, "top-right");
  zoomToButton.addEventListener("click", () => {
    const query = featureLayer.createQuery();
    query.where = "OBJECTID = '3598364'";
    query.returnGeometry = true;
    featureLayer.queryFeatures(query).then((results) => {
      const opts = {
        duration: 3000,
      };
      view.goTo(results.features[0].geometry, opts);
    });
  });
});

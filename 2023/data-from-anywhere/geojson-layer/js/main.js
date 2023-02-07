/**
 * Step 5: Add FeatureTable
 * This sample demonstrates how to add a FeatureTable that references the GeoJSONLayer.
 */
require([
  "esri/Map",
  "esri/layers/GeoJSONLayer",
  "esri/views/SceneView",
  "esri/widgets/Legend",
  "esri/core/reactiveUtils",
  "esri/widgets/ElevationProfile",
  "esri/widgets/Expand"
], (Map, GeoJSONLayer, SceneView, Legend, reactiveUtils, ElevationProfile, Expand) => {
  const parkTrails =
    "https://laurenb.esri.com/DevSummit/2023/geojson/Great_Smoky_Mountains_National_Park_3D_Trails.geojson";
  const campgrounds =
    "https://laurenb.esri.com/DevSummit/2023/geojson/GRSM_CAMPGROUNDS.geojson";

  // Create GeoJSONLayer from GeoJSON data
  const trailsLayer = new GeoJSONLayer({
    url: parkTrails,
    copyright: "NPS",
    title: "Trails",
  });

  // Create GeoJSONLayer from GeoJSON data
  const campgroundsLayer = new GeoJSONLayer({
    url: campgrounds,
    copyright: "NPS",
    title: "Campgrounds",
  });

  const map = new Map({
    basemap: "satellite",
    ground: "world-elevation",
    layers: [trailsLayer, campgroundsLayer],
  });
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    popup: {
        defaultPopupTemplateEnabled: true
    }
  });

  trailsLayer.when(() => {
    view.extent = trailsLayer.fullExtent;
    view.camera = {
      position: [-83.6953602250087, 35.30029402538673, 10800],
      tilt: 75,
      heading: 44,
    };
  });

  reactiveUtils.when(
    () => !view.updating,
    () => {
      console.log(view.camera);
    }
  );
  const elevationExpand = new Expand({
    view,
    content: new ElevationProfile({view})
  });
  view.ui.add(elevationExpand, "top-right");
  view.ui.add(new Legend({view}), "bottom-left");
});

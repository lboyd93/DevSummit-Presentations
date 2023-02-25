/**
 * Step 1: Load data
 * Description: Demonstrates how to load a CSVLayer from a portalItem containing a csv file. Data
 * must contain lat / long coordinates to bring it into the ArcGIS Maps SDK for JavaScript.
 */
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/CSVLayer"
], function(
  Map, MapView, CSVLayer,
) {

  const csvLayer = new CSVLayer({
    portalItem: {
      id: "2e603ade23164fe6838c638ff7ee083b",
      // For use when loading data from an Enterprise Portal
      // portal: {
      //   url: "https://machine-name.domain.com/portal"
      // }
    },
    copyright: "nuforc.org",
    title: "NUFORC UFO Sightings"
  });

  const map = new Map({
    basemap: "dark-gray-vector",
    layers: [csvLayer]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-117, 34],
    zoom: 3
  });

});
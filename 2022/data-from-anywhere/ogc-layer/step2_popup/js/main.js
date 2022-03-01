/**
 * Step 2: Add a PopupTemplate.
 * This sample demonstrates how to configure a PopupTemplate for a WFSLayer.
 * This app uses an arcade expression to check 4 different fields, and if either of
 * those fields have a value of 1, then the popup content will change accordingly.
 */
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/WFSLayer"
], (Map, MapView, WFSLayer) => {
  // create a PopupTemplate and configure an aracade expression
  const droughtPopupTemplate = {
    title: "Drought Outlook (Feb - May 2022)",
    content: `The seasonal drought outlook demonstrates <b>{expression/drought-outlook-category}</b> in this region of the United States. <br>Date submitted: <span class="popupSpan">{idp_filedate}</span>`,
    expressionInfos: [
      {
        // arcade expression to display the feature category
        name: "drought-outlook-category",
        expression: "When($feature.fid_persis == 1, 'drought persistence is likely', $feature.fid_dev == 1, 'potential drought development is likely', $feature.fid_improv == 1, 'drought improvement is favored', $feature.fid_remove == 1, 'drought removal is favored', 'n/a')"
      }
    ]
  };

  // initialize a WFSLayer
  const droughtWFSLayer = new WFSLayer({
    url: "https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Climate_Outlooks/cpc_drought_outlk/MapServer/WFSServer",
    name: "Seasonal_Drought_Outlook",
    title: "US Seasonal Drought Outlook (Feb - May 2022)",
    copyright: "NOAA/NWS/NCEP/Climate Prediction Center",
    popupTemplate: droughtPopupTemplate,
    outFields: ['*']
  });

  // add the WFSLayer to the map
  const map = new Map({
    basemap: "gray-vector",
    layers: [droughtWFSLayer]
  });

  // initialize the view with an extent
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-100, 34],
    zoom: 4
  });
    
});
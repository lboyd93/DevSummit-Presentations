require([
  "esri/Map",
  "esri/layers/CSVLayer",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/widgets/LayerList",
  "esri/widgets/FeatureTable",
  "esri/widgets/Search",
  "esri/exports/csv",
  "esri/rest/support/FeatureSet",
  "esri/widgets/Sketch/SketchViewModel",
  "esri/layers/GraphicsLayer",
], function(
  Map, CSVLayer, MapView, 
  Legend, LayerList, FeatureTable, 
  Search, csv, FeatureSet,
  SketchViewModel, GraphicsLayer
) {
  let activeWidget;
  let selectedRows = [];
  let csvLayerView;
  
  // Defines a SimpleRenderer
  const ufoRenderer = {
    type: "simple",
    symbol: {
      type: "cim",
      // gets JSON data defining CIMPointSymbol
      data: {
        type: "CIMSymbolReference",
        symbol: getPointSymbolData()
      }
    }
  }

  // Defines a PopupTemplate
  const popupTemplate = {
    title: "{CITY}",
    content: [
      {
        type: "text",
        text: `A <b><span style="color: #39AB17">{Shape}</span></b> shaped UFO was spotted on {Date_Time} in <b>{CITY}</b>.
        <h4>Description of Sighting:</h4><i>"{Summary}"</i>`
      }
    ]
  }

  // Defines the clustering configuration with a popupTemplate
  const clusterConfig = {
    type: "cluster",
    clusterRadius: "100px",
    // {cluster_count} is an aggregate field containing
    // the number of features comprised by the cluster
    popupTemplate: {
      title: "Cluster summary",
      content: "This cluster represents {cluster_count} ufo sightings.",
      fieldInfos: [
        {
          fieldName: "cluster_count",
          format: {
            places: 0,
            digitSeparator: true
          }
        }
      ]
    },
    clusterMinSize: "24px",
    clusterMaxSize: "60px"
  };

  const csvLayer = new CSVLayer({
    portalItem: {
      id: "2e603ade23164fe6838c638ff7ee083b"
    },
    copyright: "nuforc.org",
    title: "NUFORC UFO Sightings",
    renderer: ufoRenderer,
    popupTemplate
  });

  const graphicsLayer = new GraphicsLayer({ 
    title: "graphicsLayer",
    listMode: "hide"
  });

  const map = new Map({
    basemap: "dark-gray-vector",
    layers: [csvLayer, graphicsLayer]
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-117, 34],
    zoom: 3,
    padding: {
      left: 50
    }
  });

  csvLayer.when(async () => {
    csvLayerView = await view.whenLayerView(csvLayer);
  });

  const legend = new Legend({ 
    view,
    container: "legend-container"
  });

  const layerList = new LayerList({ 
    view,
    container: "layers-container"
  });

  let featureSet = new FeatureSet({
    features: [{}],
    geometryType: "point",
    spatialReference: { wkid: 102100 }
  });

  const featureTable = new FeatureTable({ 
    view,
    container: "table-container",
    layer: csvLayer,
    multiSortEnabled: true,
    menuConfig: {
      items: [
        {
          label: "Export to CSV",
          iconClass: "esri-icon-download",
          clickFunction: function (event) {
            // Add custom function to perform on menu item button click
            exportToCSV();
          }
        }
      ]
    },
    tableTemplate: {
      // autocasts to TableTemplate
      columnTemplates: [
        {
          type: "field",
          fieldName: "CITY",
          label: "City",
          direction: "asc"
        },
        {
          type: "field",
          fieldName: "State",
          label: "State"
        },
        {
          type: "field",
          fieldName: "Date_Time",
          label: "Date / Time"
        },
        {
          type: "field",
          fieldName: "Shape",
          label: "Shape"
        },
        {
          type: "field",
          fieldName: "Summary",
          label: "Summary"
        },
        {
          type: "field",
          fieldName: "Posted",
          label: "Posted"
        }
      ]
    }
  });

  featureTable.on("selection-change", evt => {
    console.log("selection-change-event: ", evt);
    if(evt.added?.length > 0) {
      // selection added
      selectedRows.push(evt.added[0]);
    } else {
      // selection removed
      selectedRows = selectedRows.filter((row) => row.objectId !== evt.removed[0].objectId);
      filterFeatures(featureTable.highlightIds);
    }
  });

  // featureTable by default does not return geometries for performance optimizations
  // we need geometry for the convertFeaturesToCSV() method
  featureTable.viewModel.store.returnGeometry = true;

  // export features to csv file and download
  async function exportToCSV() {
    const features = await querySelectedFeatures(featureTable.highlightIds);

    featureSet.features = features;
    featureSet.geometryType = "point";

    // // convert features to csv string
    let csvString = await csv.convertFeaturesToCSV(featureSet);

    let csvFile = new Blob([csvString], { type: "text/csv" });
    let temp_link = document.createElement('a');
    temp_link.download = "ufo.csv";
    let url = window.URL.createObjectURL(csvFile);
    temp_link.href = url;

    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    temp_link.click();
    document.body.removeChild(temp_link);
  }

  const sketchViewModel = new SketchViewModel({
    view: view,
    layer: graphicsLayer
  });

  sketchViewModel.on("create", evt => {
    if(evt.state === "complete") {
      graphicsLayer.removeAll();
      selectFeatures(evt.graphic.geometry)
    }
  });

  const searchWidget = new Search({
    view: view,
    allPlaceholder: "Search Sightings",
    includeDefaultSources: false,
    sources: [
      {
        layer: csvLayer,
        searchFields: ["CITY"],
        displayField: "City",
        exactMatch: false,
        outFields: ["CITY", "State", "Country"],
        name: "Cities",
        placeholder: "Example: San Diego"
      }
    ]
  });

  searchWidget.on("search-complete", (e) => {
    const oid = e.results[0].results[0].feature.attributes.__OBJECTID;
    // clear existing selections first
    featureTable.highlightIds.removeAll();
    featureTable.highlightIds.push(oid);
  });

  view.ui.add(searchWidget, "top-right");

  document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);
  document.querySelector("calcite-shell").hidden = false;
  document.querySelector("calcite-loader").active = false;

  function getPointSymbolData() {
    return {
      "type": "CIMPointSymbol",
      "symbolLayers": [
        {
          "type": "CIMVectorMarker",
          "enable": true,
          "anchorPointUnits": "Relative",
          "dominantSizeAxis3D": "Z",
          "size": 12,
          "billboardMode3D": "FaceNearPlane",
          "frame": {
            "xmin": 0,
            "ymin": 0,
            "xmax": 42.7,
            "ymax": 42.7
          },
          "markerGraphics": [
            {
              "type": "CIMMarkerGraphic",
              "geometry": {
                "rings": [
                  [
                    [
                      9.3,
                      24.8
                    ],
                    [
                      9,
                      26.1
                    ],
                    [
                      8.5,
                      26.5
                    ],
                    [
                      7.9,
                      26.6
                    ],
                    [
                      6.7,
                      26
                    ],
                    [
                      5.9,
                      24.7
                    ],
                    [
                      5.6,
                      22.8
                    ],
                    [
                      5.8,
                      21.9
                    ],
                    [
                      6.4,
                      21.1
                    ],
                    [
                      8.3,
                      19.5
                    ],
                    [
                      11.5,
                      17.9
                    ],
                    [
                      13.8,
                      17.1
                    ],
                    [
                      16.5,
                      16.5
                    ],
                    [
                      19.2,
                      16.1
                    ],
                    [
                      22,
                      16.1
                    ],
                    [
                      24.8,
                      16.3
                    ],
                    [
                      27.4,
                      16.8
                    ],
                    [
                      29.9,
                      17.5
                    ],
                    [
                      32,
                      18.4
                    ],
                    [
                      33.5,
                      19.3
                    ],
                    [
                      34.8,
                      20.4
                    ],
                    [
                      35.9,
                      21.6
                    ],
                    [
                      36.5,
                      22.8
                    ],
                    [
                      36.8,
                      24
                    ],
                    [
                      36.6,
                      25
                    ],
                    [
                      36,
                      25.8
                    ],
                    [
                      35.1,
                      26.4
                    ],
                    [
                      34.4,
                      26.4
                    ],
                    [
                      33.8,
                      26.2
                    ],
                    [
                      33.5,
                      25.6
                    ],
                    [
                      33.3,
                      24.9
                    ],
                    [
                      32.9,
                      24.1
                    ],
                    [
                      31.8,
                      23.1
                    ],
                    [
                      29.9,
                      22.2
                    ],
                    [
                      27.3,
                      21.3
                    ],
                    [
                      24,
                      20.6
                    ],
                    [
                      21.3,
                      20.3
                    ],
                    [
                      18.6,
                      20.6
                    ],
                    [
                      15.3,
                      21.3
                    ],
                    [
                      13.1,
                      22.1
                    ],
                    [
                      11.1,
                      23
                    ],
                    [
                      9.8,
                      24
                    ],
                    [
                      9.3,
                      24.8
                    ]
                  ],
                  [
                    [
                      27.2,
                      31.2
                    ],
                    [
                      26.1,
                      32
                    ],
                    [
                      24.7,
                      32.7
                    ],
                    [
                      23.1,
                      33.1
                    ],
                    [
                      21.3,
                      33.2
                    ],
                    [
                      19.6,
                      33.1
                    ],
                    [
                      18,
                      32.7
                    ],
                    [
                      16.6,
                      32
                    ],
                    [
                      15.5,
                      31.2
                    ],
                    [
                      14.2,
                      29.7
                    ],
                    [
                      13.5,
                      28.3
                    ],
                    [
                      13.4,
                      27.1
                    ],
                    [
                      13.9,
                      26
                    ],
                    [
                      15,
                      25.1
                    ],
                    [
                      16.6,
                      24.5
                    ],
                    [
                      18.7,
                      24.1
                    ],
                    [
                      21.3,
                      24
                    ],
                    [
                      23.9,
                      24.1
                    ],
                    [
                      26.1,
                      24.5
                    ],
                    [
                      27.7,
                      25.1
                    ],
                    [
                      28.8,
                      26
                    ],
                    [
                      29.3,
                      27.1
                    ],
                    [
                      29.2,
                      28.3
                    ],
                    [
                      28.5,
                      29.7
                    ],
                    [
                      27.2,
                      31.2
                    ]
                  ],
                  [
                    [
                      21.3,
                      37.3
                    ],
                    [
                      23,
                      37
                    ],
                    [
                      25.3,
                      36.2
                    ],
                    [
                      30.5,
                      33.3
                    ],
                    [
                      34.7,
                      30.6
                    ],
                    [
                      37.3,
                      29.3
                    ],
                    [
                      38.4,
                      28.3
                    ],
                    [
                      39.7,
                      25.9
                    ],
                    [
                      40.3,
                      24.3
                    ],
                    [
                      40.5,
                      22.8
                    ],
                    [
                      40.4,
                      21.4
                    ],
                    [
                      40,
                      20.1
                    ],
                    [
                      39.2,
                      18.8
                    ],
                    [
                      38,
                      17.6
                    ],
                    [
                      34.7,
                      15.3
                    ],
                    [
                      32.6,
                      14.1
                    ],
                    [
                      31.6,
                      13.1
                    ],
                    [
                      31.4,
                      12.1
                    ],
                    [
                      32,
                      10.7
                    ],
                    [
                      33,
                      8.4
                    ],
                    [
                      33.3,
                      6.8
                    ],
                    [
                      33.2,
                      6
                    ],
                    [
                      32.9,
                      5.5
                    ],
                    [
                      32.4,
                      5.3
                    ],
                    [
                      31.8,
                      5.6
                    ],
                    [
                      30.2,
                      7
                    ],
                    [
                      28.7,
                      9.3
                    ],
                    [
                      27.8,
                      10.7
                    ],
                    [
                      26.8,
                      11.7
                    ],
                    [
                      25.8,
                      12.3
                    ],
                    [
                      24.8,
                      12.5
                    ],
                    [
                      23.9,
                      12.3
                    ],
                    [
                      23.2,
                      11.6
                    ],
                    [
                      22.8,
                      10.6
                    ],
                    [
                      22.7,
                      9.2
                    ],
                    [
                      22.3,
                      7.4
                    ],
                    [
                      21.8,
                      6.9
                    ],
                    [
                      21.3,
                      6.7
                    ],
                    [
                      20.8,
                      6.9
                    ],
                    [
                      20.4,
                      7.5
                    ],
                    [
                      20,
                      9.2
                    ],
                    [
                      19.9,
                      10.6
                    ],
                    [
                      19.4,
                      11.6
                    ],
                    [
                      18.8,
                      12.3
                    ],
                    [
                      17.9,
                      12.5
                    ],
                    [
                      16.9,
                      12.3
                    ],
                    [
                      15.8,
                      11.7
                    ],
                    [
                      14.9,
                      10.7
                    ],
                    [
                      14,
                      9.3
                    ],
                    [
                      12.5,
                      7
                    ],
                    [
                      10.9,
                      5.6
                    ],
                    [
                      10.3,
                      5.3
                    ],
                    [
                      9.8,
                      5.5
                    ],
                    [
                      9.4,
                      6
                    ],
                    [
                      9.3,
                      6.8
                    ],
                    [
                      9.7,
                      8.4
                    ],
                    [
                      10.7,
                      10.7
                    ],
                    [
                      11.2,
                      12.1
                    ],
                    [
                      11,
                      13.1
                    ],
                    [
                      10.1,
                      14.1
                    ],
                    [
                      8,
                      15.3
                    ],
                    [
                      4.7,
                      17.5
                    ],
                    [
                      3.6,
                      18.7
                    ],
                    [
                      2.7,
                      20
                    ],
                    [
                      2.2,
                      21.4
                    ],
                    [
                      2,
                      22.8
                    ],
                    [
                      2.2,
                      24.3
                    ],
                    [
                      2.7,
                      25.9
                    ],
                    [
                      3.9,
                      28.3
                    ],
                    [
                      4.5,
                      29.1
                    ],
                    [
                      5.1,
                      29.3
                    ],
                    [
                      7.8,
                      30.6
                    ],
                    [
                      12.1,
                      33.3
                    ],
                    [
                      17.3,
                      36.2
                    ],
                    [
                      19.7,
                      37
                    ],
                    [
                      21.3,
                      37.3
                    ]
                  ]
                ]
              },
              "symbol": {
                "type": "CIMPolygonSymbol",
                "symbolLayers": [
                  {
                    "type": "CIMSolidFill",
                    "enable": true,
                    "color": [
                      54,
                      250,
                      0,
                      255
                    ]
                  }
                ]
              }
            }
          ],
          "scaleSymbolsProportionally": true,
          "respectFrame": true,
          "clippingPath": {
            "type": "CIMClippingPath",
            "clippingType": "Intersect",
            "path": {
              "rings": [
                [
                  [
                    0,
                    0
                  ],
                  [
                    42.7,
                    0
                  ],
                  [
                    42.7,
                    42.7
                  ],
                  [
                    0,
                    42.7
                  ],
                  [
                    0,
                    0
                  ]
                ]
              ]
            }
          }
        }
      ]
    }
  }

  function handleActionBarClick({ target }) {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }

    const nextWidget = target.dataset.actionId;

    if(nextWidget === "select") {
      if(sketchViewModel.state === "active") {
        sketchViewModel.cancel();
        return;
      }
      sketchViewModel.create("rectangle");
      return;
    } else if(nextWidget === "cluster") {
      if(!!csvLayer.featureReduction) {
        csvLayer.featureReduction = null;
        return;
      } else {
        csvLayer.featureReduction = clusterConfig;
        return;
      }
    }

    if (activeWidget) {
      document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
      document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
    }
    
    if (nextWidget !== activeWidget) {
      document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
      
      activeWidget = nextWidget;
    } else {
      activeWidget = null;
    }
  }

  async function selectFeatures(geometry) {
    const query = csvLayerView.createQuery();
    query.geometry = geometry;
    query.outFields = [csvLayer.objectIdField]

    const results = await csvLayerView.queryFeatures(query);

    const features = results.features.map((feature) => {
      return feature.attributes[`${csvLayer.objectIdField}`];
    });

    featureTable.highlightIds.addMany(features);

    filterFeatures(features);
  }

  function filterFeatures(features) {
    if(features.length > 0) {
      csvLayerView.featureEffect = {
        filter: {
          objectIds: features
        },
        excludedEffect: "blur(5px) grayscale(90%) opacity(40%)"
      };
    } else {
      csvLayerView.featureEffect = {
        filter: {
          where: "1=2"
        }
      };
    }
  }

  async function querySelectedFeatures(oids) {
    const query = csvLayer.createQuery();
    query.objectIds = oids;
    query.outFields = ["*"]

    const results = await csvLayer.queryFeatures(query);
    return results.features;
  }
});
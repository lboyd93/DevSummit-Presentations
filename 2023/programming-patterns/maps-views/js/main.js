require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/views/SceneView",
  ], (
    esriConfig,
    Map,
    MapView,
    SceneView
  ) => {
    //esriConfig.apiKey = "YOUR_API_KEY_HERE";
    const map = new Map({
      // ArcGIS Organization basemap
      basemap: "topo-vector",
      // Developer basemap
      //basemap: "arcgis-topographic"
    });
    const sceneView = new SceneView({
      container: "sceneViewDiv",
      map: map,
    });
    const mapView = new MapView({
      container: "mapViewDiv",
      map: map,
      constraints: {
        // Disable zoom snapping to get the best synchronization
        snapToZoom: false,
      },
    });
  
    // Disable some of the views' events
    mapView.on("drag", (event) => {
      event.stopPropagation();
    });
  
    sceneView.on("double-click", (event) => {
      event.stopPropagation();
    });
  
    // Logic to sync the views
    const views = [sceneView, mapView];
    let active;
    const sync = (source) => {
      if (!active || !active.viewpoint || active !== source) {
        return;
      }
      for (const view of views) {
        if (view !== active) {
          view.viewpoint = active.viewpoint;
        }
      }
    };
    for (const view of views) {
      view.watch(["interacting", "animation"], () => {
        active = view;
        sync(active);
      });
      view.watch("viewpoint", () => sync(view));
    }
  });
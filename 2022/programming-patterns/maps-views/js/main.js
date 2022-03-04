require(["esri/config", "esri/layers/WebTileLayer", "esri/Basemap", "esri/widgets/BasemapToggle", "esri/Map", "esri/views/MapView", "esri/views/SceneView"], (
    esriConfig,
    WebTileLayer,
    Basemap,
    BasemapToggle,
    Map,
    MapView,
    SceneView
) => {
    // Create a WebTileLayer with a third-party cached service
    const mapBaseLayer = new WebTileLayer({
        urlTemplate: "https://stamen-tiles-{subDomain}.a.ssl.fastly.net/terrain/{level}/{col}/{row}.png",
        subDomains: ["a", "b", "c", "d"],
        copyright: 'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ' +
            'under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. ' +
            'Data by <a href="http://openstreetmap.org/">OpenStreetMap</a>, ' +
            'under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
    });
    // Create a Basemap with the WebTileLayer. The thumbnailUrl will be used for
    // the image in the BasemapToggle widget.
    const stamen = new Basemap({
        baseLayers: [mapBaseLayer],
        title: "Terrain",
        id: "terrain",
        thumbnailUrl: "https://stamen-tiles.a.ssl.fastly.net/terrain/10/177/409.png"
    });
    //esriConfig.apiKey = "YOUR_API_KEY_HERE";
    const map = new Map({
        // ArcGIS Organization basemap
        basemap: "topo-vector"
        // Developer basemap
        //basemap: "arcgis-topographic"
    });
    const sceneView = new SceneView({
        container: "sceneViewDiv",
        map: map
    });
    const mapView = new MapView({
        container: "mapViewDiv",
        map: map,
        constraints: {
            // Disable zoom snapping to get the best synchronization
            snapToZoom: false
        }
    });
    mapView.when(() => {
        // Add a basemap toggle widget to toggle between basemaps
        const toggle = new BasemapToggle({
            visibleElements: {
                title: true
            },
            view: mapView,
            nextBasemap: stamen
        });
        // Add widget to the top right corner of the view
        mapView.ui.add(toggle, "top-right");
    });
    
    // Disable some of the views' events
    mapView.on("drag", function (event) {
        event.stopPropagation();
    });

    sceneView.on("double-click", function (event) {
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
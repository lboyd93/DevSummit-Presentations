// CDN ES modules are for development and testing only
import config from "https://js.arcgis.com/next/@arcgis/core/config.js";
import MapView from "https://js.arcgis.com/next/@arcgis/core/views/MapView.js";
import Map from "https://js.arcgis.com/next/@arcgis/core/Map.js";
import SceneView from "https://js.arcgis.com/next/@arcgis/core/views/SceneView.js";
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

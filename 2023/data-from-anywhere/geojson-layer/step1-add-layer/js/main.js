/**
 * This sample demonstrates how to load GeoJSON data into an ArcGIS Maps SDK for JavaScript app.
 */
require(["esri/Map", "esri/layers/GeoJSONLayer", "esri/views/SceneView"], (
	Map,
	GeoJSONLayer,
	SceneView
) => {
	const backCountry =
		"https://lboyd93.github.io/DevSummit-Presentations/2023/data-from-anywhere/data/geojson/GRSM_BACKCOUNTRY_CAMPSITES.geojson";
	const parkBoundary =
		"https://lboyd93.github.io/DevSummit-Presentations/2023/data-from-anywhere/data/geojson/GRSM_BOUNDARYPOLY.geojson";

	// Create GeoJSONLayer from GeoJSON data
	const trailsLayer = new GeoJSONLayer({
		portalItem: {
			id: "5ccdbe2338984effb5e81b0c199df646",
		},
		copyright: "NPS",
		title: "Trails",
	});

	// Create GeoJSONLayer from GeoJSON data
	const backCountryLayer = new GeoJSONLayer({
		url: backCountry,
		copyright: "NPS",
		title: "Campsites",
	});

	// Create GeoJSONLayer from GeoJSON data
	const boundaryLayer = new GeoJSONLayer({
		url: parkBoundary,
		copyright: "NPS",
		title: "Park Boundary",
		popupEnabled: false,
	});

	const map = new Map({
		basemap: "satellite",
		ground: "world-elevation",
		layers: [boundaryLayer, trailsLayer, backCountryLayer],
	});
	const view = new SceneView({
		container: "viewDiv",
		map: map,
		qualityProfile: "high",
		popup: {
			defaultPopupTemplateEnabled: true,
		},
		// Set the camera angle
		camera: {
			position: [-83.63075093329783, 35.330167678495506, 4415.732696997933],
			tilt: 81.69077947429918,
			heading: 29.83651654634004,
		},
		environment: {
			weather: {
				type: "cloudy", // autocasts as new CloudyWeather({ cloudCover: 0.3 })
				cloudCover: 0.3,
			},
		},
	});
});

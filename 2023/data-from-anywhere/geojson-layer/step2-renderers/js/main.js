/**
 * This sample demonstrates how to load GeoJSON data into an ArcGIS Maps SDK for JavaScript app.
 */
require([
	"esri/Map",
	"esri/layers/GeoJSONLayer",
	"esri/views/SceneView",
	"esri/widgets/Legend",
], (Map, GeoJSONLayer, SceneView, Legend) => {
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
		renderer: {
			type: "simple",
			symbol: {
				type: "simple-line",
				color: "white",
				width: "4px",
				style: "short-dot",
			},
		},
	});

	// Create GeoJSONLayer from GeoJSON data
	const backCountryLayer = new GeoJSONLayer({
		url: backCountry,
		copyright: "NPS",
		title: "Campsites",
		renderer: {
			type: "simple",
			symbol: {
				type: "cim",
				data: {
					type: "CIMSymbolReference",
					symbol: {
						type: "CIMPointSymbol",
						symbolLayers: [
							{
								type: "CIMVectorMarker",
								enable: true,
								anchorPointUnits: "Relative",
								dominantSizeAxis3D: "Y",
								size: 40,
								billboardMode3D: "FaceNearPlane",
								frame: {
									xmin: 0,
									ymin: 0,
									xmax: 21,
									ymax: 21,
								},
								markerGraphics: [
									{
										type: "CIMMarkerGraphic",
										geometry: {
											rings: [
												[
													[10.51, 12.96],
													[8.63, 4.02],
													[2, 4.02],
													[10.5, 18],
													[19, 4.02],
													[12.4, 4.02],
													[10.51, 12.96],
												],
											],
										},
										symbol: {
											type: "CIMPolygonSymbol",
											symbolLayers: [
												{
													type: "CIMSolidStroke",
													enable: true,
													capStyle: "Round",
													joinStyle: "Round",
													lineStyle3D: "Strip",
													miterLimit: 10,
													width: 0.5,
													color: [0, 0, 0, 255],
												},
												{
													type: "CIMSolidFill",
													enable: true,
													color: "#AC9362",
												},
											],
										},
									},
								],
								scaleSymbolsProportionally: true,
								respectFrame: true,
							},
						],
					},
				},
			},
		},
	});

	// Create GeoJSONLayer from GeoJSON data
	const boundaryLayer = new GeoJSONLayer({
		url: parkBoundary,
		copyright: "NPS",
		title: "Park Boundary",
		popupEnabled: false,
		renderer: {
			type: "simple",
			symbol: {
				type: "simple-fill",
				color: null,
				style: "solid",
				outline: {
					color: "black",
				},
			},
		},
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

	view.ui.add(new Legend({ view: view }), "bottom-left");
});

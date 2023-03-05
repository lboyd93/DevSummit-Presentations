/**
 * This sample demonstrates how to load GeoJSON data into an ArcGIS Maps SDK for JavaScript app.
 */
require([
	"esri/Map",
	"esri/layers/GeoJSONLayer",
	"esri/views/SceneView",
	"esri/widgets/Legend",
	"esri/widgets/ElevationProfile",
	"esri/widgets/Expand",
	"esri/popup/content/TextContent",
], (
	Map,
	GeoJSONLayer,
	SceneView,
	Legend,
	ElevationProfile,
	Expand,
	TextContent
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
		renderer: {
			type: "simple",
			symbol: {
				type: "simple-line",
				color: "white",
				width: "4px",
				style: "short-dot",
			},
		},
		popupTemplate: {
			title: "{TRAILNAME}",
			outFields: ["*"],
			fieldInfos: [
				{
					fieldName: "DESIGN_USE",
					label: "Design Use",
				},
				{
					fieldName: "MTFCC",
					label: "Trail",
				},
				{
					fieldName: "PARKDISTRICT",
					label: "Park District",
				},
				{
					fieldName: "TRAILTYPE",
					label: "Trail Type",
				},
				{
					fieldName: "RESTRICTION",
					label: "Restriction",
				},
			],
			content: formatContent,
		},
	});

	// Create GeoJSONLayer from GeoJSON data
	const backCountryLayer = new GeoJSONLayer({
		url: backCountry,
		copyright: "NPS",
		title: "Campsites",
		popupTemplate: {
			title: "{LABEL} {TYPE}",
			outFields: ["*"],
			fieldInfos: [
				{
					fieldName: "TRAIL",
					label: "Trail",
				},
				{
					fieldName: "TYPE",
					label: "Type of site",
				},
				{
					fieldName: "CAMP_RESTRICTION",
					label: "Restrictions",
				},
				{
					fieldName: "PARKDISTRICT",
					label: "District",
				},
				{
					fieldName: "ACCESS",
					label: "Access",
				},
				{
					fieldName: "RULEID",
					label: "Access type",
				},
			],
			content: formatContent,
		},
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

	function formatContent(feature) {
		// Check if the access type is open or unrestricted and set
		// the color to green. Otherwise, set the color to red.
		let color =
			feature.graphic.attributes.ACCESS === "Open" || "Unrestricted"
				? "green"
				: "red";

		let textContent = new TextContent();
		// Create the text content and set the text depending on which layer
		// the feature is from and return in an array.
		if (feature.graphic.layer.title == "Campsites") {
			textContent.text =
				`<b>{LABEL}</b> resides along {TRAIL}. This site is currently <span style='color: ` +
				color +
				`;'>{ACCESS}</span> and can be reached by {RULEID}. <br><br>
				There are {CAPACITY} sites and resides in {COUNTY}, {STATE}.<br>
				Site access restriction: {CAMP_RESTRICTION}.`;
		} else {
			textContent.text =
				`{TRAILNAME} is a <b>{MTFCC}</b> and currently <span style='color: ` +
				color +
				`;'>{ACCESS}</span>. <br> Near {WATERSHED} and <span style='color: ` +
				color +
				`;'>{RESTRICTION}</span>.`;
		}
		return [textContent];
	}

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

	// Add the ElevationProfile widget referencing the view
	const elevationExpand = new Expand({
		view,
		content: new ElevationProfile({ view }),
	});
	const legendExpand = new Expand({
		view,
		content: new Legend({ view }),
	});

	// Add widgets to the UI
	view.ui.add(elevationExpand, "top-right");
	view.ui.add(legendExpand, "bottom-left");
});

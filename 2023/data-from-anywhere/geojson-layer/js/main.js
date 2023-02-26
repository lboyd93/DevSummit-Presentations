/**
 * This sample demonstrates how to load GeoJSON data into an ArcGIS Maps SDK for JavaScript app.
 */
require([
	"esri/Map",
	"esri/layers/GeoJSONLayer",
	"esri/views/SceneView",
	"esri/widgets/Legend",
	"esri/core/reactiveUtils",
	"esri/widgets/ElevationProfile",
	"esri/widgets/Expand",
	"esri/layers/GroupLayer",
	"esri/popup/content/TextContent",
], (
	Map,
	GeoJSONLayer,
	SceneView,
	Legend,
	reactiveUtils,
	ElevationProfile,
	Expand,
	GroupLayer,
	TextContent
) => {
	const parkTrails =
		"https://lboyd93.github.io/DevSummit-Presentations/2023/data-from-anywhere/data/Great_Smoky_Mountains_National_Park_3D_Trails.geojson";
	const backCountry =
		"https://lboyd93.github.io/DevSummit-Presentations/2023/data-from-anywhere/data/GRSM_BACKCOUNTRY_CAMPSITES.geojson";
	const parkBoundary =
		"https://lboyd93.github.io/DevSummit-Presentations/2023/data-from-anywhere/data/GRSM_BOUNDARYPOLY.geojson";

	// Create GeoJSONLayer from GeoJSON data
	const trailsLayer = new GeoJSONLayer({
		portalItem: {
			id: "40b6a0b4f1c54acba332567aea7430e4",
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
			content: formatContentTrails,
		},
	});

	function formatContentTrails(feature) {
		let color =
			feature.graphic.attributes.ACCESS === "Open" || "Unrestricted"
				? "green"
				: "red";
		const textContent = new TextContent({
			text:
				`{TRAILNAME} is a <b>{MTFCC}</b> trail type. Trail is is currently <span style='color: ` +
				color +
				`;'>{ACCESS}</span>. <br>
				Near {WATERSHED} and <span style='color: ` +
				color +
				`;'>{RESTRICTION}</span>.`,
		});
		return [textContent];
	}

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
		let color = feature.graphic.attributes.ACCESS === "Open" ? "green" : "red";
		const textContent = new TextContent({
			text:
				`<b>{LABEL}</b> resides along {TRAIL}. This site is currently <span style='color: ` +
				color +
				`;'>{ACCESS}</span>
			and can be reached by {RULEID}. <br><br>
			There are {CAPACITY} sites and resides in {COUNTY}, {STATE}.<br>
			Site access restriction: {CAMP_RESTRICTION}.`,
		});
		console.log(textContent.text);
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
		environment: {
			weather: {
				type: "cloudy", // autocasts as new CloudyWeather({ cloudCover: 0.3 })
				cloudCover: 0.3,
			},
		},
	});

	view.when(() => {
		view.camera = {
			position: [-83.62075354117981, 35.376406551418306, 6301.596312407404],
			tilt: 74.26089027964844,
			heading: 46.64125311677659,
		};
	});
	const elevationExpand = new Expand({
		view,
		content: new ElevationProfile({ view }),
	});
	const legendExpand = new Expand({
		view,
		content: new Legend({ view }),
	});

	view.ui.add(elevationExpand, "top-right");
	view.ui.add(legendExpand, "bottom-left");
});

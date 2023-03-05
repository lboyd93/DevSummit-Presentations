require([
	"esri/Map",
	"esri/layers/FeatureLayer",
	"esri/views/MapView",
	"esri/widgets/Legend",
	"esri/widgets/Expand",
	"esri/core/reactiveUtils",
], (Map, FeatureLayer, MapView, Legend, Expand, reactiveUtils) => {
	// Create the map.
	const map = new Map({
		basemap: "gray-vector",
	});

	// Create the MapView.
	const view = new MapView({
		container: "viewDiv",
		map: map,
		popup: {
			defaultPopupTemplateEnabled: true,
			// Dock the popup in the top right corner.
			dockEnabled: true,
			dockOptions: {
				breakpoint: false,
				position: "top-right",
			},
		},
	});

	const unitLayer = new FeatureLayer({
		url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_Wildfires_with_Nonspatial_Table/FeatureServer/3",
		title: "CALFIRE Administrative Unit Boundaries",
		outFields: ["*"],
		popupTemplate: {
			title: "{UNIT}",
			outFields: ["*"],
			returnGeometry: true,
			fieldInfos: [
				{
					fieldName: "UNITCODE",
					label: "Unit Code",
				},
				{
					fieldName: "REGION",
					label: "Region",
				},
			],
			content: [
				// Add TextContent to popup template.
				{
					type: "text",
					text: "The {UNIT} ({UNITCODE}) resides in the <b>{REGION}</b> region of California.",
				},
				// Create RelationshipContent with the relationship between
				// the units and fires.
				{
					type: "relationship",
					// The numeric ID value for the defined relationship on the service.
					// This can be found on the service.
					relationshipId: 2,
					description:
						"Fires that {UNIT} responded to from 2017-2021 ordered by most to least acreage burned.",
					// Display two related fire features in the list of related features.
					displayCount: 2,
					title: "Fires",
					// Order the related features by the 'GIS_ACRES' in descending order.
					orderByFields: {
						field: "GIS_ACRES",
						order: "desc",
					},
				},
				// Create RelationshipContent with the relationship between
				// the units and wildfire protection facility statistics table.
				{
					type: "relationship",
					relationshipId: 3,
					description:
						"Statistics on the facilities for wildland fire protection that reside within {UNIT}.",
					// Display only the one unit
					displayCount: 1,
					title: "Unit Facility Statistics",
					// Order list of related records by the 'NAME' field in ascending order.
					orderByFields: {
						field: "UNIT",
						order: "asc",
					},
				},
			],
		},
		// Create a simple renderer with no fill and lighter outline.
		renderer: {
			type: "simple",
			symbol: {
				type: "simple-fill",
				color: null,
				outline: {
					width: 0.5,
					color: "rgba(128,128,128,0.4)",
				},
			},
		},
	});

	const commonProps = {
		type: "simple-fill",
		outline: null,
	};
	const fireLayer = new FeatureLayer({
		url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_Wildfires_with_Nonspatial_Table/FeatureServer/1",
		title: "Wildfire Burn Areas",
		orderby: {
			field: "YEAR_",
			order: "descending",
		},
		// Create a UniqueValueRenderer to visualize the fires by year.
		renderer: {
			type: "unique-value",
			field: "YEAR_",
			defaultSymbol: null,
			uniqueValueInfos: [
				{
					value: "2017",
					symbol: {
						...commonProps,
						color: "#ffffb2",
					},
				},
				{
					value: "2018",
					symbol: {
						...commonProps,
						color: "#fecc5c",
					},
				},
				{
					value: "2019",
					symbol: {
						...commonProps,
						color: "#fd8d3c",
					},
				},
				{
					value: "2020",
					symbol: {
						...commonProps,
						color: "#f03b20",
					},
				},
				{
					value: "2021",
					symbol: {
						...commonProps,
						color: "#bd0026",
					},
				},
			],
		},
		popupTemplate: {
			title: "{expression/fire-name} Fire",
			outfields: ["*"],
			fieldInfos: [
				{
					fieldName: "YEAR_",
					label: "Year",
				},
				{
					fieldName: "GIS_ACRES",
					label: "Acreage Burned",
					format: {
						digitSeparator: true,
						places: 0,
					},
				},
				{
					fieldName: "expression/burn-time",
				},
				{
					fieldName: "UNIT_NAME",
					label: "Responding Unit",
				},
				{
					fieldName: "CAUSE",
					label: "Cause of fire",
				},
			],
			// Create Arcade expressions to represent fields in the fieldInfo.
			expressionInfos: [
				{
					name: "burn-time",
					title: "Duration of burn in days",
					expression:
						"Round(DateDiff($feature.CONT_DATE, $feature.ALARM_DATE, 'days'))",
				},
				{
					name: "fire-name",
					title: "Fire name",
					expression: "Proper('$feature.FIRE_NAME', 'firstword')",
				},
			],
			content: [
				// Add text content to popup
				{
					type: "text",
					text: `The {FIRE NAME} fire burned <b>{GIS_ACRES}</b> acres for <b>{expression/burn-time}</b> days in {YEAR_} and was caused by {CAUSE}.`,
				},
			],
		},
	});

	// Create the non-spatial related table
	const facilityStatsTable = new FeatureLayer({
		url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/California_Wildfires_with_Nonspatial_Table/FeatureServer/4",
		title: "Facility Statistics by Unit",
		popupTemplate: {
			// Set up table's field information
			fieldInfos: [
				{
					fieldName: "relationships/3/UNIT",
					label: "Unit",
				},
				{
					fieldName: "FREQUENCY",
					label: "Number of facilities",
				},
				{
					fieldName: "MAX_FUNDING",
					label: "Most Common Funding",
				},
				{
					fieldName: "MAX_STAFFING",
					label: "Most Common Staffing Type",
				},
				{
					fieldName: "MAX_OWNER",
					label: "Most Common Owner",
				},
			],
			title: "Facility Statistics",
			content: [
				{
					type: "text",
					text: `The {relationships/3/UNIT} has <b>{FREQUENCY}</b> facilities with funding mainly coming from {MAX_FUNDING} and {MAX_STAFFING} staffing. <br><br>
                    The facilities within this unit are mostly <b>{MAX_OWNER}</b>.`,
				},
			],
		},
	});
	// Load the non-spatial table and add to the map.
	facilityStatsTable.load().then(() => {
		map.tables.add(facilityStatsTable);
	});

	// Add all the layers to map since they all have relationships.
	map.addMany([unitLayer, fireLayer]);

	// Once the units layer loads, set the view extent to the layer's extent
	// and display a popup on initial load of the application.
	unitLayer.when(() => {
		view.extent = unitLayer.fullExtent;
		view.whenLayerView(unitLayer).then((unitLayerView) => {
			// Use reactiveUtils to watch when the layerview is done updating once.
			reactiveUtils
				.whenOnce(() => !unitLayerView?.updating)
				.then(() => {
					// Create a query from the layerview.
					let query = unitLayerView.createQuery();
					query.where = "UNIT = 'Sonoma-Lake-Napa Unit'";
					query.outFields = unitLayerView.availableFields;
					// Query for the Sonoma-Lake-Napa Unit and open it's popup.
					unitLayerView.queryFeatures(query).then((results) => {
						view.popup.open({
							features: results.features[0],
							location: results.features[0].geometry.centroid,
							fetchFeatures: true,
						});
					});
				});
		});
	});

	// Add the expand widget that contains the legend.
	view.ui.add(
		new Expand({
			content: new Legend({ view: view }),
			view: view,
			expandTooltip: "Expand Legend",
		}),
		"bottom-left"
	);
});

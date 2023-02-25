import PopupTemplate from "@arcgis/core/PopupTemplate";

/**
 * constants
 */

const referenceScale = 577790.554289;

const temperatureStops = [
  { value: 0, color: "#4575b4" },
  { value: 32, color: "#91bfdb" },
  { value: 55, color: "#e0f3f8" },
  { value: 80, color: "#fee090" },
  { value: 100, color: "#fc8d59" },
  { value: 150, color: "#d73027" }
];

/**
 * arcade expressions
 */

const skyConditionsExpression = `
    IIf(Find( 'Clear', $feature.SKY_CONDTN ) >= 0, '\ue64e', '\ue679');
  `;

const temperatureExpression = `Round($feature.TEMP) + '° F';`;

const watchesAndWarningsEventExpression = `
  var features = Intersects(FeatureSetByName($map,"Watches and Warnings"), $feature);
  IIF(Count(features) > 0, First(features).Event, "No current watches or warnings");
`;

const watchesAndWarningsSummaryExpression = `
  var features = Intersects(FeatureSetByName($map,"Watches and Warnings"), $feature);
  IIF(Count(features) > 0, First(features).Summary, "");
`;

const windChillExpression = `Round($feature.WIND_CHILL) + '° F';`;

const windSpeedExpression = `
  var deg = $feature.WIND_DIRECT;
  var speed = $feature.WIND_speed;
  var dir = When( speed == 0, "",
    (deg < 22.5 && deg >= 0) || deg > 337.5, "N",
    deg >= 22.5 && deg < 67.5, "NE",
    deg >= 67.5 && deg < 112.5, "E",
    deg >= 112.5 && deg < 157.5, "SE",
    deg >= 157.5 && deg < 202.5, "S",
    deg >= 202.5 && deg < 247.5, "SW",
    deg >= 247.5 && deg < 292.5, "W",
    deg >= 292.5 && deg < 337.5, "NW", "" );
  return speed + " km/h " + dir;
`;

// sky condition label classes
const clearSkyConditionLabelClass = {
  labelExpressionInfo: {
    expression: skyConditionsExpression
  },
  labelPlacement: "above-left",
  minScale: referenceScale,
  symbol: {
    type: "text",
    color: "yellow",
    font: {
      family: "CalciteWebCoreIcons",
      size: 14
    },
    haloColor: "gray",
    haloSize: 1.5
  },
  where: `SKY_CONDTN LIKE '%Clear%'`
};

const cloudySkyConditionLabelClass = {
  labelExpressionInfo: {
    expression: skyConditionsExpression
  },
  labelPlacement: "above-left",
  minScale: referenceScale,
  symbol: {
    type: "text",
    color: "gray",
    font: {
      family: "CalciteWebCoreIcons",
      size: 14
    },
    haloColor: "white",
    haloSize: 1.5
  },
  where: `SKY_CONDTN NOT LIKE '%Clear%'`
};

export const skyConditionLabelClasses = [clearSkyConditionLabelClass, cloudySkyConditionLabelClass];

// temperature label classes
export const temperatureLabelClasses = temperatureStops.map((stop, index) => {
  let where = "";

  index === 0
    ? (where = `TEMP <= ${stop.value}`)
    : (where = `TEMP > ${temperatureStops[index - 1].value} AND TEMP <= ${stop.value}`);

  const labelClass = {
    labelExpressionInfo: {
      expression: temperatureExpression
    },
    labelPlacement: "above-right",
    minScale: referenceScale,
    symbol: {
      type: "text",
      font: {
        size: 12,
        weight: "bold"
      },
      color: stop.color,
      haloColor: "black",
      haloSize: 0.5
    },
    where
  };

  return labelClass;
});

// wind speed label class
export const windLabelClass = {
  labelExpressionInfo: {
    expression: windSpeedExpression
  },
  labelPlacement: "below-center",
  minScale: referenceScale,
  symbol: {
    type: "text",
    font: {
      size: 12,
      weight: "bold"
    },
    color: "white",
    haloColor: "black",
    haloSize: 1
  }
};

// popup template
export const popupTemplate = new PopupTemplate({
  content: `
    <p>
      At {OBS_DATETIME}, the wind direction is blowing from {WIND_DIRECT} degrees with a speed of {WIND_SPEED} km/h.
      The temperature is {expression/temperature}. It currently feels like {expression/windchill}.
    </p>
    <p>
      <strong>Sky Conditions: </strong>{SKY_CONDTN}
    </p>
    <p>
      <strong>Visibility:</strong> {VISIBILITY} m
    </p>
    <p>
      <strong>Watches and Warnings:</strong> {expression/watchesAndWarningsEvent}
    </p>
    <p>
      {expression/watchesAndWarningsSummary}
    </p>
  `,
  expressionInfos: [
    {
      expression: `Upper($feature.STATION_NAME)`,
      name: "popupTitle"
    },
    {
      expression: temperatureExpression,
      name: "temperature"
    },
    {
      expression: watchesAndWarningsEventExpression,
      name: "watchesAndWarningsEvent"
    },
    {
      expression: watchesAndWarningsSummaryExpression,
      name: "watchesAndWarningsSummary"
    },
    {
      expression: windChillExpression,
      name: "windchill"
    }
  ],
  title: `{expression/popupTitle}`
});

export const arrowSymbol = {
  type: "cim",
  data: {
    type: "CIMSymbolReference",
    symbol: {
      type: "CIMPointSymbol",
      symbolLayers: [
        {
          type: "CIMVectorMarker",
          size: 36,
          frame: { xmin: 0.0, ymin: 0.0, xmax: 10.0, ymax: 17.0 },
          markerGraphics: [
            {
              type: "CIMMarkerGraphic",
              geometry: {
                rings: [
                  [
                    [5, 0],
                    [10, 17],
                    [5, 12],
                    [0, 17],
                    [5, 0]
                  ]
                ]
              },
              symbol: {
                type: "CIMPolygonSymbol",
                symbolLayers: [
                  {
                    type: "CIMSolidFill",
                    color: [0, 0, 0, 255]
                  },
                  {
                    type: "CIMSolidStroke",
                    color: [0, 0, 0, 255],
                    width: 1
                  }
                ]
              }
            }
          ],
          respectFrame: false
        }
      ]
    }
  }
};

// renderer
export const renderer = {
  type: "simple",
  symbol: arrowSymbol,
  visualVariables: [
    {
      type: "color",
      field: "TEMP",
      stops: temperatureStops
    },
    {
      type: "rotation",
      field: "WIND_DIRECT",
      rotationType: "geographic"
    },
    {
      type: "size",
      field: "WIND_SPEED",
      minDataValue: 5,
      minSize: {
        type: "size",
        valueExpression: "$view.scale",
        stops: [
          { value: referenceScale * 32, size: 16 },
          { value: referenceScale * 64, size: 12 },
          { value: referenceScale * 128, size: 8 },
          { value: referenceScale * 256, size: 4 }
        ]
      },
      maxDataValue: 100,
      maxSize: {
        type: "size",
        valueExpression: "$view.scale",
        stops: [
          { value: referenceScale * 32, size: 40 },
          { value: referenceScale * 64, size: 30 },
          { value: referenceScale * 128, size: 20 },
          { value: referenceScale * 256, size: 10 }
        ]
      }
    }
  ]
};

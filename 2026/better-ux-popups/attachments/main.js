(async () => {
  // Get a reference to the arcgis-map component
  const arcgisMap = document.getElementById("my-map");
  const formatButton = document.getElementById("format-button");
  const inspectionDateField = "inspdate";
  const structureLossField = "strloss";
  await arcgisMap.viewOnReady();

  arcgisMap.popupElement.dockEnabled = true;
  arcgisMap.popupElement.dockOptions = {
    breakpoint: false,
    position: "bottom-left",
  };

  arcgisMap.constraints = {
    minScale: 2000000,
    maxScale: 0,
  };

  const layer = arcgisMap.map.layers.at(0);
  await layer.load();

  // Clear out any existing formatting on the fields in the popup.
  layer.popupTemplate.content[0].fieldInfos.forEach((fieldInfo) => {
    if (
      fieldInfo.fieldName === inspectionDateField ||
      fieldInfo.fieldName === structureLossField
    ) {
      fieldInfo.format = null;
      fieldInfo.fieldFormat = null;
      fieldInfo.label = null;
    }
  });

  let attachmentsContent = layer.popupTemplate.content.find(
    (content) => content.type === "attachments",
  );

  formatButton.addEventListener("click", () => {
    // Set the fieldsConfiguration on the layer to apply formatting to the fields in the popup and other UI elements in the JS Maps SDK that consume fieldConfigurations such as the Legend.
    const fieldConfigurations = [
      {
        name: inspectionDateField,
        alias: "Inspection Date (Formatted)",
        fieldFormat: {
          type: "date-time",
          dateStyle: "full",
          timeStyle: "long",
        },
      },
      {
        name: structureLossField,
        alias: "Structural Loss (Formatted)",
        fieldFormat: {
          type: "number",
          useGrouping: "never",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
    ];
    layer.fieldConfigurations = fieldConfigurations;
  });
})();

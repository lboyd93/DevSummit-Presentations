(async () => {
  // Get a reference to the arcgis-map component
  const arcgisMap = document.getElementById("my-map");
  const formatButton = document.getElementById("format-button");
  const dropDown = document.getElementById("dropdown");
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

  //Clear out any existing formatting on the fields in the popup.
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
  layer.popupTemplate.title = `{fulladdr} - Inspection date: {${inspectionDateField}}`;

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

  // Listen for when the user selects an item in the dropdown and update the popup template's attachments content based on the selected filter.
  dropDown.addEventListener("calciteDropdownSelect", (event) => {
    // Find the popup's attachments content in the popup template's content array.
    const attachmentsContent = layer.popupTemplate.content.find(
      (content) => content.type === "attachments",
    );
    // If there is no attachments content, return early.
    if (!attachmentsContent) {
      return;
    }
    // Get the selected item from the dropdown and update the attachments content's attachmentTypes and attachmentKeywords based on the selected filter.
    const selectedItem = event.target.selectedItems[0];
    if (!selectedItem) {
      return;
    }
    const filter = selectedItem.textContent.trim();
    // Update the attachments content's attachmentTypes and attachmentKeywords based on the selected filter.
    if (filter === "attachmentType") {
      attachmentsContent.attachmentTypes = "application";
      attachmentsContent.attachmentKeywords = null;
    } else if (filter === "attachmentKeyword") {
      attachmentsContent.attachmentKeywords = "Upstream";
      attachmentsContent.attachmentTypes = null;
    } else if (filter === "attachmentKeywords & attachmentTypes") {
      attachmentsContent.attachmentKeywords = "Downstream";
      attachmentsContent.attachmentTypes = "application";
    } else if (filter === "No filters") {
      attachmentsContent.attachmentKeywords = null;
      attachmentsContent.attachmentTypes = null;
    }
    // Close and reopen the popup to apply the updated filters.
    const selectedFeature = arcgisMap.popupElement.selectedFeature;
    if (selectedFeature) {
      arcgisMap.popupElement.open = false;
      const screenPoint = arcgisMap.toScreen(selectedFeature.geometry);
      arcgisMap.popupElement.fetchFeatures(screenPoint);
      arcgisMap.popupElement.open = true;
    }
  });
})();

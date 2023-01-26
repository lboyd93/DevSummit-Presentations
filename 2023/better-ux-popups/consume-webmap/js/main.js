require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Legend",
  ], (
    WebMap,
    MapView,
    Legend,
  ) => {
    const webmap = new WebMap({
        portalItem: {
          // autocasts as new PortalItem()
          id: "f2e9b762544945f390ca4ac3671cfa72"
        }
      });
    const view = new MapView({
        container: "viewDiv",
        map: webmap,
        center: [-86.10509, 37.78353],
        zoom: 4
    });
    view.ui.add(new Legend({view}), "top-right");

    webmap.when(()=>{
        const layer = webmap.findLayerById("Accidental_Deaths_8938");
        let popupTemplate = layer.popupTemplate;
        console.log(popupTemplate);
    })
  });
  
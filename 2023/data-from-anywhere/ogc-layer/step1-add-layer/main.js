require(["esri/Map", "esri/views/MapView", "esri/layers/WFSLayer", "esri/widgets/Legend"], (
    Map,
    MapView,
    WFSLayer,
    Legend
) => {
    const whaleLayer = new WFSLayer({
        url: "https://geo.pacioos.hawaii.edu/geoserver/PACIOOS/PACIOOS:hi_pacioos_all_whales/ows",
        copyright: "Pacific Islands Ocean Observing System (PacIOOS), R.W. Baird, J.R. Mobley, E. Oleson, and J. Barlow. 2018, updated 2020. Species Distribution: Whales - Hawaii. Distributed by the Pacific Islands Ocean Observing System (PacIOOS). http://pacioos.org/metadata/hi_pacioos_all_whales.html. Data provided by PacIOOS (www.pacioos.org), which is a part of the U.S. Integrated Ocean Observing System (IOOS®), funded in part by National Oceanic and Atmospheric Administration (NOAA) Awards #NA16NOS0120024 and #NA21NOS0120091. Accessed 02/16/2023",
        title: "Species Distribution: Whales - Hawaii"
    });

    const map = new Map({
        basemap: "oceans",
        layers: [whaleLayer],
        ground: "world-elevation"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-157.04906, 21.07352],
        zoom: 7,
        popup: {
            defaultPopupTemplateEnabled: true
        }
    });

    const legend = new Legend({
        view: view
    });

    view.ui.add(legend, "top-right");
});
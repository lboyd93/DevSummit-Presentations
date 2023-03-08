require(["esri/Map", "esri/views/MapView", "esri/layers/WFSLayer", "esri/smartMapping/renderers/type", "esri/smartMapping/symbology/type", "esri/widgets/Legend", "esri/widgets/TimeSlider", "esri/layers/support/FeatureEffect", "esri/layers/support/FeatureFilter"], (
    Map,
    MapView,
    WFSLayer,
    typeRendererCreator,
    typeSchemes,
    Legend,
    TimeSlider,
    FeatureEffect,
    FeatureFilter
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
    })

    // initialize the TimeSlider widget
    const timeSlider = new TimeSlider({
        container: "timeSlider",
        view: view,
        timeVisible: true, // show the time stamps on the timeslider
        fullTimeExtent: {
            start: '2000-01-02',
            end: '2019-01-01'
        },
        stops: {
            interval: {
                value: 1,
                unit: 'years'
            }
        },
    });

    timeSlider.watch("timeExtent", (timeExtent) => {
        // use feature effect to highlight whale records within certain time frames
        // date is the field that contains time information
        const effect = new FeatureEffect({
            filter: new FeatureFilter({
                where: " date > '" + timeExtent.start.toISOString() + "' AND date < '" + timeExtent.end.toISOString() + "'"
            }),
            includedEffect: "bloom(0.1 1pt 0.3) drop-shadow(0, 0px, 8px)",
            excludedEffect: "grayscale(80%) blur(5px) opacity(30%)"
        });
        whaleLayer.featureEffect = effect;
    });

    // use smart mapping to create unique value renderer based on species
    const typeParams = {
        layer: whaleLayer,
        view: view,
        field: "species",
        legendOptions: {
            title: "Whale Species"
        },
        typeScheme: typeSchemes.getSchemeByName({
            name: "Chamois",
            geometryType: "point",
            theme: "default"
        })
    };

    typeRendererCreator
        .createRenderer(typeParams)
        .then((response) => {
            response.renderer.visualVariables = [{
                type: "size",
                field: "num_seen",
                legendOptions: {
                    title: "Number of Seen Whales"
                },
                stops: [
                    { value: 1, size: 5, label: "1" },
                    { value: 10, size: 20, label: "10" },
                    { value: 50, size: 50, label: "> 50" }
                ]
            }];
            whaleLayer.renderer = response.renderer;
        })
        .catch((error) => {
            console.error("there was an error: ", error);
        });

    view.ui.add(legend, "top-right");
    view.ui.add(timeSlider, "bottom-leading");
});
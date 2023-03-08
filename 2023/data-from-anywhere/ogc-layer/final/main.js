let whaleMediaContent;
require(["esri/Map", "esri/views/MapView", "esri/layers/WFSLayer", "esri/popup/content/TextContent", "esri/popup/content/MediaContent", "esri/smartMapping/renderers/type", "esri/smartMapping/symbology/type", "esri/widgets/Legend", "esri/widgets/TimeSlider", "esri/layers/support/FeatureEffect", "esri/layers/support/FeatureFilter"], (
    Map,
    MapView,
    WFSLayer,
    TextContent,
    MediaContent,
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
        title: "Species Distribution: Whales - Hawaii",
        popupTemplate: {
            title: '{species} ({num_seen})',
            outFields: ['*'],
            content: formatContent
        }
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
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: false,
                position: "top-left"
            }
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
        const timeFilter = " date > '" + timeExtent.start.toISOString() + "' AND date < '" + timeExtent.end.toISOString() + "'";
        const effect = new FeatureEffect({
            filter: new FeatureFilter({
                where: timeFilter
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
        // from esri color ramp: https://developers.arcgis.com/javascript/latest/visualization/symbols-color-ramps/esri-color-ramps/
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
            whaleLayer.renderer.orderByClassesEnabled = true;
            whaleLayer.renderer = response.renderer;
        })
        .catch((error) => {
            console.error("there was an error: ", error);
        });

    // can read from external source in a more complex application
    let whaleMediaInfo = [
        {
            title: "<b>Whales</b>",
            type: "image",
            caption: "Whales are among the largest and oldest animals on Earth. They can be found in every ocean and range in size from the small dwarf sperm whale to the massive blue whale, the largest animal on the planet.<br> Credit: NOAA Fisheries; Unsplash",
            value: {
                sourceURL:
                    "https://github.com/yxeHu/developer-summit-demos/blob/main/whales.png?raw=true",
                linkURL: "https://www.fisheries.noaa.gov/whales"
            }
        },
        {
            title: "<b>Melon-Headed Whale</b>",
            type: "image",
            caption: "Melon-headed whales are a robust small whale found primarily in deep, tropical waters worldwide. <br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/dam-migration/melon-headed.jpg?itok=8p46JyBt",
                linkURL: "https://www.fisheries.noaa.gov/species/melon-headed-whale#overview"
            }
        },
        {
            title: "<b>Short-Finned Pilot Whale</b>",
            type: "image",
            caption: "Short-finned pilot whales are long-lived, slow to reproduce, and highly social. They are globally in tropical and temperate oceans. <br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/dam-migration/750x500-short-finned-pilot-whale.jpg?itok=oBURO5bv",
                linkURL: "https://www.fisheries.noaa.gov/species/short-finned-pilot-whale"
            }
        },
        {
            title: "<b>Humpback Whale</b>",
            type: "image",
            caption: "Humpback whales live in all oceans around the world, and they gets its common name from the distinctive hump on its back. <br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/dam-migration/2160x1440_humpbackwhale_noaa.jpg?itok=02bN5-Mw",
                linkURL: "https://www.fisheries.noaa.gov/species/humpback-whale"
            }
        },
        {
            title: "<b>False Killer Whale</b>",
            type: "image",
            caption: "False killer whales are social animals found globally in all tropical and subtropical oceans and generally in deep offshore waters. <br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/dam-migration/false_killer_whale.jpg?itok=r0oUwcYY",
                linkURL: "https://www.fisheries.noaa.gov/species/false-killer-whale"
            }
        },
        {
            title: "<b>Killer Whale</b>",
            type: "image",
            caption: "The killer whale, also known as orca, is the ocean’s top predator. The species the most varied diet of all cetaceans, but different populations are usually specialized in their foraging behavior and diet.<br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/2020-09/killer_whale.jpg?itok=hIzXcrH7",
                linkURL: "https://www.fisheries.noaa.gov/species/killer-whale"
            }
        },
        {
            title: "<b>Sperm Whale</b>",
            type: "image",
            caption: "Sperm whales are the largest of the toothed whales and have one of the widest global distributions of any marine mammal species. They are found in all deep oceans, from the equator to the edge of the pack ice in the Arctic and Antarctic. <br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/dam-migration/sperm-whales-nefsc.jpg?itok=dOWMygh4",
                linkURL: "https://www.fisheries.noaa.gov/species/sperm-whale"
            }
        },
        {
            title: "<b>Blainville's Beaked Whale</b>",
            type: "image",
            caption: "Blainville's beaked whales are little-known members of the beaked whale family. This species lives in tropical to temperate waters worldwide. <br><i>Head of a solitary adult male Blainville’s beaked whale showing the high bottom jaw line and the erupted teeth.</i><br> Credit: NOAA Fisheries",
            value: {
                sourceURL:
                    "https://media.fisheries.noaa.gov/styles/full_width/s3/dam-migration/750x500-blainvilles-beaked-whale.jpg?itok=T738G4Nb",
                linkURL: "https://www.fisheries.noaa.gov/species/blainvilles-beaked-whale"
            }
        }
    ]

    function formatContent(feature) {
        const whaleDate = feature.graphic.attributes.date;
        const whaleType = feature.graphic.attributes.species;

        // construct the text for description with TextContent
        const whaleText =
            "This group is observed by <i>{obs_method}</i> on " + (new Date(whaleDate)).toLocaleDateString();
        const textElement = new TextContent({
            text: whaleText
        });

        // construct the MediaContent based on whale species
        let activeIndex = 0;
        whaleMediaInfo.forEach((el, index) => {
            const whaleMediaTitle = el.title.toLowerCase().replace(/'/g, "");
            if (whaleMediaTitle.includes(whaleType.toLowerCase())) {
                activeIndex = index;
            };
        })
        const whaleMediaElement = new MediaContent({
            mediaInfos: whaleMediaInfo,
            activeMediaInfoIndex: activeIndex
        });
        return [textElement, whaleMediaElement];
    }

    view.ui.add(legend, "top-right");
    view.ui.add(timeSlider, "bottom-leading");
});
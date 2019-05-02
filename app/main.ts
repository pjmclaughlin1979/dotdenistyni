import WebMap = require("esri/WebMap");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import DotDensityRenderer = require("esri/renderers/DotDensityRenderer");
import Legend = require("esri/widgets/Legend");
import Bookmarks = require("esri/widgets/Bookmarks");
import Expand = require("esri/widgets/Expand");

( async () => {

  const map = new WebMap({
    portalItem: {
      id: "f708e15ee9dd485b81b9741d91399b45"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    highlightOptions: {
      fillOpacity: 0,
      color: [50, 50, 50]
    },
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: "top-right",
        breakpoint: false
      }
    },
    constraints: {
      maxScale: 35000
    }
  });

  await view.when();
  const dotDensityRenderer = new DotDensityRenderer({
    referenceDotValue: 100,
    outline: null,
    referenceScale: 577790,
    legendOptions: {
      unit: "people"
    },
    attributes: [
      {
        field: "T2_1IEBP",
        color: "#f23c3f",
        label: "Ireland"
      },
      {
        field: "T2_1UKBP",
        color: "#e8ca0d",
        label: "UK"
      },
      {
        field: "T2_1PLBP",
        color: "#00b6f1",
        label: "Poland"
      },
      {
        field: "T2_1LTBP",
        color: "#32ef94",
        label: "Lithuania"
      },
      {
        field: "T2_1EUBP",
        color: "#ff7fe9",
        label: "Other EU 28"
      },
      {
        field: "T2_1RWBP",
        color: "#e2c4a5",
        label: "Rest of World"
      }
    ]
  });

  // Add renderer to the layer and define a popup template
  const url = "https://services1.arcgis.com/eNO7HHeQ3rUcBllm/arcgis/rest/services/Census2016_Theme2Table1_ED/FeatureServer/0/";
  const layer = new FeatureLayer({
    url: url,
    minScale: 20000000,
    maxScale: 35000,
    title: "Usually Resident Population by Place of Birth (CSO)",
    popupTemplate: {
      title: "{County}, {ED_ENGLISH}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "T2_1IEBP",
              label: "Ireland",
              format: {
                digitSeparator: true,
                places: 0
              }
            },
            {
              fieldName: "T2_1UKBP",
              label: "UK",
              format: {
                digitSeparator: true,
                places: 0
              }
            },
            {
              fieldName: "T2_1PLBP",
              label: "Poland",
              format: {
                digitSeparator: true,
                places: 0
              }
            },
            {
              fieldName: "T2_1LTBP",
              label: "Lithuania",
              format: {
                digitSeparator: true,
                places: 0
              }
            },
            {
              fieldName: "T2_1EUBP",
              label: "Other EU 28",
              format: {
                digitSeparator: true,
                places: 0
              }
            },
            {
              fieldName: "T2_1RWBP",
              label: "Rest of world",
              format: {
                digitSeparator: true,
                places: 0
              }
            }
          ]
        }
      ]
    },
    renderer: dotDensityRenderer
  });

  map.add(layer);

  const legendContainer = document.getElementById("legendDiv");
  const legend = new Legend({ 
    view,
    container: legendContainer
  });

  view.ui.add([
    new Expand({
      view,
      content: legendContainer,
      group: "top-left",
      expanded: true,
      expandIconClass: "esri-icon-layer-list"
    }),
    new Expand({
      view,
      expandIconClass: "esri-icon-filter",
      content: document.getElementById("sliderDiv"),
      group: "top-left"
    })
  ], "top-left" );

  view.ui.add(
    new Expand({
      view,
      content: new Bookmarks({ view }),
      group: "bottom-right",
      expanded: true
    }), "bottom-right");

  legendContainer.addEventListener("mousemove", legendEventListener);
  legendContainer.addEventListener("click", legendEventListener);

  let mousemoveEnabled = true;
  function legendEventListener (event:any) {
    const selectedText = event.target.alt || event.target.innerText;
    const legendInfos: Array<any> = legend.activeLayerInfos.getItemAt(0).legendElements[0].infos;
    const matchFound = legendInfos.filter( (info:any) => info.label === selectedText ).length > 0;
    
    if (matchFound){
      showSelectedField(selectedText);
      if (event.type === "click"){
        mousemoveEnabled = !mousemoveEnabled;

        if(mousemoveEnabled){
          legendContainer.addEventListener("mousemove", legendEventListener);
        } else {
          legendContainer.removeEventListener("mousemove", legendEventListener);
        }
      }
    } else {
      layer.renderer = dotDensityRenderer;
    }
  }

  function showSelectedField (label: string) {
    const oldRenderer = layer.renderer as DotDensityRenderer;
    const newRenderer = oldRenderer.clone();
    const attributes = newRenderer.attributes.map( attribute => {
      attribute.color.a = attribute.label === label ? 1 : 0.2;
      return attribute;
    });
    newRenderer.attributes = attributes;
    layer.renderer = newRenderer;
  }

  const dotValueSlider = document.getElementById("dotValueInput") as HTMLInputElement;
  const dotValueDisplay = document.getElementById("dotValueDisplay") as HTMLSpanElement;
  dotValueSlider.addEventListener("input", () => {
    const oldRenderer = layer.renderer as DotDensityRenderer;
    const newRenderer = oldRenderer.clone();
    dotValueDisplay.innerText = dotValueSlider.value;
    const dotValue = parseInt(dotValueSlider.value);
    newRenderer.referenceDotValue = dotValue;
    layer.renderer = newRenderer;
  });

})();
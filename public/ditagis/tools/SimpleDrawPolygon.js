/**
 * Chức năng vẽ đường dẫn dây điện: là đường thẳng
 * Tham số truyền vào (view, fixedLayers, drawLayer, systemVariable)
 * fixedLayers: Layer trụ điện khi tìm kiếm so trùng (hittest) Graphics
 * drawLayer: là layer để vẽ dây điện: Nhánh dây mạch điện
 */
define([
  "ditagis/core/Base",
  "esri/views/2d/draw/Draw",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Polygon",
  "ditagis/toolview/InfosManager",
], function (Base, Draw, GraphicsLayer, Graphic, Polygon, InfosManager) {
  'use strict';
  return class extends Base {
    constructor(view) {
      super();
      this.view = view;
      this.graphicsLayer = new GraphicsLayer({
        listMode: "hide"
      });
      view.map.add(this.graphicsLayer);
      this.esriDraw = new Draw({
        view: view
      });
      this.events = [];
      this.graphicNotify;
      view.on("key-down", (evt) => {
        if (evt.key === "Escape") {
          this.esriDraw.complete();
        }
        if (evt.key === "Delete") {
          this.graphicsLayer.removeAll();
          this.draw();
        }
      });
    }
    draw() {
      let action = this.esriDraw.create("polygon");
      this.events.push(action.on("vertex-add", this.updateVertices.bind(this)))
      this.events.push(action.on("vertex-remove", this.updateVertices.bind(this)))
      this.events.push(action.on("cursor-update", this.updateVertices.bind(this)))
      this.events.push(action.on("draw-complete", this.updateVertices.bind(this)))
      var infos = ["Nhấn vào màn hình để vẽ",
        "Nhấn nút Delete để xóa",
        "Nhấn nút Esc để hủy"
      ];
      InfosManager.instance(view).show(infos);

    }
    updateVertices(evt) {
      this.graphicsLayer.removeAll();
      let graphic = this.createGraphic(evt.vertices);
      if (evt.type === "draw-complete") {
        InfosManager.instance(view).hide();
        if (evt.native && evt.native.type == "pointerup") {
          this.eventListener.fire('draw-finish', graphic.geometry);
        }

      } else {
        this.graphicsLayer.add(graphic);
      }
    }
    createGraphic(vertices) {
      var polygon = {
        type: "polygon", // autocasts as Polygon
        rings: vertices,
        spatialReference: view.spatialReference
      };
    
      var graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: "simple-fill", // autocasts as SimpleFillSymbol
          color: [249, 249, 249,0.3],
          style: "solid",
          outline: {  // autocasts as SimpleLineSymbol
            color: [178, 102, 234],
            width: 1
          }
        }
      });
      return graphic;
    }
    cancel() {
      InfosManager.instance(view).hide();
      this.events.forEach(f => {
        f.remove();
      })
      this.events = [];
      this.graphicsLayer.removeAll();

    }
  }
});
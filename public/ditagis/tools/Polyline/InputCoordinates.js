define(["../../core/Base",
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/tasks/support/ProjectParameters", "esri/tasks/GeometryService",
  "esri/geometry/support/webMercatorUtils"
], function (
  Base, Point, Polyline,
  Graphic, GraphicsLayer,
  ProjectParameters, GeometryService, webMercatorUtils) {
  "use strict";
  class DrawInput extends Base {
    constructor(view) {
      super();
      this.view = view;
      this.graphicsLayer = new GraphicsLayer({
        listMode: "hide"
      });
      this.view.map.add(this.graphicsLayer);
      this.geometryService = new GeometryService({
        url: "https://ditagis.com:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer"
      });
      this.windowContent = $('<div/>', {
        class: "polyine-input-coordinates"
      })
    }
    refreshMainGraphic(paths) {
      this.graphicsLayer.removeAll();
      var graphic = new Graphic({
        geometry: new Polyline({
          paths: paths,
          spatialReference: this.view.spatialReference
        }),
        symbol: {
          type: "simple-line",
          color: [178, 102, 234],
          width: 1,
          cap: "round",
          join: "round"
        }
      });
      this.graphicsLayer.add(graphic);
      this.view.goTo(graphic);
    }
    closeWindowKendo() {
      this.inputWindow.destroy();
      this.windowContent.html('');
      this.graphicsLayer.removeAll();
    }
    getPathsOfTable(datas) {
      var paths = [];
      datas.forEach(data => {
        var xy = webMercatorUtils.lngLatToXY(data.X, data.Y);
        paths.push(xy);
      });

      this.refreshMainGraphic(paths);
    }

    getInputPolyline() {
      return new Promise((resolve, reject) => {
        this.windowContent.kendoGrid({
          dataSource: {
            data: [],
            schema: {
              model: {
                fields: {
                  X: {
                    type: "number",
                    nullable: false,
                    validation: {
                      required: true
                    }
                  },
                  Y: {
                    type: "number",
                    nullable: false,
                    validation: {
                      required: true
                    }
                  }
                }
              }
            },
          },
          height: 550,
          scrollable: true,
          pageable: false,
          editable: "incell",
          columns: [
            "X",
            "Y",
            {
              command: "destroy",
              text: "Xóa",
              width: "150px"
            }
          ],
          toolbar: [{
              name: "create",
              text: "Thêm tọa độ"
            },
            {
              name: "save",
              text: "Lưu"
            }
          ],
          saveChanges: (e) => {
            if (!confirm("Chắc chắn thêm đối tượng?")) {
              e.preventDefault();
            } else {
              let paths = this.getPathsOfTable(this.windowContent.data("kendoGrid").dataSource.data());
              resolve({
                paths
              });
              this.windowContent.data("kendoGrid").dataSource.data([]);
            }
          }
        });

        this.inputWindow = this.windowContent.kendoWindow({
          title: "Nhập tọa độ (VN2000)",
          width: 300,
          height: 400,
          position: {
            top: 100,
            left: 8
          },
          visible: false,
          actions: [
            "Close"
          ],
          close: () => {
            reject('Window is close');
            this.closeWindowKendo();
          }
        }).data("kendoWindow");
        this.inputWindow.open();
      });
    }
  }
  return DrawInput;
});
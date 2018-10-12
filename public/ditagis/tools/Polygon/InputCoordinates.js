define(["../../core/Base",
  "esri/geometry/Polygon",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/tasks/GeometryService",
  "esri/geometry/support/webMercatorUtils"
], function (
  Base, Polygon,
  Graphic, GraphicsLayer,
  GeometryService, webMercatorUtils) {
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
      refreshMainGraphic(vertices) {
        this.graphicsLayer.removeAll();
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
          var xy = webMercatorUtils.lngLatToXY(parseFloat(data.X), parseFloat(data.Y));
          paths.push(xy);
        });
        var vertices = [];
        if (paths.length > 0) {
          for (const path of paths) {
            vertices.push(path);
          }
          vertices.push(paths[0]);
        }
        this.refreshMainGraphic(vertices);
        return vertices;
      }

      getInputPolygon() {
        return new Promise((resolve, reject) => {
          this.windowContent.kendoGrid({
            dataSource: {
              data: [],
              schema: {
                model: {
                  fields: {
                    X: {
                      // type: "number",
                      nullable: false,
                      validation: {
                        required: true
                      }
                    },
                    Y: {
                      // type: "number",
                      nullable: false,
                      validation: {
                        required: true
                      }
                    }
                  }
                }
              },
            },
            scrollable: true,
            pageable: false,
            editable: "incell",
            columns: [
              "X",
              "Y",
              {
                command: "destroy",
                title: "Xóa",
                width: "100px"
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
                let vertices = this.getPathsOfTable(this.windowContent.data("kendoGrid").dataSource.data());
                resolve({
                  vertices
                });
                this.windowContent.data("kendoGrid").dataSource.data([]);
              }
            }
          });

          this.inputWindow = this.windowContent.kendoWindow({
            title: "Nhập tọa độ (VN2000)",
            position: {
              top: 100,
              left: 8
            },
            width: 400,
            height:400,
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
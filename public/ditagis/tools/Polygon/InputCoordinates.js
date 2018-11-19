define(["../../core/Base",
  "esri/geometry/Polygon",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/tasks/GeometryService",
], function (
  Base, Polygon,
  Graphic, GraphicsLayer,
  GeometryService) {
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
      return new Promise((resolve, reject) => {
        this.graphicsLayer.removeAll();
        var polygon = new Polygon({
          rings: vertices,
          spatialReference: {
            wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
          }
        });

        let projectParameters = new ProjectParameters({
          geometries: [polygon],
          outSpatialReference: view.spatialReference
        });
        this.geometryService.project(projectParameters).then(results => {
          var graphic = new Graphic({
            geometry: results[0],
            symbol: {
              type: "simple-fill", // autocasts as SimpleFillSymbol
              color: [249, 249, 249, 0.3],
              style: "solid",
              outline: { // autocasts as SimpleLineSymbol
                color: [178, 102, 234],
                width: 1
              }
            }
          });
          this.graphicsLayer.add(graphic);
          this.view.goTo(graphic);
          resolve(graphic);
        })
      });

    }
    closeWindowKendo() {
      this.inputWindow.destroy();
      this.windowContent.html('');
      this.graphicsLayer.removeAll();
    }
    getPathsOfTable(datas) {
      var paths = [];
      datas.forEach(data => {
        paths.push([parseFloat(data.X), parseFloat(data.Y)]);
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
              this.getPathsOfTable(this.windowContent.data("kendoGrid").dataSource.data())
                .then(g =>
                  resolve({
                    graphic: g
                  }));
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
          height: 400,
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
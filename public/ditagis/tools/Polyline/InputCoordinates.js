define(["../../core/Base",
  "esri/geometry/Polyline",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/tasks/support/ProjectParameters", "esri/tasks/GeometryService"
], function (
  Base, Polyline,
  Graphic, GraphicsLayer,
  ProjectParameters, GeometryService) {
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
      return new Promise((resolve, reject) => {
        this.graphicsLayer.removeAll();
        // Create a polygon geometry
        var polyline = new Polyline({
          paths: paths,
          spatialReference: {
            wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
          }
        });

        let projectParameters = new ProjectParameters({
          geometries: [polyline],
          outSpatialReference: view.spatialReference
        });
        this.geometryService.project(projectParameters).then(results => {

          var graphic = new Graphic({
            geometry: results[0],
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
          resolve(graphic);
        });
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

      return this.refreshMainGraphic(paths);
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
              text: "Xóa",
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
          width: 300,
          height: 400,
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
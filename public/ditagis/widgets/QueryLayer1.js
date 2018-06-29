define(["require", "exports", "../core/Base", "../toolview/TableWnd",
    "ditagis/widgets/ReportObjects", "esri/tasks/QueryTask"
  ],
  function (require, exports, Base, TableWnd, ReportObjects, QueryTask) {
    "use strict";
    class QueryLayer extends Base {
      constructor(view, options) {
        super();
        this.view = view;
        this.options = {
          position: "top-right",
          icon: "esri-icon-review",
          title: 'Truy vấn'
        };
        this.layerListContent = [];
        this.hanhChinhXa = new QueryTask({
          url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/DuLieuNen/MapServer/4"
        })
        this.displayFields = {
          // TramBTS:["MaTram","TenTram","TenDoanhNghiep","DoCaoTram","LoaiTram","LoaiAngTen","HuyenTp","XaPhuong"],
          TramBTS: ["MaTram", "TenTram", "TenDoanhNghiep", "HuyenTXTP", "XaPhuongTT", "TinhTrang"],
          TuyenCapNgam: ["MaTuyen", "TenTuyen", "TenDoanhNghiep", "LoaiCap"],
          DiemDichVu: ["SoHieu", "TenDiem", "TenDoanhNghiep", "HuyenTXTP", "XaPhuongTT", "DichVuCungCap"]
        }
        this.setOptions(options);
        this.reportObjects = new ReportObjects(view);
      }
      comboLayers_change(evt) {
        var that = this;
        var attributeslayer = $("<div/>");
        if (!evt) return;
        var selected = evt.sender._old;
        let layer = this.view.map.findLayerById(selected);
        if (layer) {
          let ul = $('<ul/>', {
            class: 'fieldList'
          }).appendTo(attributeslayer);
          let optionObservable = {};
          var fields = layer.getQueryFields(this.displayFields[selected]);
          for (const field of fields) {
            if (field.type === 'oid')
              continue;
            optionObservable[field.name] = null;
            let li, label, input;
            li = $('<li/>').appendTo(ul);
            label = $('<label/>', {
              for: 'field' + field.name,
              text: field.alias
            }).appendTo(li);
            input = $('<input/>', {
              'data-bind': 'value:' + field.name,
              name: field.name,
              style: 'width:100%',
              class: 'input-field'
            }).appendTo(li);
            input.keyup((evt) => {
              if (evt.key === 'Enter') {
                this.btnQueryClickHandler(layer, observable)
              }
            });
            if (field.name === 'HuyenTXTP') {
              $.get("http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/DuLieuNen/MapServer/7/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=TenHuyenTp,MaHuyenTp&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=json").done(function (res) {
                res = JSON.parse(res);
                input.kendoComboBox({
                  dataTextField: "TenHuyenTp",
                  dataValueField: "MaHuyenTp",
                  dataSource: res.features.map(function (f) {
                    return f.attributes;
                  }),
                  change: function (e) {
                    let maHuyenTP = this.value();
                    let inputXaPhuong = $(ul.find('input[name=XaPhuongTT]'));
                    if (inputXaPhuong) {
                      inputXaPhuong.data('kendoComboBox').dataSource.filter({
                        field: "MaHuyenTp",
                        operator: "eq",
                        value: maHuyenTP
                      })
                    }
                  }
                });
              });
            } else if (field.name === "XaPhuongTT") {
              that.hanhChinhXa.execute({
                where: "1=1",
                outFields: ["MaXaPhuongTT", "TenXaPhuongTT", "MaHuyenTp"]
              }).then(res => {
                input.kendoComboBox({
                  dataTextField: "TenXaPhuongTT",
                  dataValueField: "MaXaPhuongTT",
                  dataSource: res.features.map(function (f) {
                    return f.attributes;
                  }),
                })
                input.data("kendoComboBox").dataSource.filter({
                  field: "MaHuyenTp",
                  operator: "eq",
                  value: "null"
                })
                input.data("kendoComboBox").text("");
              })

            } else if (field.domain && field.domain.type === "codedValue") {
              const codedValues = field.domain.codedValues;
              if (codedValues.length > 0) {
                input.kendoComboBox({
                  dataTextField: "name",
                  dataValueField: "code",
                  dataSource: codedValues,
                });
              }
            } else if (field.type === 'date') {
              input.kendoDatePicker();
            } else {
              input.addClass('k-textbox');
              if (field.type === 'small-integer' ||
                field.type === 'integer') {
                input.attr('type', 'number');
              }
            }
          }
          let observable = kendo.observable(optionObservable);
          kendo.bind(ul, observable);
          let btnQuery = $('<button/>', {
            class: 'k-button k-primary',
            text: 'Truy vấn'
          }).appendTo($('<li/>').appendTo(ul));
          btnQuery.click(() => this.btnQueryClickHandler(layer, observable));
        }
        return attributeslayer;
      }
      btnQueryClickHandler(layer, observable) {
        this.fire("query-start", {
          layer,
          attributes: observable
        });
        let where = [];
        const fields = layer.getQueryFields();
        for (const field of fields) {
          if (field.type === 'oid')
            continue;
          if (!observable[field.name])
            continue;
          let value = null;
          if (field.name === 'HuyenTXTP') {
            value = observable[field.name]['MaHuyenTp'];
          } else if (field.name === 'XaPhuongTT') {
            value = observable[field.name]['MaXaPhuongTT'];
          } else if (field.domain && field.domain.type === "codedValue") {
            //tìm theo name
            value = observable[field.name].code;
          } else
            value = observable[field.name];
          if (value) {
            if (field.type === 'string') {
              where.push(`${field.name} like N'%${value}%'`);
            } else
              where.push(`${field.name} like ${value}`);
          }


        }
        if (where.length > 0) {
          let query = layer.createQuery();
          query.returnGeometry = false;
          query.where = where.join(' AND ');
          if (layer.definitionExpression)
            query.where = "(" + query.where + ") and " + layer.definitionExpression;
          layer.queryFeatures(query).then(results => {
            var feature = results.features;
            if (feature && feature.length > 0)
              this.reportObjects.showReport(layer, feature).then(_ => {
                this.fire("query-success", {
                  layer,
                  attributes: observable
                });
              })
            else {
              this.fire("query-success", {
                layer,
                attributes: observable
              });
              kendo.alert('Không tìm thấy đối tượng nào');
            }

          });
        } else {
          this.fire("query-success", {
            layer,
            attributes: observable
          });
        }
      }
    }

    return QueryLayer;
  });
//# sourceMappingURL=QueryLayer.js.map
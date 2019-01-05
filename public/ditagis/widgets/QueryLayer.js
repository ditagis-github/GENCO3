define(["../core/Base",
  "ditagis/widgets/ReportObjects"
],
  function (Base,
    ReportObjects) {
    "use strict";
    class QueryLayer extends Base {
      constructor(view) {
        super();
        this.view = view;
        this._layerGroups = [];
        this.layerListContent = [];
        this.on("query-start", _ => {
          kendo.ui.progress(this.attributeslayer, true)
        })
        this.on("query-success", _ => {
          kendo.ui.progress(this.attributeslayer, false)
        })
        this.bindingDataSource();
        this.hiddenQueryFields = ["DonViCapNhat", "NgayCapNhat", "NguoiCapNhat", "MaDoiTuong", "Ten"];
        this.selectQueryFields = ["TenNhaMay", "MaNhaMay", "MaTruSo", "TenTruSo"];
        this.reportObjects = new ReportObjects(view);
        this.render();
      }
      render() {
        this.pane = document.createElement('div');
        this.pane.classList.add('esri-widget', 'ditagis-widget-layer-editor');
        var pane_title = document.createElement('div');
        pane_title.classList.add("pane-title");
        this.pane.appendChild(pane_title);
        this.select = $("<input/>", {
          style: "width:89%",
        }).appendTo(pane_title);
        var element = $("<div/>", {
          class: "close-item close-widget"
        }).appendTo(pane_title);
        element.on('click', () => {
          this.fire("click", $(this.pane));
        });
        var span = $("<span/>", {
          class: "esri-icon-close",
          title: "Đóng"
        });
        element.append(span);
        this.dropDownLayers = this.select.kendoDropDownList({
          dataTextField: "title",
          dataValueField: "id",
          text: "Chai",
          optionLabel: "Chọn lớp dữ liệu"
        }).data("kendoDropDownList");

        this.attributeslayer = $("<div/>", {
          class: "query-method-widget",
        }).appendTo(this.pane);
      }
      bindingDataSource() {
        this.view.on('layerview-create', (evt) => {
          const layer = evt.layer;
          if (layer.type === 'feature' && layer.permission && layer.permission.create) {
            if (layer.parent.id) {
              let panelGroup = this._layerGroups[layer.parent.id];
              if (!panelGroup) {
                this._layerGroups[layer.parent.id] = panelGroup;
              }
            }
          }
        });
        for (const layer of this.view.systemVariable.user.Layers) {
          if (layer.IsView) {
            this.layerListContent.push({
              title: layer.LayerTitle,
              id: layer.LayerID,
              group: layer.GroupName
            });
          }

        }
      }
      onCbChangeQueryLayer(evt) {
        this.dropDownLayers_change(evt).then((div) => {
          this.attributeslayer.empty();
          this.attributeslayer.append(div);
        });

      }
      async dropDownLayers_change(evt) {
        var attributeslayer = $("<div/>");
        if (!evt) return;
        var selected = evt.sender._old;
        let layer = this.view.map.findLayerById(selected);
        if (layer) {
          let ul = $('<ul/>', {
            class: 'fieldList'
          }).appendTo(attributeslayer);
          let optionObservable = {};
          var fields = layer.getQueryFields();
          for (const field of fields) {
            var isHiddenQueryField = false;
            for (const hiddenQueryField of this.hiddenQueryFields) {
              if (field.name == hiddenQueryField) {
                isHiddenQueryField = true;
                break;
              }
            }
            if (field.type === 'oid' || isHiddenQueryField) {
              continue;
            }
            optionObservable[field.name] = null;
            let li, input;
            li = $('<li/>').appendTo(ul);
            $('<label/>', {
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
            var isSelectQueryField = false;
            for (const selectQueryField of this.selectQueryFields) {
              if (field.name == selectQueryField) {
                isSelectQueryField = true;
                break;
              }
            }
            if (isSelectQueryField) {
              var features = await this.queryFeatureLayer(layer, field.name);
              var rs_Features = await this.queryFeatureLayer(layer);
              input[0].features = features;
              input.kendoComboBox({
                dataTextField: field.name,
                dataValueField: field.name,
                dataSource: this.getDataSource(features),
              });
              input.bind("change", combobox_change.bind(this));
              function combobox_change (e) {
                let value = e.currentTarget.value;
                var changeFields;
                if (field.name == "MaTruSo") {
                  changeFields = ["TenNhaMay", "TenTruSo", "MaNhaMay"];
                }
                else if (field.name == "MaNhaMay") {
                  changeFields = ["TenNhaMay"];
                }
                else changeFields = [];
                if (changeFields.length > 0)
                  for (const changeField of changeFields) {
                    let inputField = $(ul.find(`input[name=${changeField}]`));
                    if (inputField.length > 0) {
                      if (value) {
                        inputField.kendoComboBox({
                          dataTextField: changeField,
                          dataValueField: changeField,
                          dataSource: this.getDataSource(rs_Features)
                        });
                        inputField.data('kendoComboBox').dataSource.filter({
                          field: field.name,
                          operator: "eq",
                          value: value
                        });
                      }
                      else {
                        var features = inputField[0].features;
                        inputField.kendoComboBox({
                          dataTextField: changeField,
                          dataValueField: changeField,
                          dataSource: this.getDataSource(features),
                        });
                      }
                      inputField.data("kendoComboBox").value("");
                    }
                  }
              }
            }
            else if (field.domain && field.domain.type === "coded-value") {
              const codedValues = field.domain.codedValues;
              if (codedValues.length > 0) {
                input.kendoComboBox({
                  dataTextField: "name",
                  dataValueField: "code",
                  dataSource: codedValues
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
          }).appendTo($('<div/>', {
            class: "btn-accept"
          }).appendTo(attributeslayer));
          btnQuery.click(() => this.btnQueryClickHandler(layer, observable));
        }
        return attributeslayer;
      }
      getDataSource(rs) {
        if (!rs) return null;
        let features = rs.features;
        return features.map(function (f) {
          return f.attributes;
        });
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
          var isSelectQueryField = false;
          for (const selectQueryField of this.selectQueryFields) {
            if (field.name == selectQueryField) {
              isSelectQueryField = true;
              break;
            }
          }
          if (isSelectQueryField) {
            value = observable[field.name][field.name];
          }
          else if (field.domain && field.domain.type === "coded-value") {
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
      queryFeatureLayer(layer, outFields) {
        var query = layer.createQuery();
        query.where = "1 = 1";
        query.outFields = outFields || this.selectQueryFields;
        query.returnDistinctValues = true;
        query.returnGeometry = false;
        return layer.queryFeatures(query);
      }
      start() {
        this.dropDownLayers.setDataSource(new kendo.data.DataSource({
          group: { field: "group" },
          data: this.layerListContent
        }));
        this.fire("click", $(this.pane));
        this.dropDownLayers.bind("change", this.onCbChangeQueryLayer.bind(this))
      }

    }

    return QueryLayer;
  });
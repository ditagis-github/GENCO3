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
        this.displayFields = {
        }
        this.reportObjects = new ReportObjects(view);
        this.render();
      }
      render() {
        this.pane = document.createElement('div');
        this.pane.classList.add('esri-widget', 'ditagis-widget-layer-editor');
        this.select = $("<input/>", {
          style: "width:100%",
        }).appendTo(this.pane);
        this.dropDownLayers = this.select.kendoDropDownList({
          dataTextField: "title",
          dataValueField: "id",
          text: "Chai",
          optionLabel: "Chọn lớp dữ liệu"
        }).data("kendoDropDownList");

        this.attributeslayer = $("<div/>", {
          class: "query-method-widget",
          style: "padding:10px;width:300px;"
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
        for (const layer of view.systemVariable.user.Layers) {
          if (layer.IsView) {
            this.layerListContent.push({
              title: layer.LayerTitle,
              id: layer.LayerID,
              group:layer.GroupName
            });
          }

        }
      }
      onCbChangeQueryLayer(evt) {
        var div = this.dropDownLayers_change(evt);
        this.attributeslayer.empty();
        this.attributeslayer.append(div);
      }
      dropDownLayers_change(evt) {
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
            if (field.domain && field.domain.type === "codedValue") {
              const codedValues = field.domain.codedValues;
              if (codedValues.length > 0) {
                input.kendoDropDownList({
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
      start() {
        this.dropDownLayers.setDataSource(new kendo.data.DataSource({
          group: { field: "group" },
          data:this.layerListContent
        }));
        this.fire("click", $(this.pane));
        this.dropDownLayers.bind("change", this.onCbChangeQueryLayer.bind(this))
      }
    }

    return QueryLayer;
  });
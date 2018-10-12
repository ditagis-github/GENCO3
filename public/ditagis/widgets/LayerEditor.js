define([
  "../core/Base",
  "dojo/on",
  "../core/ConstName",
  "ditagis/widgets/subwidgets/PointDrawingTools",
  "ditagis/widgets/subwidgets/PolylineDrawingTools",
  "ditagis/widgets/subwidgets/PolygonDrawingTools"
], function (Base, on, constName,
  PointDrawingTools, PolylineDrawingTools,
  PolygonDrawingTools
) {
    'use strict';
    return class extends Base {
      constructor(view, options = {}) {
        super();
        this.view = view;
        this.systemVariable = view.systemVariable;
        this.options = {
          position: "top-right",
          icon: 'esri-icon-authorize',
          title: 'Biên tập dữ liệu'
        }
        for (let i in options) {
          this.options[i] = options[i];
        }

        this._isStartup = false;
        this._layerGroups = [];
        this._hasLayer = false;
        this.initView();
        this.pointDrawingTools = new PointDrawingTools(view);
        this.polylineDrawingTools = new PolylineDrawingTools(view);
        this.polygonDrawingTools = new PolygonDrawingTools(view);



      }
      editor() {
        this.fire("click", $(this._container));
        this.startup();
      }
      set hasLayer(val) {
        if (!this._hasLayer) {
          this._hasLayer = true;
        }
      }
      get selectedFeature() {
        return this.systemVariable.selectedFeature;
      }
      set selectedFeature(value) {
        this.systemVariable.selectedFeature = value;
      }
      startup() {
        if (!this._isStartup) {
          this._isStartup = true;

        }
        else {
          this.clearEvents();
        }
      }
      clearEvents() {
        this.pointDrawingTools.clearEvents();
        // this.polylineDrawingTools.clearEvents();
        // this.polygonDrawingTools.clearEvents();
      }
      destroy() {
        if (this._isStartup) {
          this.pointDrawingTools.destroy();
          this.polylineDrawingTools.destroy();
          this.polygonDrawingTools.destroy();
          this._isStartup = false;
        }
      }
      rendererLayerGroup(layer) {
        if (layer.parent && layer.parent.type === 'group') {
          let panelGroup = this._layerGroups[layer.parent.id];
          if (!panelGroup) {
            let li = document.createElement('li');
            li.classList.add('panelGroup');
            li.innerHTML = `<label class="title">${layer.parent.title}</label>`
            let div = document.createElement('div');
            div.classList.add('item-container');
            li.appendChild(div);
            panelGroup = document.createElement('div');
            panelGroup.classList.add('panel-group');
            panelGroup.id = "accordion-" + layer.parent.id;
            div.appendChild(panelGroup);
            this._ulContainer.appendChild(li);
            this._layerGroups[layer.parent.id] = panelGroup;
          }
          const symbol = layer.renderer.symbol || layer.renderer.uniqueValueInfos[0].symbol;
          let layerSymbols = [],
            collapseId = 'collapse' + layer.id;
          let button = document.createElement('button');
          button.classList.add('accordion');
          if (!layer.visible)
            button.classList.add('hidden');
          button.innerText = layer.title;
          button.onclick = function () {
            /* Toggle between adding and removing the "active" class,
            to highlight the button that controls the panel */
            this.classList.toggle("active");

            /* Toggle between hiding and showing the active panel */
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
              panel.style.display = "none";
            } else {
              panel.style.display = "block";
            }
          }
          panelGroup.appendChild(button);
          //nếu như layer không hiển thị theo domain
          if (layer.renderer.symbol) {
            const img = symbol.url;
            let contentSymbol;
            if (img) {
              contentSymbol = `<img src='${img}' class="img-symbol"></img>`;
            } else {
              if (symbol.type === "simple-marker") {
                contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <circle fill="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            fill-opacity="1" 
                            stroke="rgb(0, 0, 0)" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            x="0" cy="0" r="2.6666666666666665" 
                            transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                            </circle>
                            </svg>`
              }
              //nếu là đường 
              else if (symbol.type === "simple-line") {
                contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <path 
                            fill="none" 
                            fill-opacity="0" 
                            stroke="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            path="M -15,0 L 15,0 E" d="M-15 0L 15 0" 
                           transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                           </path>
                           </svg>`
              }
              else if (symbol.type === "simple-fill") {
                var rgb_fill = "rgb(" + symbol.color.r + ", " + symbol.color.g + ", " + symbol.color.b + ")";
                var rgb_stroke = "rgb(" + symbol.outline.color.r + ", " + symbol.outline.color.g + ", " + symbol.outline.color.b + ")";
                contentSymbol = "<svg overflow='hidden' width='24' height='24' style='touch-action: none;'>"
                  + "<defs></defs>"
                  + "<g transform='matrix(1.00000000,0.00000000,0.00000000,1.00000000,12.00000000,12.00000000)'>"
                  + "   <path fill='" + rgb_fill + "' fill-opacity= '" + symbol.color.a + "' stroke= '" + rgb_stroke + "' stroke-opacity='" + symbol.outline.color.a
                  + "'       stroke-width='0.5333333333333333' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='10'"
                  + "        path='M -10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z' d='M-10-10L 10 0L 10 10L-10 10L-10-10Z'"
                  + "        fill-rule='evenodd' stroke-dasharray='none' dojoGfxStrokeStyle='solid'></path>"
                  + " </g>"
                  + "  </svg>";
                 

              }
            }
            layerSymbols.push({
              symbol: contentSymbol
            })
          }
          //hiển thị theo symbol
          else {
            let contentSymbol;
            if (layer.renderer.defaultSymbol) {
              const img = layer.renderer.defaultSymbol.url;
              contentSymbol = {
                symbol: `<img src='${img}' style="width: 25px;"></img>`,
                label: layer.renderer.defaultLabel
              }
              layerSymbols.push(contentSymbol);
            }
            for (let icon of layer.renderer.uniqueValueInfos) {
              let symbol = icon.symbol;
              //nếu là điểm
              if (symbol.type === "simple-marker") {
                // console.log(icon);
                contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <circle fill="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            fill-opacity="1" 
                            stroke="rgb(0, 0, 0)" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            x="0" cy="0" r="2.6666666666666665" 
                            transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                            </circle>
                            </svg>`
              }
              //nếu là đường 
              else if (symbol.type === "simple-line") {
                contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <path 
                            fill="none" 
                            fill-opacity="0" 
                            stroke="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            path="M -15,0 L 15,0 E" d="M-15 0L 15 0" 
                           transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                           </path>
                           </svg>`
              }
              else if (symbol.type === "simple-fill") {
                var rgb_fill = "rgb(" + symbol.color.r + ", " + symbol.color.g + ", " + symbol.color.b + ")";
                var rgb_stroke = "rgb(" + symbol.outline.color.r + ", " + symbol.outline.color.g + ", " + symbol.outline.color.b + ")";
                contentSymbol = "<svg overflow='hidden' width='24' height='24' style='touch-action: none;'>"
                  + "<defs></defs>"
                  + "<g transform='matrix(1.00000000,0.00000000,0.00000000,1.00000000,12.00000000,12.00000000)'>"
                  + "   <path fill='" + rgb_fill + "' fill-opacity= '" + symbol.color.a + "' stroke= '" + rgb_stroke + "' stroke-opacity='" + symbol.outline.color.a
                  + "'       stroke-width='0.5333333333333333' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='10'"
                  + "        path='M -10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z' d='M-10-10L 10 0L 10 10L-10 10L-10-10Z'"
                  + "        fill-rule='evenodd' stroke-dasharray='none' dojoGfxStrokeStyle='solid'></path>"
                  + " </g>"
                  + "  </svg>";

              }
              //nếu như có hình ảnh thì hiển thị hình ảnh
              else {
                console.log(symbol.type);
                const img = symbol.url;
                contentSymbol = `<img src='${img}' style="width: 25px;"></img>`;
              }
              if (icon.value != "<Null>") {
                layerSymbols.push({
                  symbol: contentSymbol,
                  label: icon.label,
                  value: icon.value
                })
              }

            }
          }
          let panelBody = document.createElement('div');
          panelBody.classList.add('panel-accordion', 'panel-body');
          panelGroup.appendChild(panelBody);
          if (this.view.systemVariable.user.GroupRole === "DN" &&
            layer.id === constName.TramBTS) {
            let symbol = layerSymbols.find(f => {
              if (f.value)
                return f.value.substring(0, f.value.search(",")) === this.view.systemVariable.user.Role
              return false;
            });
            layerSymbols = [symbol];
          }
          if (layerSymbols.length > 0) {
            let table = document.createElement('table');
            table.classList.add('table');
            panelBody.appendChild(table);
            for (let symbolItem of layerSymbols) {
              const symbol = symbolItem.symbol,
                label = symbolItem.label,
                value = symbolItem.value;
              let tr = document.createElement('tr');
              table.appendChild(tr);
              let tdSymbol = document.createElement('td');
              if (layer.geometryType == "point") {
                tdSymbol.classList.add('symbol-type-point');
              }
              else if (layer.geometryType == "polyline") {
                tdSymbol.classList.add('symbol-type-polyline');
              }
              tdSymbol.innerHTML = symbol;
              tr.appendChild(tdSymbol);

              //nếu có label
              if (label) {
                let tdLabel = document.createElement('td');
                tdLabel.classList.add('icon-label');
                tdLabel.innerText = label;
                tr.appendChild(tdLabel);
              }
              on(tr, "click", (evt) => {
                this.layerItemClickHandler(layer, value);
              });

            }
          }
          return button;
        }

      }



      initView() {
        try {
          this._container = document.createElement('div');
          this._container.classList.add('esri-widget', 'ditagis-widget-layer-editor');

          var title_widget = $("<div/>", {
            width: "100%",
            class: "title-widget"
          }).appendTo(this._container);
          $("<div/>", {
            class: "title-pane",
            text: "Danh sách công ty"
          }).appendTo(title_widget);
          var close_widget = $("<div/>", {
            class: "close-item close-widget"
          }).appendTo(title_widget);
          close_widget.on('click', () => {
            this.fire("click", $(this.pane));
          });
          var span = $("<span/>", {
            class: "esri-icon-close",
            title: "Đóng"
          });
          close_widget.append(span);
          this._ulContainer = document.createElement('ul');
          this._ulContainer.classList.add('layer-editor');
          this._container.appendChild(this._ulContainer);
          this.view.on('layerview-create', (evt) => {
            const layer = evt.layer;
            if (layer.type === 'feature' && layer.permission && layer.permission.create) {
              this.hasLayer = true;
              let button = this.rendererLayerGroup(layer);
              layer.watch('visible', (newVal, oldVal) => {
                if (button) {
                  if (oldVal && !newVal) {
                    button.classList.add('hidden');
                  }
                  if (!oldVal && newVal) {
                    button.classList.remove('hidden');
                  }
                }
              })
            }
          });

        } catch (error) {
          throw error;
        }
      }
      layerItemClickHandler(layer, value) {
        const typeIdField = layer.typeIdField;
        if (value) {
          layer.drawingAttributes = {};
          layer.drawingAttributes[typeIdField] = value;
        }
        this.selectedFeature = layer;
        this.polylineDrawingTools.destroy();
        this.pointDrawingTools.destroy();
        this.polygonDrawingTools.destroy();
        switch (layer.geometryType) {
          case 'point':
            this.pointDrawingTools.startup();
            break;
          case 'polyline':
            this.polylineDrawingTools.startup();
            break;
          case 'polygon':
            this.polygonDrawingTools.startup();
            break;
          default:
            console.log("Chưa được liệt kê")
            break;
        }
      }
    }
  });
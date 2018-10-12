define([
    "dojo/on",
    "dojo/dom-construct",
    "ditagis/tools/PolygonDrawingToolManager",
    "ditagis/classes/EventListener",


], function (on,
    domConstruct,
    PolygonDrawingToolManager,
    EventListener,
    ) {
        'use strict';

        return class {
            constructor(view) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this.isStartup = false;
                1
                this._drawLayer = null;
                this.drawingMethods = [{
                    name: "Mặc định",
                    type: "macdinh"
                },
                {
                    name: "Tọa độ X-Y",
                    type: "nhaptoado"
                }];

                this.drawingManager = new PolygonDrawingToolManager(view)
                this.eventListener = new EventListener(this);
                this.drawingManager.on('draw-finish', (evt) => {
                    this.isStartup = false;
                })
                //đăng ký sự kiện khi có sự thay đổi giá trị của systemVariable
                this.systemVariable.on('change-selectedFeature', () => {
                    //khi giá trị thay đổi thì cập nhật cho drawingManager
                    this.drawingManager.drawLayer = this.drawLayer;
                })
                this.setupWindowKendo();
            }
            startup() {
                this.inputWindow.open();
            }
            clearEvents() {
                if (!this.drawLayer || this.drawLayer.geometryType !== 'polyline') return;
                this.drawingManager.cancel();
                this.isStartup = false;
            }
            setupWindowKendo() {
                this.container = $("#draw-method-polygon")[0];
                for (let drawingMethod of this.drawingMethods) {
                    let btn = domConstruct.create("button", {
                        class: 'methods type-draw',
                        innerHTML: drawingMethod.name,
                    }, this.container);
                    this.clickBtnEvt = on(btn, 'click', () => {
                        this.clickBtnFunc(drawingMethod.type);

                    })

                }
                domConstruct.place(this.container, document.body)
                this.inputWindow = $('#draw-method-polygon').kendoWindow({
                    title: "Chọn cách thêm vùng",
                    position: {
                        top: 100, // or "100px"
                        left: 8
                    },
                    visible: false,
                    actions: [
                        "Close"
                    ],
                    close: this.closeWindowKendo.bind(this),
                }).data("kendoWindow");
            }
            closeWindowKendo() {
                this.clearEvents();
            }
            destroy() {
                if (this.isStartup) {
                    if (!this.view.isMobile) {
                        if (this.container && document.body.contains(this.container))
                            document.body.removeChild(this.container);
                    }
                    this.isStartup = false;
                }
                this.drawingManager.cancel();
                if (!this.inputWindow.element.is(":hidden"))
                    this.inputWindow.close();
            }
            get drawLayer() {
                return this.systemVariable.selectedFeature;
            }
            clickBtnFunc(drawingMethod) {
                this.inputWindow.close();
                if (!this.drawLayer || this.drawLayer.geometryType !== 'polygon') return;
                switch (drawingMethod) {
                    case this.drawingMethods[0].type:
                        this.drawingManager.drawSimple();
                        break;
                    case this.drawingMethods[1].type:
                        this.drawingManager.drawByPointInput();
                        break;

                    default:
                        break;
                }
            }

        }
    });
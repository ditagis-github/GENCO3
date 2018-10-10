define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom",
    "esri/widgets/Expand",

    "ditagis/tools/PointDrawingToolManager",
], function (on,
    domConstruct, domAttr, domClass, dom,
    Expand,
    PointDrawingToolManager) {
        'use strict';

        return class {
            constructor(view) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this.isStartup = false;

                this.drawingMethods = [{
                    name: "Mặc định",
                    type: "macdinh"
                },
                {
                    name: "Tọa độ X-Y",
                    type: "nhaptoado"
                }];

                this.drawingManager = new PointDrawingToolManager(this.view);
                //đăng ký sự kiện khi có sự thay đổi giá trị của systemVariable
                this.systemVariable.on('change-selectedFeature', () => {
                    //khi giá trị thay đổi thì cập nhật cho drawManager
                    this.drawingManager.drawLayer = this.drawLayer;
                });
                this.setupWindowKendo();
            }
            startup() {
                this.clearEvents();
                this.inputWindow.open();
            }
            clearEvents() {
                if (!this.drawLayer || this.drawLayer.geometryType !== 'point') return;
                this.drawingManager.clearEvents();
                this.isStartup = false;
            }
            destroy() {
                if (this.isStartup) {
                    if (!this.view.isMobile) {
                        if (this.container && document.body.contains(this.container))
                            document.body.removeChild(this.container);
                    }
                    this.isStartup = false;
                }
                this.drawingManager.clearEvents();
                if (!this.inputWindow.element.is(":hidden"))
                    this.inputWindow.close();
            }
            setupWindowKendo() {
                this.container = $("#draw-method-point")[0];
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
                this.inputWindow = $('#draw-method-point').kendoWindow({
                    title: "Chọn cách thêm điểm",
                    position: {
                        top: 100, // or "100px"
                        left: 8
                    },
                    visible: false,
                    actions: [
                        "Close"
                    ],
                    close: this.closeWindowKendo.bind(this)
                }).data("kendoWindow");
            }
            closeWindowKendo() {
                this.clearEvents();
            }
            get drawLayer() {
                return this.systemVariable.selectedFeature;
            }
            clickBtnFunc(drawingMethod) {
                this.inputWindow.close();
                if (!this.drawLayer || this.drawLayer.geometryType !== 'point') return;
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
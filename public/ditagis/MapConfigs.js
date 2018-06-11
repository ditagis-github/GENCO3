define(["require", "exports"], function (require, exports) {
    "use strict";
    const MapConfigs = {
        layers: [{
            title: 'Nhà máy',
            id: "NhaMay",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/7",
            outFields: ['*'],
            outFields: ["*"],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        },
        {
            title: 'Van',
            id: "Van",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/6",
            outFields: ['*'],
            outFields: ["*"],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Lò hơi',
            id: "LoHoi",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/5",
            outFields: ['*'],
            outFields: ["*"],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Trạm biến áp',
            id: "TramBienAp",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/4",
            outFields: ['*'],
            outFields: ["*"],
            permission: {
                create: true,
                delete: true,
                edit: true,
                view: true,
            },
            queryFields: "",
            groupLayer: "chuyendehientrang"
        }, {
            title: 'Tua bin',
            id: "TuaBin",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/3",
            outFields: ['*']
        }, {
            title: 'Bồn chứa',
            id: "BonChua",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/2",
            outFields: ['*']
        }, {
            title: 'Ống khói',
            id: "OngKhoi",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/1",
            outFields: ['*'],
        }, {
            title: 'Camera',
            id: "Camera",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/0",
            outFields: ['*']
        }
        ],
        zoom: 6,
        center: [106.9562792, 16.8799795]
    };
    return MapConfigs;
});
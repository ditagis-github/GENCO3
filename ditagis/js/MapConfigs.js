define(["require", "exports"], function (require, exports) {
    "use strict";
    const MapConfigs = {
        layers: [{
            title: 'Nhà máy',
            id: "NhaMay",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/6",
            outFields: ['*'],
        },
        {
            title: 'Van',
            id: "Van",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/0",
            outFields: ['*'],
        }, {
            title: 'Lò hơi',
            id: "LoHoi",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/1",
            outFields: ['*']
        }, {
            title: 'Trạm biến áp',
            id: "TramBienAp",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/2",
            outFields: ['*'],
        }, {
            title: 'Bồn chứa',
            id: "BonChua",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/3",
            outFields: ['*']
        }, {
            title: 'Ống khói',
            id: "OngKhoi",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/4",
            outFields: ['*'],
        }, {
            title: 'Camera',
            id: "Camera",
            url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/5",
            outFields: ['*']
        }
        ],
        zoom: 6,
        center: [106.9562792, 16.8799795]
    };
    return MapConfigs;
});
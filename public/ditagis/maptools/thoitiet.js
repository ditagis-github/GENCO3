define([
    "dojo/dom-construct",
    "ditagis/core/LinkAPI",
], function (domConstruct, LinkAPI) {

    return class ThoiTiet {
        constructor() {
            this.manhamay = null;
            this.cacchiso = ["CO2", "CO", 'Dust', 'NO2', "O2", "SO2", "Temp"];
        }
        laythongtinthoitiet(location, manhamay) {
            this.manhamay = manhamay;
            $.ajax({
                url: "https://weatherbit-v1-mashape.p.rapidapi.com/current?lat=" + location.latitude + "&lon=" + location.longitude,
                type: 'GET',
                dataType: 'json',
                headers: {
                    "X-RapidAPI-Key": "a376f6fdd6msh9ba450daf42bbaep1e2fd9jsnccab26cf77a8"
                },
                contentType: 'application/json; charset=utf-8',
                success: (result) => {
                    var nhietdo = document.getElementById("nhietdo");
                    nhietdo.textContent = result.data[0].temp;
                    var doam = document.getElementById("doam");
                    doam.textContent = result.data[0].rh;
                    var tocdogio = document.getElementById("tocdogio");
                    tocdogio.textContent = result.data[0].wind_spd;
                    document.getElementById("thongtinmoitruong").innerHTML = "";
                    if (this.manhamay)
                        for (const chiso of this.cacchiso) {
                            $.ajax({
                                url: `${LinkAPI.THOITIET_THONGTINMOITRUONG}${this.manhamay}?id=${chiso}`,
                                success: function (result) {
                                    document.getElementById("thongtinmoitruong").innerHTML += `
                                <div class="row-item">
                                    ${chiso}
                                    <div class="label pull-right">
                                        <strong>${result}</strong>
                                    </div>
                                </div>
                                `
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    if (jqXHR.status == 404 || errorThrown == 'Not Found') {
                                        console.log('There was a 404 error.');
                                    }
                                }
                            });
                        }
                },
                error: function (error) {
                    onsole.log("Fail zone");
                }
            });
            $("div#weather-panel").show();
            $("#close-widget").show();
        }
        close() {
            $("#weather-panel").hide();
            $("#close-widget").hide();
        }

    }
});
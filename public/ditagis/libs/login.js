//  var gisapi_url = "https://gis.genco3.com/gisapi/";
var gisapi_url = "https://ditagis.com/genco3/";
localStorage.clear();
let input = $('input[name="remember"]');
loginSession();

function loginSession() {
    var url = new URL(location.href);
    var c = url.searchParams.get("usid");
    if (c) {
        $.get(gisapi_url + "api/Login/AuthSession/" + c)
            .then(rs => {
                if (rs) {
                    localStorage.setItem("login_code", rs);
                    localStorage.setItem("username", $("#user-tf").val());
                    location.href = '/index.html'
                }
            })
            .fail(fl => {
                $("#message-box").removeClass("hidden");
                $("#message").text(fl.responseJSON.Message);
                console.log(fl.responseJSON);
            })
    }
}
$('#remember').click(function () {
    let val = input.val() === "true" ? false : true;
    let span = $('#remember').find('span');
    if (val) {
        span.removeClass('glyphicon-unchecked');
        span.addClass('glyphicon-ok')
    } else {
        span.addClass('glyphicon-unchecked');
        span.removeClass('glyphicon-ok')
    }
    input.val(val);
})

function login() {
    $.ajax(gisapi_url + "api/Login", {
            contentType: 'application/json',
            dataType: 'json',
            type: 'POST',
            data: JSON.stringify({
                Username: $("#user-tf").val(),
                Password: $("#pass-tf").val()
            })
        })
        .then(rs => {
            if (rs) {
                localStorage.setItem("login_code", rs);
                localStorage.setItem("username", $("#user-tf").val());
                location.href = '/index.html'
            }
        })
        .fail(fl => {
            $("#message-box").removeClass("hidden");
            $("#message").text(fl.responseJSON.Message);
            console.log(fl.responseJSON);
        })
}
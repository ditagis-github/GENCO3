localStorage.clear();
let input = $('input[name="remember"]');
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
    $.ajax("https://ditagis.com/genco3/api/Login", {
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
                localStorage.setItem("username",$("#user-tf").val())
                console.log(rs);
                location.href = '/index.html'
            }
        })
        .fail(fl => {
            $("#message-box").removeClass("hidden");
            $("#message").text(fl.responseJSON.Message);
            console.log(fl.responseJSON);
        })
}


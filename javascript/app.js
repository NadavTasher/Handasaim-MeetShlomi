function load() {
    hideAll();
    home();
}

function home() {
    hideAll();
    show("home");
    if (getCookie("userId") !== undefined) {
        loadUser(getCookie("userId"), (userinfo) => {

        });
    }
}

function loadUser(userId,callback) {
    let body = new FormData;
    body.append("id", userId);
    fetch("php/userbase.php", {
        method: "POST",
        cache: "no-store",
        headers: {
            'Cache-Control': 'no-cache'
        },
        body: body
    }).then(response => {
        response.text().then((response) => {
            callback(JSON.parse(response));
        });
    });
}


function hideAll() {
    hide("home");
    hide("new");
    hide("about");
}
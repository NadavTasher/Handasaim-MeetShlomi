function load() {
    hideAll();
    home();
}

function home() {
    hideAll();
    show("home");
    if (getCookie("userId") !== undefined) {
        hide("newUser");
        loadUser(getCookie("userId"), (userinfo) => {
            show("homeView");
        });
    }else{
        show("newUser");
        hide("homeView");
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

function createUser() {
    let userinfo={type:get("user-type").value,name:get("user-name").value};
    console.log(userinfo);
    let body = new FormData;
    body.append("id", "0");
    body.append("userinfo", JSON.stringify(userinfo));
    fetch("php/userbase.php", {
        method: "POST",
        cache: "no-store",
        headers: {
            'Cache-Control': 'no-cache'
        },
        body: body
    }).then(response => {
        response.text().then((response) => {
            console.log(response);
        });
    });
}

function hideAll() {
    hide("home");
    hide("new");
    hide("about");
}
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
            echo(userinfo);
        });
    } else {
        show("newUser");
        hide("homeView");
    }
}

function loadUser(userId, callback) {
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
            echo(response);
            callback(JSON.parse(response));
        });
    });
}

function createUser() {
    if (get("user-name").value.length > 0 && get("user-phone").value.length > 0) {
        if (get("user-phone").checkValidity()) {
            let userinfo = {type: get("user-type").value, name: get("user-name").value, phone: get("user-phone").value};
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
                    let parsed=JSON.parse(response);
                    setCookie("userId",parsed.id);
                    setCookie("userSeed",parsed.seed);
                    refresh();
                });
            });
        } else {
            alert("Phone must be valid.");
        }
    } else {
        alert("Phone and Name must be filled.");
    }
}

function dateChanged(){
    let day,month,year;
}

function newMeeting() {
    hideAll();
    show("new");
}

function createMeeting() {

}

function hideAll() {
    hide("home");
    hide("new");
    hide("about");
}
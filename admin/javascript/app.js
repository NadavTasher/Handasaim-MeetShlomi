function load() {
    hideAll();
    if (getCookie("Admin") !== undefined && getCookie("Admin") !== "undefined") {
        home();
    } else {
        login();
    }
}

function home() {
    hideAll();
    hideHome();
    show("home");
    show("menu");
}

function pending() {
    hideAll();
    hideHome();
    show("home");
    show("pending");
    loadPending(getCookie("Admin"), (json) => {
        let pending = get("pending");
        clear(pending);
        let meetings = json.results;
        for (let m=0;m<meetings.length;m++){
            let currentMeeting = meetings[m];
            let meeting = document.createElement("div");
            let bottom = document.createElement("div");
            let choosing=document.createElement("div");
            let title = document.createElement("p");
            let date = document.createElement("p");
            let time = document.createElement("p");
            let approve = document.createElement("img");
            let decline = document.createElement("img");
            meeting.classList.add("meeting");
            title.innerHTML = currentMeeting.content.reason;
            date.innerHTML = (currentMeeting.slot.date.day) + "." + (currentMeeting.slot.date.month);
            let dayMinutes = currentMeeting.slot.slot * json.slot;
            let minutes = dayMinutes % 60;
            let hours = (dayMinutes - minutes) / 60;
            time.innerHTML = hours + ":" + (minutes < 10 ? "0" : "") + minutes;

            approve.src="images/approved.svg";
            decline.src="images/denied.svg";

            choosing.appendChild(approve);
            choosing.appendChild(decline);

            approve.onclick=()=>{
                changeState(currentMeeting.id,"approved",getCookie("Admin"),(json)=>{

                });
            };

            meeting.appendChild(title);
            bottom.appendChild(date);
            bottom.appendChild(time);
            bottom.appendChild(choosing);
            meeting.appendChild(bottom);
            pending.appendChild(meeting);
        }
    });
}

function calendar() {
    hideAll();
    hideHome();
    show("home");
    show("calendar");
}

function login() {
    hideAll();
    show("login");
}

function changeState(id,state,password,callback){
    let body = new FormData;
    body.append("key", password);
    body.append("set", "state");
    body.append("state", state);
    body.append("id", id);
    fetch("php/admin.php", {
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

function submitLogin() {
    let password = get("login-password");
    if (password.value.length > 0) {
        loadLogin(password.value, (json) => {
            if (json.auth) {
                setCookie("Admin", password.value);
            }
            refresh();
        });
    } else {
        alert("Password must be filled");
    }
}

function loadLogin(password, callback) {
    let body = new FormData;
    body.append("key", password);
    fetch("php/admin.php", {
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

function loadPending(password, callback) {
    let body = new FormData;
    body.append("key", password);
    body.append("action", "get");
    body.append("get", "pending");
    fetch("php/admin.php", {
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
    hide("login");
    hide("home");
}

function hideHome() {
    hide("pending");
    hide("calendar");
    hide("menu");
}
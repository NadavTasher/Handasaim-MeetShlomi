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
    loadPending((json) => {
        let pending = get("pending");
        clear(pending);
        let meetings = json.results;
        for (let m = 0; m < meetings.length; m++) {
            let currentMeeting = meetings[m];
            let meeting = document.createElement("div");
            let choosing = document.createElement("div");
            let datetime = document.createElement("p");
            let username = document.createElement("p");
            let typestatusphone = document.createElement("p");
            let reason = document.createElement("p");
            let approve = document.createElement("img");
            let decline = document.createElement("img");
            let minutes = currentMeeting.time.time % 60;
            let hours = (currentMeeting.time.time - minutes) / 60;
            meeting.classList.add("meeting");
            reason.classList.add("meetingContent");
            username.classList.add("meetingContent");
            reason.innerHTML = currentMeeting.content.reason;
            datetime.innerHTML = (currentMeeting.time.date.day + "." + currentMeeting.time.date.month + "." + currentMeeting.time.date.year) + " at " + (hours + ":" + (minutes < 10 ? "0" : "") + minutes);
            approve.src = "images/approved.svg";
            decline.src = "images/denied.svg";
            approve.onclick = () => {
                hideView(meeting);
                changeState(currentMeeting.id, "approved", (json) => {
                });
            };
            decline.onclick = () => {
                hideView(meeting);
                changeState(currentMeeting.id, "denied", (json) => {
                });
            };
            choosing.appendChild(approve);
            choosing.appendChild(decline);
            meeting.appendChild(reason);
            meeting.appendChild(username);
            meeting.appendChild(typestatusphone);
            meeting.appendChild(datetime);
            meeting.appendChild(choosing);
            pending.appendChild(meeting);
            loadUserInfo(currentMeeting.user, (user) => {
                username.innerHTML = user.user.name;
                let phone = document.createElement("a");
                phone.href = "tel:" + user.user.phone;
                phone.innerHTML = user.user.phone;
                typestatusphone.innerHTML = (user.user.type.substring(0, 1).toUpperCase() + user.user.type.substring(1).toLowerCase()) + (user.user.status === "vip" ? " VIP" : "") + ", " + phone.outerHTML;
            });
        }
    });
}

function closed() {
    hideAll();
    hideHome();
    show("home");
    show("closed");
    loadClosableMonths();
    closeMonthChanged();
}

function loadClosableMonths() {
    let months = get("close-month");
    clear(months);

    function getMonthName(month) {
        switch (month) {
            case 0:
                return "Jan";
            case 1:
                return "Feb";
            case 2:
                return "Mar";
            case 3:
                return "Apr";
            case 4:
                return "May";
            case 5:
                return "Jun";
            case 6:
                return "Jul";
            case 7:
                return "Aug";
            case 8:
                return "Sep";
            case 9:
                return "Oct";
            case 10:
                return "Nov";
            case 11:
                return "Dec";
            default:
                return "???";
        }
    }

    function addMonth(month) {
        let year = getYear(month);
        let date = new Date();
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(1);
        let today = new Date(Date.now());
        if (today < date || date.getMonth() === today.getMonth()) {
            let option = document.createElement("option");
            option.value = month;
            option.innerHTML = getMonthName(month);
            months.appendChild(option);
        }
    }

    for (let i = 8; i < 12; i++) {
        addMonth(i);
    }
    for (let i = 0; i < 6; i++) {
        addMonth(i);
    }
}

function closeMonthChanged() {
    let days = get("close-day");
    clear(days);

    let month = parseInt(get("close-month").value, 10);

    function getDayName(day) {
        switch (day) {
            case 0:
                return "Sun";
            case 1:
                return "Mon";
            case 2:
                return "Tue";
            case 3:
                return "Wed";
            case 4:
                return "Thu";
            case 5:
                return "Fri";
            case 6:
                return "Sat";
            default:
                return "???";
        }
    }

    function addDay(month, day) {
        let currentDate = new Date();
        currentDate.setFullYear(getYear(month));
        currentDate.setMonth(month);
        currentDate.setDate(day);
        if (currentDate.getDay() < 5 && currentDate.getMonth() === month && new Date(Date.now()) <= currentDate) {
            let dayName = getDayName(currentDate.getDay());
            let newDay = document.createElement("option");
            newDay.value = day;
            newDay.innerHTML = dayName + " " + day;
            days.appendChild(newDay);
        }
    }


    for (let d = 1; d < 32; d++) {
        addDay(month, d);
    }
}

function closeDate() {
    let date = {
        day: parseInt(get("close-day").value, 10),
        month: parseInt(get("close-month").value, 10) + 1,
        year: getYear(parseInt(get("close-month").value, 10))
    };
    let body = new FormData;
    body.append("key", getCookie("Admin"));
    body.append("action", "set");
    body.append("set", "close");
    body.append("close", JSON.stringify(date));
    fetch("../php/base.php", {
        method: "POST",
        cache: "no-store",
        headers: {
            'Cache-Control': 'no-cache'
        },
        body: body
    }).then(response => {
        response.text().then((response) => {
            let result = JSON.parse(response);
            if (result.closed !== undefined) {
                if (result.closed) {
                    alert("Closed Day");
                }
            }
        });
    });
}

function calendar() {
    hideAll();
    hideHome();
    show("home");
    show("calendar");
    addDates();
}

function addDates() {
    loadDates((json) => {
        let today = new Date(Date.now());
        today.setHours(0, 0, 0, 0);
        let day = get("day");
        clear(day);
        let dates = [];
        let jsonDates = json.results;
        for (let d = 0; d < jsonDates.length; d++) {
            let currentDate = jsonDates[d];
            let date = new Date();
            date.setFullYear(currentDate.year);
            date.setMonth(currentDate.month - 1);
            date.setDate(currentDate.day);
            date.setHours(0, 0, 0, 0);
            if (date >= today) {
                dates.push(date);
            }
        }
        dates = bubblesort(dates);
        for (let q = 0; q < dates.length; q++) {
            let option = document.createElement("option");
            let date = {day: dates[q].getDate(), month: dates[q].getMonth() + 1, year: dates[q].getFullYear()};
            option.value = JSON.stringify(date);
            option.innerHTML = getDayName(dates[q].getDay()) + ", " + getMonthName(dates[q].getMonth()) + " " + dates[q].getDate() + ", " + dates[q].getFullYear();
            day.appendChild(option);
        }
        dayChanged();
    });
}

function dayChanged() {
    let day = get("day");
    let queue = get("queue");
    clear(queue);
    loadMeetings(JSON.parse(day.value), (json) => {
        let meetings = json.results;
        echo(meetings);
        for (let m = 0; m < meetings.length; m++) {
            let currentMeeting = meetings[m];
            let meeting = document.createElement("div");
            let datetime = document.createElement("p");
            let username = document.createElement("p");
            let typestatusphone = document.createElement("p");
            let reason = document.createElement("p");
            let minutes = currentMeeting.time.time % 60;
            let hours = (currentMeeting.time.time - minutes) / 60;
            meeting.classList.add("meeting");
            reason.classList.add("meetingContent");
            username.classList.add("meetingContent");
            reason.innerHTML = currentMeeting.content.reason;
            datetime.innerHTML = (currentMeeting.time.date.day + "." + currentMeeting.time.date.month + "." + currentMeeting.time.date.year) + " at " + (hours + ":" + (minutes < 10 ? "0" : "") + minutes);
            meeting.appendChild(reason);
            meeting.appendChild(username);
            meeting.appendChild(typestatusphone);
            meeting.appendChild(datetime);
            queue.appendChild(meeting);
            if (currentMeeting.user !== 0) {
                loadUserInfo(currentMeeting.user, (user) => {
                    username.innerHTML = user.user.name;
                    let phone = document.createElement("a");
                    phone.href = "tel:" + user.user.phone;
                    phone.innerHTML = user.user.phone;
                    typestatusphone.innerHTML = (user.user.type.substring(0, 1).toUpperCase() + user.user.type.substring(1).toLowerCase()) + (user.user.status === "vip" ? " VIP" : "") + ", " + phone.outerHTML;
                });
            }
        }
    });
}

function getDayName(day) {
    switch (day) {
        case 0:
            return "Sun";
        case 1:
            return "Mon";
        case 2:
            return "Tue";
        case 3:
            return "Wed";
        case 4:
            return "Thu";
        case 5:
            return "Fri";
        case 6:
            return "Sat";
        default:
            return "???";
    }
}

function getMonthName(month) {
    switch (month) {
        case 0:
            return "Jan";
        case 1:
            return "Feb";
        case 2:
            return "Mar";
        case 3:
            return "Apr";
        case 4:
            return "May";
        case 5:
            return "Jun";
        case 6:
            return "Jul";
        case 7:
            return "Aug";
        case 8:
            return "Sep";
        case 9:
            return "Oct";
        case 10:
            return "Nov";
        case 11:
            return "Dec";
        default:
            return "???";
    }
}

function bubblesort(dates) {
    function sort(d){
        let tempDates=d;
        if(tempDates.length>1) {
            for (let index = 1; index < tempDates.length; index++) {
                let previous=tempDates[index-1];
                let current=tempDates[index];
                if(previous>current){
                    tempDates[index]=previous;
                    tempDates[index-1]=current;
                }
            }
        }
        return tempDates;
    }

    let n=dates;
    while(n.toString()!==sort(n).toString()){
        n=sort(n);
    }
    return n;
}

function login() {
    hideAll();
    show("login");
}

function changeState(id, state, callback) {
    let body = new FormData;
    body.append("key", getCookie("Admin"));
    body.append("action", "set");
    body.append("set", "state");
    body.append("state", state);
    body.append("id", id);
    fetch("../php/base.php", {
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
    fetch("../php/base.php", {
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

function loadUserInfo(id, callback) {
    let body = new FormData;
    body.append("id", id);
    fetch("../php/base.php", {
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

function loadPending(callback) {
    let body = new FormData;
    body.append("key", getCookie("Admin"));
    body.append("action", "get");
    body.append("get", "pending");
    fetch("../php/base.php", {
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

function loadDates(callback) {
    let body = new FormData;
    body.append("key", getCookie("Admin"));
    body.append("action", "get");
    body.append("get", "dates");
    fetch("../php/base.php", {
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

function loadMeetings(date, callback) {
    let body = new FormData;
    body.append("key", getCookie("Admin"));
    body.append("action", "get");
    body.append("get", "date");
    body.append("date", JSON.stringify(date));
    fetch("../php/base.php", {
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
    hide("closed");
    hide("pending");
    hide("calendar");
    hide("menu");
}
const year = 2018;

function hideAll() {
    hide("home");
    hide("new");
    hide("about");
}

function load() {
    hideAll();
    home();
}

function home() {
    hideAll();
    show("home");
    if (getCookie("UserID") !== undefined && getCookie("UserID") !== "undefined") {
        hide("newUser");
        loadUser(getCookie("UserID"), (userinfo) => {
            show("homeView");
            let queue = get("queue");
            clear(queue);
            let meetings = userinfo.user.meetings;
            for (let m = 0; m < meetings.length; m++) {
                let currentMeeting = meetings[m];
                let meeting = document.createElement("div");
                let bottom = document.createElement("div");
                let reason = document.createElement("p");
                let datetime = document.createElement("p");
                let state = document.createElement("img");
                meeting.classList.add("meeting");
                reason.classList.add("meetingContent");
                reason.innerHTML = currentMeeting.content.reason;
                let minutes = currentMeeting.time.time % 60;
                let hours = (currentMeeting.time.time - minutes) / 60;
                datetime.innerHTML = (currentMeeting.time.date.day + "." + currentMeeting.time.date.month + "." + currentMeeting.time.date.year) + " at " + (hours + ":" + (minutes < 10 ? "0" : "") + minutes);
                if (currentMeeting.state === "pending") {
                    state.src = "images/pending.svg";
                } else if (currentMeeting.state === "approved") {
                    state.src = "images/approved.svg";
                } else {
                    state.src = "images/denied.svg";
                }
                meeting.appendChild(reason);
                bottom.appendChild(datetime);
                bottom.appendChild(state);
                meeting.appendChild(bottom);
                queue.appendChild(meeting);
            }
        });
    } else {
        show("newUser");
        hide("homeView");
    }
}

function meeting() {
    hideAll();
    show("new");
    loadMonths();
    monthChanged();
}

function about() {
    hideAll();
    show("about");
}

function loadUser(UserID, callback) {
    let body = new FormData;
    body.append("id", UserID);
    fetch("php/base.php", {
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

function loadOpenTimes(date, callback) {
    let body = new FormData;
    body.append("date", JSON.stringify(date));
    fetch("php/base.php", {
        method: "POST",
        cache: "no-store",
        headers: {
            'Cache-Control': 'no-cache'
        },
        body: body
    }).then(response => {
        response.text().then((response) => {
            callback(JSON.parse(response).times);
        });
    });
}

function createMeeting() {
    let reason = get("new-reason").value;
    if (reason.length > 0) {
        let data = {
            content: {
                reason: reason
            },
            time: {
                time: parseInt(get("new-time").value, 10),
                date: getDate()
            }
        };
        let body = new FormData;
        body.append("id", getCookie("UserID"));
        body.append("seed", getCookie("UserSeed"));
        body.append("data", JSON.stringify(data));
        fetch("php/base.php", {
            method: "POST",
            cache: "no-store",
            headers: {
                'Cache-Control': 'no-cache'
            },
            body: body
        }).then(response => {
            response.text().then((response) => {
                let parsed = JSON.parse(response);
                if (parsed.meeting.created) {
                    refresh();
                } else {
                    alert("Could not create meeting...");
                }
            });
        });
    } else {
        alert("Reason must be filled");
    }
}

function createUser() {
    if (get("user-name").value.length > 0 && get("user-phone").value.length > 0) {
        if (get("user-phone").checkValidity()) {
            let data = {type: get("user-type").value, name: get("user-name").value, phone: get("user-phone").value};
            let body = new FormData;
            body.append("id", "0");
            body.append("data", JSON.stringify(data));
            fetch("php/base.php", {
                method: "POST",
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-cache'
                },
                body: body
            }).then(response => {
                response.text().then((response) => {
                    let parsed = JSON.parse(response).user;
                    setCookie("UserID", parsed.id);
                    setCookie("UserSeed", parsed.seed);
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

function monthChanged() {
    loadDays(parseInt(get("new-month").value, 10));
    dayChanged();
}

function dayChanged() {
    loadOpenTimes(getDate(), (base) => {
        let timeSelect = get("new-time");
        clear(timeSelect);
        let times = base.times;
        for (let s = 0; s < times.length; s++) {
            let timeMinutes = times[s];
            let minutes = timeMinutes % 60;
            let hours = (timeMinutes - minutes) / 60;
            let option = document.createElement("option");
            option.value = times[s];
            option.innerHTML = hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            timeSelect.appendChild(option);
        }
    });
}

function loadDays(month) {
    let days = get("new-day");
    clear(days);

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

function loadMonths() {
    let months = get("new-month");
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

function getDate() {
    return {
        day: parseInt(get("new-day").value, 10),
        month: parseInt(get("new-month").value, 10) + 1,
        year: getYear(parseInt(get("new-month").value, 10))
    };
}

function getYear(month) {
    return (month < 8) ? year + 1 : year;
}





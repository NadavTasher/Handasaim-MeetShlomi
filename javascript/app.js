const year = 2018;

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
                    let parsed = JSON.parse(response);
                    setCookie("userId", parsed.id);
                    setCookie("userSeed", parsed.seed);
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
    let day = get("new-day"), month = get("new-month");
    let dayValue = day.value;
    addDays(parseInt(month.value,10));
    day.value = dayValue;
}

function dayChanged() {
    loadOpenSlots(getDate(), (base) => {
        let time = get("new-time");
        clear(time);
        let slot = base.slot;
        let slots = base.slots;
        for (let s = 0; s < slots.length; s++) {
            let slotMinutes = slots[s] * slot;
            let minutes = slotMinutes % 60;
            let hours = (slotMinutes - minutes) / 60;
            let option = document.createElement("option");
            option.value = slots[s];
            option.innerHTML = hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            time.appendChild(option);
        }
    });
}

function getDate() {
    return {
        day: parseInt(get("new-day").value, 10),
        month: parseInt(get("new-month").value, 10) + 1,
        year: getYear(parseInt(get("new-month").value, 10))
    };
}

function loadOpenSlots(date, callback) {
    let body = new FormData;
    body.append("date", JSON.stringify(date));
    fetch("php/schedulebase.php", {
        method: "POST",
        cache: "no-store",
        headers: {
            'Cache-Control': 'no-cache'
        },
        body: body
    }).then(response => {
        response.text().then((response) => {
            callback(JSON.parse(response).slots);
        });
    });
}

function addDays(month) {
    let day = get("new-day");
    clear(day);
    for (let d = 1; d <= 31; d++) {
        let currentDate = new Date();
        currentDate.setFullYear(getYear(month));
        currentDate.setMonth(month);
        currentDate.setDate(d);
        if (currentDate.getDay() < 5 && currentDate.getMonth() === month) {
            let dayName = getDayName(currentDate.getDay());
            let newDay = document.createElement("option");
            newDay.value = d;
            newDay.innerHTML = dayName + " " + d;
            day.appendChild(newDay);
        }
    }
}

function getYear(month) {
    return (month < 8) ? year + 1 : year;
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

function newMeeting() {
    hideAll();
    show("new");
    monthChanged();
}

function createMeeting() {

}

function hideAll() {
    hide("home");
    hide("new");
    hide("about");
}
function setCookie(cname, cvalue) {
    cvalue = encodeURIComponent(cvalue);
    const exdays = 365;
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";domain=" + window.location.hostname + ";path=/";
}

function getCookie(cname) {
    const name = cname + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return decodeURIComponent(c.substring(name.length, c.length));
        }
    }
    return undefined;
}

function echo(v) {
    console.log(v);
}

function refresh() {
    document.location.reload(true);
}
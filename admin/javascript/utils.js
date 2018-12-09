function hideView(view) {
    view.style.display = "none";
}

function showView(view) {
    view.style.removeProperty("display");
}

function hide(id) {
    get(id).style.display = "none";
}

function show(id) {
    get(id).style.removeProperty("display");
}

function get(id) {
    return document.getElementById(id);
}

function clear(view) {
    while (view.firstChild) {
        view.removeChild(view.firstChild);
    }
}

function title(title) {
    document.title = title;
}

function theme(color) {
    let meta = document.getElementsByTagName("meta")["theme-color"];
    if (meta !== undefined) {
        meta.content = color;
    } else {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        meta.content = color;
        document.head.appendChild(meta);
    }

}
function toggle() {
    var x = document.querySelector("#menubar");
    var y = document.querySelector("#sitenav");
    if (x.classList.contains("collapsed")) {
        x.classList.remove("collapsed");
        y.classList.remove("collapsed");
    } else {
        y.classList.add("collapsed");
        x.classList.add("collapsed");
    }
} 
function toggle() {
    var x = document.querySelector("#menubar");
    var y = document.querySelector("#hambbtn");
    if (x.classList.contains("responsive")) {
        x.classList.remove("responsive");
        y.classList.remove("respons");
    } else {
        y.classList.add("respons");
        x.classList.add("responsive");
    }
} 
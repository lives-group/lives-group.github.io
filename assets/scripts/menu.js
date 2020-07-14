// dark mode
//document.documentElement.setAttribute('data-theme', 'dark');
//var cog = document.getElementsByClassName("mush");
//var i;
//for (i = 0; i < cog.length; i++) {
//    cog[i].src="/assets/icons/mushroom-dark-mode.svg";
//}
// end dark mode

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

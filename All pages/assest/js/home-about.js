let btn = document.getElementById("btn");
window.onscroll = function () {
  if (!btn) return;
  if (scrollY > 700) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};
if (btn) {
  btn.addEventListener("click", () => {
    scroll({ top: 0, left: 0, behavior: "smooth" });
  });
}

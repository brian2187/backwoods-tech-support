(function () {
  const need = document.documentElement.getAttribute("data-shop");
  if (!need) return;
  let s = null;
  try {
    s = JSON.parse(sessionStorage.getItem("aibiz") || "null");
  } catch (e) {
    s = null;
  }
  if (!s || s.user !== need) {
    const here = location.pathname.split("/").pop() || "index.html";
    location.replace("login.html?next=" + encodeURIComponent(here));
  }
  window.aibizLogout = function () {
    sessionStorage.removeItem("aibiz");
    location.href = "login.html";
  };
})();

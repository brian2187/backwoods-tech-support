(function () {
  const chips = document.getElementById("area-chips");
  const feed = document.getElementById("journal-feed");
  const status = document.getElementById("journal-status");
  if (!chips || !feed) return;

  function apply(area) {
    chips.querySelectorAll(".dir-chip").forEach((b) => {
      b.classList.toggle("on", (b.getAttribute("data-area") || "") === area);
    });
    let shown = 0;
    feed.querySelectorAll(".journal-item").forEach((el) => {
      const mine = (el.getAttribute("data-areas") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const hide = !!(area && mine.length && mine.indexOf(area) < 0);
      el.hidden = hide;
      if (!hide) shown += 1;
    });
    if (status) {
      if (area) {
        status.hidden = false;
        status.textContent =
          shown === 1 ? "1 item in " + area + "." : shown + " items in " + area + ".";
      } else {
        status.hidden = true;
        status.textContent = "";
      }
    }
  }

  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-area]");
    if (!btn) return;
    apply(btn.getAttribute("data-area") || "");
  });
})();

(function () {
  const chips = document.getElementById("area-chips");
  const feed = document.getElementById("journal-feed");
  const whispers = document.getElementById("whispers-list");
  const status = document.getElementById("journal-status");
  const emptyW = document.getElementById("whispers-empty");
  const qEl = document.getElementById("journal-q");
  if (!chips || !feed) return;

  let area = "";

  function query() {
    return qEl && qEl.value ? String(qEl.value).trim().toLowerCase() : "";
  }

  function match(el, q, areaName) {
    const mine = (el.getAttribute("data-areas") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const hideArea = !!(areaName && mine.length && mine.indexOf(areaName) < 0);
    const hideQ = !!(q && (el.textContent || "").toLowerCase().indexOf(q) < 0);
    return !(hideArea || hideQ);
  }

  function apply() {
    const q = query();
    chips.querySelectorAll(".dir-chip").forEach((b) => {
      b.classList.toggle("on", (b.getAttribute("data-area") || "") === area);
    });
    let notes = 0;
    feed.querySelectorAll(".journal-item").forEach((el) => {
      const ok = match(el, q, area);
      el.hidden = !ok;
      if (ok) notes += 1;
    });
    let wisps = 0;
    if (whispers) {
      whispers.querySelectorAll(".whisper").forEach((el) => {
        const ok = match(el, q, area);
        el.hidden = !ok;
        if (ok) wisps += 1;
      });
    }
    if (emptyW) emptyW.hidden = wisps > 0;
    if (status) {
      const bits = [];
      bits.push(notes === 1 ? "1 note" : notes + " notes");
      bits.push(wisps === 1 ? "1 whisper" : wisps + " whispers");
      if (area) bits.push("in " + area);
      if (q) bits.push('matching “' + q + "”");
      if (area || q) {
        status.hidden = false;
        status.textContent = bits.join(" · ") + ".";
      } else {
        status.hidden = true;
        status.textContent = "";
      }
    }
  }

  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-area]");
    if (!btn) return;
    area = btn.getAttribute("data-area") || "";
    apply();
  });
  if (qEl) {
    qEl.addEventListener("input", apply);
    qEl.addEventListener("search", apply);
  }
})();

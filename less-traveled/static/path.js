(function () {
  const KEY = {
    uses: "lt-uses",
    budget: "lt-budget",
    acres: "lt-acres",
    musts: "lt-musts",
    place: "lt-place",
    done: "lt-done-steps",
    answers: "lt-answers",
  };

  const STATIC = /\.html$/i.test((location.pathname.split("/").pop() || ""));
  const CHOICE = { yes: "Yes", no: "No", unsure: "Not sure yet" };
  const LIVING_ASK = {
    income: "Will the income you are bringing buy a ~$650k county, plus well, septic, and a winter cushion?",
    winter: "Are you ready for 60–70 inches in town, and a mountain that is another climate?",
    health: "Have you checked healthcare — Bonner General, then Spokane or CDA — before you need it?",
  };

  function read(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  }

  function homestead() {
    const el = document.getElementById("homestead-data");
    if (!el) return null;
    try {
      return JSON.parse(el.textContent || "{}");
    } catch (e) {
      return null;
    }
  }

  function stepUrl(sid, place) {
    place = place || "";
    if (STATIC) {
      if (sid === "intent") return "land-needs.html";
      if (sid === "country") return "land-match.html";
      if (sid === "summary") return "land-summary.html";
      if (sid === "start" || sid === "living") return "land.html";
      if (place) return "land-step-" + sid + "-" + place + ".html";
      return "land-step-" + sid + ".html";
    }
    if (sid === "intent") return "/land/needs";
    if (sid === "country") return "/land/match";
    if (sid === "summary") return "/land/summary";
    if (sid === "start" || sid === "living") return "/land";
    return "/land/step/" + sid + (place ? "?place=" + encodeURIComponent(place) : "");
  }

  function persistForm(form) {
    if (!form) return;
    const u = [...form.querySelectorAll('input[name="use"]:checked')].map((el) => el.value);
    const m = [...form.querySelectorAll('input[name="must"]:checked')].map((el) => el.value);
    write(KEY.uses, u);
    write(KEY.musts, m);
    write(KEY.budget, (form.querySelector('select[name="budget"]') || {}).value || "");
    write(KEY.acres, (form.querySelector('select[name="acres"]') || {}).value || "");
  }

  const form = document.getElementById("loadout-form");
  if (form) {
    const uses = read(KEY.uses, []);
    const musts = read(KEY.musts, []);
    form.querySelectorAll('input[name="use"]').forEach((el) => {
      el.checked = uses.indexOf(el.value) >= 0;
    });
    form.querySelectorAll('input[name="must"]').forEach((el) => {
      el.checked = musts.indexOf(el.value) >= 0;
    });
    const b = form.querySelector('select[name="budget"]');
    const a = form.querySelector('select[name="acres"]');
    if (b) b.value = read(KEY.budget, "") || "";
    if (a) a.value = read(KEY.acres, "") || "";
    form.addEventListener("change", function () {
      persistForm(form);
    });
    form.addEventListener("submit", function (ev) {
      persistForm(form);
      const next = (document.getElementById("save-plan") || {}).getAttribute("data-next");
      if (next) {
        ev.preventDefault();
        const done = read(KEY.done, []);
        if (done.indexOf("intent") < 0) done.push("intent");
        write(KEY.done, done);
        location.href = STATIC ? "land-step-water.html" : "/land/step/water";
      }
    });
  }

  if (/land-match\.html$/i.test(location.pathname) && !location.search) {
    const uses = read(KEY.uses, []);
    const budget = read(KEY.budget, "");
    const acres = read(KEY.acres, "");
    const musts = read(KEY.musts, []);
    if (uses.length || budget || acres || musts.length) {
      const p = new URLSearchParams();
      uses.forEach((u) => p.append("use", u));
      musts.forEach((m) => p.append("must", m));
      if (budget) p.set("budget", budget);
      if (acres) p.set("acres", acres);
      location.replace("land-match.html?" + p.toString());
      return;
    }
  }

  const answers = read(KEY.answers, {});
  document.querySelectorAll(".quest-tasks[data-step]").forEach((ul) => {
    const sid = ul.getAttribute("data-step");
    const bag = answers[sid] || {};
    ul.querySelectorAll("input[data-task]").forEach((inp) => {
      const tid = inp.getAttribute("data-task");
      if (bag[tid] && inp.value === bag[tid]) inp.checked = true;
      inp.addEventListener("change", function () {
        if (!inp.checked) return;
        const all = read(KEY.answers, {});
        all[sid] = all[sid] || {};
        all[sid][tid] = inp.value;
        write(KEY.answers, all);
        paintPreview();
      });
    });
  });

  function usesMatch(when) {
    const need = (when || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!need.length) return true;
    const uses = read(KEY.uses, []);
    if (!uses.length) return true;
    return need.some((u) => uses.indexOf(u) >= 0);
  }

  document.querySelectorAll(".path-stop[data-when-uses]").forEach((n) => {
    if (!usesMatch(n.getAttribute("data-when-uses"))) {
      n.classList.add("is-skip");
      n.hidden = true;
    }
  });

  const ORDER = [
    "living", "intent", "water", "septic", "access", "zoning", "power",
    "soil", "livestock", "fire", "winter", "country", "permits", "summary",
  ];

  function nextVisible(fromId) {
    let i = ORDER.indexOf(fromId);
    if (i < 0) i = -1;
    for (let k = i + 1; k < ORDER.length; k++) {
      const sid = ORDER[k];
      const stop = document.querySelector('.path-stop[data-step="' + sid + '"]');
      if (stop && stop.hidden) continue;
      return sid;
    }
    return "summary";
  }

  const preview = document.getElementById("loadout-list");
  const empty = document.getElementById("loadout-empty");
  const chip = document.getElementById("plan-chip");
  const progress = document.getElementById("sheet-progress");

  function paintPreview() {
    const uses = read(KEY.uses, []);
    const budget = read(KEY.budget, "");
    const acres = read(KEY.acres, "");
    const place = read(KEY.place, "");
    const ans = read(KEY.answers, {});
    const bits = [];
    if (uses.length) bits.push("Uses: " + uses.join(", "));
    if (budget) bits.push("Budget " + budget);
    if (acres) bits.push("Acres " + acres);
    if (place) bits.push("Type " + place);
    let yes = 0;
    let no = 0;
    let open = 0;
    Object.keys(ans).forEach((sid) => {
      Object.keys(ans[sid] || {}).forEach((tid) => {
        const v = ans[sid][tid];
        if (v === "yes") yes += 1;
        else if (v === "no") no += 1;
        else open += 1;
      });
    });
    if (preview) {
      preview.innerHTML = "";
      if (bits.length || yes || no || open) {
        preview.hidden = false;
        if (empty) empty.hidden = true;
        bits.forEach((t) => {
          const li = document.createElement("li");
          li.textContent = t;
          preview.appendChild(li);
        });
      } else {
        preview.hidden = true;
        if (empty) empty.hidden = false;
      }
    }
    if (chip) {
      if (bits.length) {
        chip.hidden = false;
        chip.textContent = "Plan: " + bits.join(" · ");
      } else {
        chip.hidden = true;
      }
    }
    if (progress) {
      const n = yes + no + open;
      if (n) {
        progress.hidden = false;
        progress.textContent = n + " answers · " + open + " still open · " + yes + " yes · " + no + " no";
      } else {
        progress.hidden = true;
      }
    }
  }
  paintPreview();

  const begin = document.getElementById("begin-place");
  if (begin && begin.getAttribute("data-place")) {
    write(KEY.place, begin.getAttribute("data-place"));
  }

  const params = new URLSearchParams(location.search);
  const placeQ = params.get("place") || read(KEY.place, "");
  if (placeQ) write(KEY.place, placeQ);

  document.querySelectorAll('a[href^="land-step-"]').forEach((a) => {
    const saved = read(KEY.place, "");
    if (!saved) return;
    const href = a.getAttribute("href") || "";
    if (href.indexOf("land-step-") !== 0) return;
    const m = href.match(/^land-step-([^.]+)\.html(.*)$/);
    if (!m) return;
    const sid = m[1];
    if (sid.indexOf(saved) >= 0) return;
    a.setAttribute("href", "land-step-" + sid + "-" + saved + ".html" + m[2]);
  });

  const done = read(KEY.done, []);
  const nodes = [...document.querySelectorAll(".path-stop[data-step], .quest-node[data-step]")];
  nodes.forEach((n) => {
    const id = n.getAttribute("data-step");
    if (done.indexOf(id) >= 0) n.classList.add("is-done");
  });

  const cont = document.getElementById("continue-step");
  if (cont) {
    cont.addEventListener("click", function (ev) {
      const id = cont.getAttribute("data-step");
      if (id) {
        const list = read(KEY.done, []);
        if (list.indexOf(id) < 0) list.push(id);
        write(KEY.done, list);
      }
      const requested = cont.getAttribute("data-next");
      if (!requested) return;
      const nxt = nextVisible(id || requested);
      if (nxt && nxt !== requested) {
        ev.preventDefault();
        location.href = stepUrl(nxt, read(KEY.place, ""));
      }
    });
  }

  function renderSheet() {
    const host = document.getElementById("sheet-body");
    const vacant = document.getElementById("sheet-empty");
    if (!host) return;
    const hs = homestead() || {};
    const uses = read(KEY.uses, []);
    const budget = read(KEY.budget, "");
    const acres = read(KEY.acres, "");
    const musts = read(KEY.musts, []);
    const place = read(KEY.place, "");
    const ans = read(KEY.answers, {});
    const useLabels = {};
    (hs.uses || []).forEach((u) => { useLabels[u.id] = u.label; });
    const budLabel = ((hs.budgets || []).find((b) => b.id === budget) || {}).label || budget;
    const acrLabel = ((hs.acres || []).find((a) => a.id === acres) || {}).label || acres;
    const mustLabels = {};
    (hs.musts || []).forEach((m) => { mustLabels[m.id] = m.label; });

    const parts = [];
    const planBits = [];
    if (uses.length) planBits.push(uses.map((u) => useLabels[u] || u).join(", "));
    if (budLabel) planBits.push(budLabel);
    if (acrLabel) planBits.push(acrLabel);
    if (musts.length) planBits.push("Must have: " + musts.map((m) => mustLabels[m] || m).join(", "));
    if (place) planBits.push("Type: " + place);
    if (planBits.length) {
      parts.push("<h3>Your plan</h3><ul>" + planBits.map((t) => "<li>" + t + "</li>").join("") + "</ul>");
    }

    const living = ans.living || {};
    if (Object.keys(living).length) {
      parts.push("<h3>Living here</h3><ul>");
      Object.keys(LIVING_ASK).forEach((tid) => {
        if (!living[tid]) return;
        parts.push("<li>" + LIVING_ASK[tid] + " — <strong>" + (CHOICE[living[tid]] || living[tid]) + "</strong></li>");
      });
      parts.push("</ul>");
    }

    const open = [];
    const done = read(KEY.done, []);
    (hs.steps || []).forEach((step) => {
      if (step.id === "intent" || step.id === "country" || step.id === "summary") return;
      if (step.when_uses && uses.length && !step.when_uses.some((u) => uses.indexOf(u) >= 0)) return;
      const bag = ans[step.id] || {};
      const tasks = step.tasks || [];
      if (!tasks.length) return;
      const visited = done.indexOf(step.id) >= 0 || Object.keys(bag).length > 0;
      if (!visited) return;
      parts.push("<h3>" + step.title + "</h3><ul>");
      tasks.forEach((t) => {
        const v = bag[t.id];
        if (!v) {
          open.push(t.text);
          parts.push("<li>" + t.text + " — <strong>Not answered</strong></li>");
        } else {
          if (v === "unsure" || v === "no") open.push(t.text);
          parts.push("<li>" + t.text + " — <strong>" + (CHOICE[v] || v) + "</strong></li>");
        }
      });
      parts.push("</ul>");
    });

    if (open.length) {
      parts.push("<h3>Still to figure out</h3><ul>");
      open.forEach((t) => parts.push("<li>" + t + "</li>"));
      parts.push("</ul>");
    }

    if (!parts.length) return;
    host.innerHTML = parts.join("");
    host.hidden = false;
    if (vacant) vacant.hidden = true;
  }
  renderSheet();
})();

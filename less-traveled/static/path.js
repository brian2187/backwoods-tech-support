(function () {
  const KEY = {
    uses: "lt-uses",
    budget: "lt-budget",
    acres: "lt-acres",
    musts: "lt-musts",
    place: "lt-place",
    done: "lt-done-steps",
    tasks: "lt-tasks",
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
        location.href = next;
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

  const preview = document.getElementById("loadout-list");
  const empty = document.getElementById("loadout-empty");
  const chip = document.getElementById("plan-chip");
  const uses = read(KEY.uses, []);
  const budget = read(KEY.budget, "");
  const acres = read(KEY.acres, "");
  const place = read(KEY.place, "");
  const bits = [];
  if (uses.length) bits.push(uses.join(", "));
  if (budget) bits.push("budget " + budget);
  if (acres) bits.push("acres " + acres);
  if (place) bits.push("type " + place);
  if (preview && (uses.length || budget || acres || place)) {
    preview.hidden = false;
    if (empty) empty.hidden = true;
    bits.forEach((t) => {
      const li = document.createElement("li");
      li.textContent = t;
      preview.appendChild(li);
    });
  }
  if (chip && bits.length) {
    chip.hidden = false;
    chip.textContent = "Saved: " + bits.join(" · ");
  }

  const begin = document.getElementById("begin-place");
  if (begin && begin.getAttribute("data-place")) {
    write(KEY.place, begin.getAttribute("data-place"));
  }

  const params = new URLSearchParams(location.search);
  const placeQ = params.get("place") || place;
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

  const tasks = read(KEY.tasks, {});
  document.querySelectorAll(".quest-tasks[data-step]").forEach((ul) => {
    const sid = ul.getAttribute("data-step");
    const bag = tasks[sid] || {};
    ul.querySelectorAll("input[data-task]").forEach((inp) => {
      inp.checked = !!bag[inp.getAttribute("data-task")];
      inp.addEventListener("change", function () {
        const all = read(KEY.tasks, {});
        all[sid] = all[sid] || {};
        all[sid][inp.getAttribute("data-task")] = inp.checked;
        write(KEY.tasks, all);
      });
    });
  });

  const cont = document.getElementById("continue-step");
  if (cont) {
    cont.addEventListener("click", function () {
      const id = cont.getAttribute("data-step");
      if (!id) return;
      const list = read(KEY.done, []);
      if (list.indexOf(id) < 0) list.push(id);
      write(KEY.done, list);
    });
  }
})();

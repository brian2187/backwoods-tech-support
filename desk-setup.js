(function () {
  const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const DAY_LABEL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
  const TZ = "America/Los_Angeles";
  const START_MIN = 6 * 60;
  const END_MIN = 20 * 60;
  const SPAN = END_MIN - START_MIN;

  const weekday = (open, close) => ({ on: true, start: open, end: close });
  const closed = () => ({ on: false, start: "07:00", end: "16:00" });

  const PRESETS = {
    andy: {
      shopName: "Andy The Handyman LLC",
      greetAs: "Andy The Handyman",
      owner: "Andy Barnes",
      ringPhone: "208-920-3269",
      notifyEmail: "andythehandyman@protonmail.com",
      notifySms: "208-920-3269",
      area: "Sandpoint, Bonner & Boundary County, Bonners Ferry",
      services: [
        "General repair",
        "Plumbing",
        "Custom remodels",
        "Decks",
        "Small-scale construction",
        "Concrete",
        "Siding",
        "Flooring",
        "Roofing",
        "Finish carpentry",
        "Windows & doors",
        "Insulation"
      ],
      hoursNote: "From the public site: Mon–Fri 7am–4pm, all else by appointment. Appointment / after-hours goes to the desk.",
      hours: {
        mon: weekday("07:00", "16:00"),
        tue: weekday("07:00", "16:00"),
        wed: weekday("07:00", "16:00"),
        thu: weekday("07:00", "16:00"),
        fri: weekday("07:00", "16:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No final quotes, no payment, no contracts, no arrival times Andy has not approved."
    },
    sherman: {
      shopName: "Professional Handyman Sandpoint",
      greetAs: "Professional Handyman Sandpoint",
      owner: "Doug & Melanie Sherman",
      ringPhone: "208-304-2062",
      notifyEmail: "prohandymansandpoint@gmail.com",
      notifySms: "208-304-2062",
      area: "Sandpoint, Idaho",
      services: ["Spa / hot tub / pool / sauna", "Vacation-home maintenance", "Punch lists", "Home repair"],
      hoursNote: "Hours are not on the public site. Set them day by day. Until you do, the desk treats every call as after hours.",
      hours: {
        mon: closed(),
        tue: closed(),
        wed: closed(),
        thu: closed(),
        fri: closed(),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No chemical advice, no quoting $275 / $175 / $95+parts, no payment, no arrival windows you have not approved."
    },
    case: {
      shopName: "Case Handyman & Property Maintenance",
      greetAs: "Case Handyman & Property Maintenance",
      owner: "",
      ringPhone: "208-304-3883",
      notifyEmail: "",
      notifySms: "208-304-3883",
      area: "Sagle / Sagle Creek Road, Bonner County",
      services: ["Plumbing", "Yard / property", "General home maintenance"],
      hoursNote: "No public hours found. Set them here. Senior / referral / 10% first-project: the desk notes it; you confirm.",
      hours: {
        mon: closed(),
        tue: closed(),
        wed: closed(),
        thu: closed(),
        fri: closed(),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no applying discounts, no payment, no arrival times you have not approved."
    }
  };

  function times() {
    const out = [];
    for (let m = START_MIN; m <= END_MIN; m += 30) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const min = String(m % 60).padStart(2, "0");
      out.push(h + ":" + min);
    }
    return out;
  }
  const TIMES = times();

  function toMin(hhmm) {
    const [h, m] = (hhmm || "07:00").split(":").map(Number);
    return h * 60 + m;
  }

  function ymd(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function mondayOf(d) {
    const x = new Date(d);
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return x;
  }

  const shop = document.documentElement.getAttribute("data-shop");
  const root = document.getElementById("desk-setup");
  if (!shop || !root || !PRESETS[shop]) return;

  const key = "aibiz-desk-" + shop;
  let state;
  try {
    state = JSON.parse(localStorage.getItem(key) || "null");
  } catch (e) {
    state = null;
  }
  if (!state) state = JSON.parse(JSON.stringify(PRESETS[shop]));
  if (!Array.isArray(state.vacation)) state.vacation = [];

  function save() {
    localStorage.setItem(key, JSON.stringify(state));
    const n = root.querySelector("[data-saved]");
    if (n) n.textContent = "Saved on this device. Brian still reviews and confirms before the desk goes live.";
  }

  function field(name, label, value, extra) {
    return (
      '<div' +
      (extra || "") +
      "><label for=\"" +
      name +
      "\">" +
      label +
      "</label><input id=\"" +
      name +
      "\" value=\"" +
      String(value || "").replace(/"/g, "&quot;") +
      "\" /></div>"
    );
  }

  function renderHours() {
    return DAYS.map(function (d) {
      const h = state.hours[d];
      const on = h.on;
      const top = ((Math.max(toMin(h.start), START_MIN) - START_MIN) / SPAN) * 100;
      const bot = ((Math.min(toMin(h.end), END_MIN) - START_MIN) / SPAN) * 100;
      const opts = function (sel) {
        return TIMES.map(function (t) {
          return "<option" + (t === sel ? " selected" : "") + ">" + t + "</option>";
        }).join("");
      };
      return (
        '<div class="day-col' +
        (on ? "" : " closed") +
        '" data-day="' +
        d +
        '"><h4>' +
        DAY_LABEL[d] +
        '<button type="button" data-toggle="' +
        d +
        '">' +
        (on ? "Open" : "Desk") +
        "</button></h4><div class=\"track\" title=\"6am–8pm\">" +
        (on ? '<div class="block" style="top:' + top + "%;height:" + Math.max(bot - top, 4) + '%"></div>' : "") +
        '</div><div class="times"><select data-start="' +
        d +
        '" ' +
        (on ? "" : "disabled") +
        ">" +
        opts(h.start) +
        '</select><select data-end="' +
        d +
        '" ' +
        (on ? "" : "disabled") +
        ">" +
        opts(h.end) +
        "</select></div></div>"
      );
    }).join("");
  }

  function renderMonths() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const blocks = [];
    for (let i = 0; i < 3; i++) {
      const first = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const title = first.toLocaleString("en-US", { month: "long", year: "numeric" });
      const startPad = (first.getDay() + 6) % 7;
      const lastDate = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      let cells = '<span class="wd"></span>';
      ["M", "T", "W", "T", "F", "S", "S"].forEach(function (w) {
        cells += '<span class="wd">' + w + "</span>";
      });
      let dayNum = 1;
      const rows = Math.ceil((startPad + lastDate) / 7);
      for (let r = 0; r < rows; r++) {
        const weekDates = [];
        for (let c = 0; c < 7; c++) {
          const idx = r * 7 + c;
          const date = idx - startPad + 1;
          if (date >= 1 && date <= lastDate) {
            weekDates.push(new Date(first.getFullYear(), first.getMonth(), date));
          }
        }
        const weekKey = weekDates.length ? ymd(mondayOf(weekDates[0])) : "";
        cells += '<button type="button" class="wk" data-week="' + weekKey + '" title="Mark this week vacation">wk</button>';
        for (let c = 0; c < 7; c++) {
          const idx = r * 7 + c;
          const date = idx - startPad + 1;
          if (date < 1 || date > lastDate) {
            cells += '<span class="cell out"></span>';
            continue;
          }
          const dt = new Date(first.getFullYear(), first.getMonth(), date);
          const id = ymd(dt);
          const isVac = state.vacation.indexOf(id) !== -1;
          const isToday = id === ymd(now);
          const isWe = dt.getDay() === 0 || dt.getDay() === 6;
          cells +=
            '<button type="button" class="cell' +
            (isVac ? " vac" : "") +
            (isToday ? " today" : "") +
            (isWe ? " wkend" : "") +
            '" data-date="' +
            id +
            '">' +
            date +
            "</button>";
          dayNum++;
        }
      }
      blocks.push('<div class="month"><h4>' + title + '</h4><div class="mgrid">' + cells + "</div></div>");
    }
    return blocks.join("");
  }

  function paint() {
    const svc = (PRESETS[shop].services || []).concat(state.services || []).filter(function (v, i, a) {
      return a.indexOf(v) === i;
    });
    root.innerHTML =
      '<div class="wrap">' +
      "<h2>Set up the desk</h2>" +
      '<p class="sub">Hours, who we ring, and time off. Prefilled from public listings. Change anything. Saved on this device only until Brian confirms go-live.</p>' +
      '<p class="note">' +
      (state.hoursNote || PRESETS[shop].hoursNote) +
      "</p>" +
      '<div class="desk-grid">' +
      field("shopName", "Shop name", state.shopName) +
      field("greetAs", "Desk answers as", state.greetAs) +
      field("owner", "Owner / who we ping", state.owner) +
      field("ringPhone", "Ring this number during open hours", state.ringPhone) +
      field("notifyEmail", "Notify email", state.notifyEmail) +
      field("notifySms", "Notify text", state.notifySms) +
      field("area", "Service area", state.area, ' class="full"') +
      '<div class="full"><label>Jobs the desk can take</label><div class="chips" id="svc-chips"></div></div>' +
      '<div class="full"><label for="never">The desk will not</label><textarea id="never" rows="3">' +
      (state.never || "") +
      "</textarea></div>" +
      "</div>" +
      "<h3 style=\"margin:28px 0 0;color:var(--pine)\">Hours of operation</h3>" +
      '<p class="note">Green bar is when <em>your phone</em> rings first. Closed days (and any time outside the bar) go to the desk. Times are Pacific.</p>' +
      '<div class="week-cal" id="week-cal"></div>' +
      '<p class="legend"><span><b class="open"></b>You ring first</span><span><b class="off"></b>Desk answers</span><span><b class="vac"></b>Vacation / blocked</span></p>' +
      "<h3 style=\"margin:28px 0 0;color:var(--pine)\">Vacation and days off</h3>" +
      '<p class="note">Click a day to block it. Click <strong>wk</strong> to block that whole week in advance. Blocked days: desk answers, your phone does not ring.</p>' +
      '<div class="months" id="months"></div>' +
      '<div class="save-row"><button class="btn" type="button" id="desk-save">Save setup</button><span class="ok" data-saved></span></div>' +
      "</div>";

    refreshCals();
    const chips = root.querySelector("#svc-chips");
    svc.forEach(function (s) {
      const on = state.services.indexOf(s) !== -1;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (on ? " on" : "");
      b.textContent = s;
      b.addEventListener("click", function () {
        const i = state.services.indexOf(s);
        if (i >= 0) state.services.splice(i, 1);
        else state.services.push(s);
        b.classList.toggle("on");
      });
      chips.appendChild(b);
    });
  }

  function refreshCals() {
    const w = root.querySelector("#week-cal");
    const m = root.querySelector("#months");
    if (w) w.innerHTML = renderHours();
    if (m) m.innerHTML = renderMonths();
  }

  function bind() {
    ["shopName", "greetAs", "owner", "ringPhone", "notifyEmail", "notifySms", "area", "never"].forEach(function (id) {
      const el = root.querySelector("#" + id);
      if (!el) return;
      el.addEventListener("input", function () {
        state[id] = el.value;
      });
    });
    root.addEventListener("click", function (e) {
      const t = e.target;
      if (t.dataset.toggle) {
        state.hours[t.dataset.toggle].on = !state.hours[t.dataset.toggle].on;
        refreshCals();
      }
      if (t.dataset.date) {
        const id = t.dataset.date;
        const i = state.vacation.indexOf(id);
        if (i >= 0) state.vacation.splice(i, 1);
        else state.vacation.push(id);
        t.classList.toggle("vac");
      }
      if (t.dataset.week) {
        const start = new Date(t.dataset.week + "T12:00:00");
        if (isNaN(start.getTime())) return;
        const days = [];
        for (let i = 0; i < 7; i++) {
          const x = new Date(start);
          x.setDate(start.getDate() + i);
          days.push(ymd(x));
        }
        const allOn = days.every(function (d) {
          return state.vacation.indexOf(d) !== -1;
        });
        days.forEach(function (d) {
          const i = state.vacation.indexOf(d);
          if (allOn && i >= 0) state.vacation.splice(i, 1);
          if (!allOn && i < 0) state.vacation.push(d);
        });
        refreshCals();
      }
      if (t.id === "desk-save") save();
    });
    root.addEventListener("change", function (e) {
      const t = e.target;
      if (t.dataset.start) {
        state.hours[t.dataset.start].start = t.value;
        refreshCals();
      }
      if (t.dataset.end) {
        state.hours[t.dataset.end].end = t.value;
        refreshCals();
      }
    });
  }

  paint();
  bind();
})();

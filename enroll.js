(function () {
  const form = document.getElementById("enroll-form");
  if (!form) return;
  const status = document.getElementById("enroll-status");
  const to = form.getAttribute("data-to") || "MTTech_SARFarm@outlook.com";

  function val(name) {
    const n = form.elements.namedItem(name);
    return n && n.value ? String(n.value).trim() : "";
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    const name = val("name");
    const shop = val("shop");
    const email = val("email");
    const phone = val("phone");
    const note = val("note");
    if (!name || !shop || !email) {
      if (status) status.textContent = "Name, shop, and email are required.";
      return;
    }
    const subject = "ENROLL: " + shop + " — dedicated Virtual Assistant line";
    const body = [
      "ENROLLMENT — Virtual Assistant",
      "",
      "Name: " + name,
      "Shop: " + shop,
      "Email: " + email,
      "Callback phone: " + (phone || "(none — still issue a dedicated line)"),
      "When they miss calls: " + (note || "(not specified)"),
      "",
      "Action: provision a dedicated Virtual Assistant number for this shop, email that number to " +
        email +
        ", and notify Brian Moore the same day.",
    ].join("\n");
    const href =
      "mailto:" +
      encodeURIComponent(to) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    if (status) {
      status.textContent =
        "Opening your mail app to " +
        to +
        ". Send that message and we will set up the dedicated number and tell Brian.";
    }
    window.location.href = href;
  });
})();

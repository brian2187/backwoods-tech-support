(function () {
  const form = document.getElementById("feedback-form");
  if (!form) return;
  const status = document.getElementById("feedback-status");
  const to = form.getAttribute("data-to") || "";

  function val(name) {
    const n = form.elements.namedItem(name);
    return n && n.value ? String(n.value).trim() : "";
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    const name = val("name");
    const title = val("title");
    const comments = val("comments");
    const email = val("email");
    if (!name || !title || !comments || !to) {
      if (status) status.textContent = "Name, title, and comments are required.";
      return;
    }
    const subject = "Less Traveled: " + title;
    let body = "Name: " + name + "\n";
    if (email) body += "Email: " + email + "\n";
    body += "Title: " + title + "\n\n" + comments + "\n";
    const href =
      "mailto:" +
      encodeURIComponent(to) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    if (status) {
      status.textContent =
        "Opening your mail app to " + to + ". If nothing opens, copy the note and send it to that address.";
    }
    window.location.href = href;
  });
})();

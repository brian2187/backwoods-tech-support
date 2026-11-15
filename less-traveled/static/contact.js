(function () {
  const form = document.getElementById("feedback-form");
  if (!form) return;
  const status = document.getElementById("feedback-status");

  function desk() {
    try {
      return atob("TVRUZWNoX1NBUkZhcm1Ab3V0bG9vay5jb20=");
    } catch {
      return "";
    }
  }

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
    const to = desk();
    if (!name || !title || !comments) {
      if (status) status.textContent = "Name, title, and comments are required.";
      return;
    }
    if (!to) {
      if (status) status.textContent = "Mail app could not be prepared. Try again.";
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
    if (status) status.textContent = "Opening your mail app with the note filled in.";
    window.location.href = href;
  });
})();

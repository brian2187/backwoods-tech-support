/* Set display + href when the setup AI DID is live. Until then, email starts the same sale. */
var AIBIZ_SETUP = {
  display: "MTTech_SARFarm@outlook.com",
  href: "mailto:MTTech_SARFarm@outlook.com?subject=New%20customer%20setup%20sale"
};

document.addEventListener("DOMContentLoaded", function () {
  if (!AIBIZ_SETUP || !AIBIZ_SETUP.href) return;
  document.querySelectorAll("a.setup-line").forEach(function (el) {
    el.href = AIBIZ_SETUP.href;
    if (el.classList.contains("btn")) el.textContent = "Call the setup AI — " + AIBIZ_SETUP.display;
    else el.textContent = AIBIZ_SETUP.display;
  });
});

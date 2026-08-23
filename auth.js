const USERS = {
  andy: { page: "shop-andy.html", name: "Andy The Handyman" },
  sherman: { page: "shop-sherman.html", name: "Professional Handyman Sandpoint" },
  case: { page: "shop-case.html", name: "Case Handyman & Property Maintenance" }
};

function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem("aibiz") || "null");
  } catch (e) {
    return null;
  }
}

function writeSession(user) {
  const rec = USERS[user];
  sessionStorage.setItem(
    "aibiz",
    JSON.stringify({
      user,
      name: rec.name,
      page: rec.page,
      t: Date.now()
    })
  );
}

function clearSession() {
  sessionStorage.removeItem("aibiz");
}

function nextPage() {
  const q = new URLSearchParams(location.search).get("next") || "";
  const allowed = Object.values(USERS).map((u) => u.page);
  return allowed.includes(q) ? q : null;
}

function attemptLogin(user) {
  const u = (user || "").trim().toLowerCase();
  const rec = USERS[u];
  if (!rec) return { ok: false, reason: "That logon is not in this test group." };
  writeSession(u);
  const dest = nextPage();
  location.href = dest && dest === rec.page ? dest : rec.page;
  return { ok: true };
}

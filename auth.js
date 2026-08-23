const SALT = "aibiz-mtt-2026";
const USERS = {
  andy: {
    hash: "bafef6a9d493030422637959abb76574850444ef050743fa82f77c4a8d1675f1",
    page: "shop-andy.html",
    name: "Andy The Handyman"
  },
  sherman: {
    hash: "8ebc1aae5848a1cfeb05836bcf0c7915d536c4d9c0a285617147df64f6ead77c",
    page: "shop-sherman.html",
    name: "Professional Handyman Sandpoint"
  },
  case: {
    hash: "628fb8628ccb134af66405b8b2775171a79fa230ac9e632aab055162fc59a6a8",
    page: "shop-case.html",
    name: "Case Handyman & Property Maintenance"
  }
};

async function sha256hex(str) {
  if (!window.crypto || !crypto.subtle) {
    throw new Error("This login needs HTTPS (or localhost).");
  }
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

async function attemptLogin(user, pass) {
  const u = (user || "").trim().toLowerCase();
  const rec = USERS[u];
  if (!rec) return { ok: false, reason: "That login is not in this test group." };
  const h = await sha256hex(`${u}:${pass}:${SALT}`);
  if (h !== rec.hash) return { ok: false, reason: "Username or password does not match." };
  writeSession(u);
  const dest = nextPage();
  location.href = dest && dest === rec.page ? dest : rec.page;
  return { ok: true };
}

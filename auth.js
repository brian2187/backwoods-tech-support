const USERS = {
  andy: { page: "shop-andy.html", name: "Andy The Handyman" },
  sherman: { page: "shop-sherman.html", name: "Professional Handyman Sandpoint" },
  case: { page: "shop-case.html", name: "Case Handyman & Property Maintenance" },
  clawson: { page: "shop-clawson.html", name: "Clawson Electric" },
  nce: { page: "shop-nce.html", name: "North County Electric" },
  panhandle: { page: "shop-panhandle.html", name: "Panhandle Electric LLC" },
  sageland: { page: "shop-sageland.html", name: "Sageland Electric" },
  heritage: { page: "shop-heritage.html", name: "Heritage North Electric" },
  "7b": { page: "shop-7b.html", name: "7B Handyman" },
  garage: { page: "shop-garage.html", name: "Sandpoint Garage Doors" },
  nutech: { page: "shop-nutech.html", name: "Nu-Tech Heating and Cooling" },
  believe: { page: "shop-believe.html", name: "Believe Plumbing" },
  rons: { page: "shop-rons.html", name: "Ron's Electric" },
  mobileone: { page: "shop-mobileone.html", name: "Mobile One Roadside" },
  aqua: { page: "shop-aqua.html", name: "Aqua Plumbing" },
  age: { page: "shop-age.html", name: "Age Heating & Cooling" },
  highmark: { page: "shop-highmark.html", name: "High Mark Heating & Cooling" },
  "premier-pond": { page: "shop-premier-pond.html", name: "Premier Tire Ponderay" },
  "premier-pr": { page: "shop-premier-pr.html", name: "Premier Tire Priest River" },
  selkirk: { page: "shop-selkirk.html", name: "Selkirk Offroad" },
  gription: { page: "shop-gription.html", name: "Gription Tire Pros" },
  bitterroot: { page: "shop-bitterroot.html", name: "Bitterroot Plumbing" },
  nidplumb: { page: "shop-nidplumb.html", name: "North Idaho Plumbing" },
  smb: { page: "shop-smb.html", name: "SMB Electric" },
  emmert: { page: "shop-emmert.html", name: "Emmert Electric" },
  stove: { page: "shop-stove.html", name: "Sagle Stove Shop" },
  sunrize: { page: "shop-sunrize.html", name: "SunRize Mechanical" },
  pumpline: { page: "shop-pumpline.html", name: "Pumpline" },
  stinker: { page: "shop-stinker.html", name: "Little Stinker Septic" },
  paint: { page: "shop-paint.html", name: "Satisfaction Painting" },
  als: { page: "shop-als.html", name: "Al's Towing" }
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

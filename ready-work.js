(function () {
  const shop = document.documentElement.getAttribute("data-shop");
  const names = {
    andy: "Andy The Handyman",
    sherman: "Professional Handyman Sandpoint",
    case: "Case Handyman & Property Maintenance",
    clawson: "Clawson Electric",
    nce: "North County Electric",
    panhandle: "Panhandle Electric LLC",
    sageland: "Sageland Electric",
    heritage: "Heritage North Electric",
    "7b": "7B Handyman",
    garage: "Sandpoint Garage Doors",
    nutech: "Nu-Tech Heating and Cooling",
    believe: "Believe Plumbing",
    rons: "Ron's Electric",
    mobileone: "Mobile One Roadside",
    aqua: "Aqua Plumbing",
    age: "Age Heating & Cooling",
    highmark: "High Mark Heating & Cooling",
    "premier-pond": "Premier Tire Ponderay",
    "premier-pr": "Premier Tire Priest River",
    selkirk: "Selkirk Offroad",
    gription: "Gription Tire Pros",
    bitterroot: "Bitterroot Plumbing",
    nidplumb: "North Idaho Plumbing",
    smb: "SMB Electric",
    emmert: "Emmert Electric",
    stove: "Sagle Stove Shop",
    sunrize: "SunRize Mechanical",
    pumpline: "Pumpline",
    stinker: "Little Stinker Septic",
    paint: "Satisfaction Painting",
    als: "Al's Towing"
  };
  const name = names[shop] || "your shop";
  const mail =
    "mailto:MTTech_SARFarm@outlook.com?subject=" +
    encodeURIComponent("Ready to work — " + name) +
    "&body=" +
    encodeURIComponent(
      "I filled out and saved the setup page for " +
        name +
        ".\n\nPlease start the process for a dedicated phone number and Virtual Assistant.\n\nShop logon: " +
        (shop || "") +
        "\n"
    );

  const back = document.createElement("div");
  back.className = "modal-back";
  back.setAttribute("role", "dialog");
  back.setAttribute("aria-modal", "true");
  back.innerHTML =
    '<div class="modal">' +
    "<h3>Ready to work?</h3>" +
    "<p>Have you filled out this page and hit <strong>Save setup</strong> first?</p>" +
    "<p>If you have, click below and we will start the process to get you your own dedicated phone number and AI assistant — ready to help you catch the work you are missing out on.</p>" +
    '<div class="modal-actions">' +
    '<button type="button" class="btn ghost" data-go-save>Not yet — take me to Save</button>' +
    '<a class="btn copper" data-go-start href="' +
    mail +
    '">Yes, I saved — start my line</a>' +
    "</div></div>";
  document.body.appendChild(back);

  function open() {
    back.classList.add("on");
  }
  function close() {
    back.classList.remove("on");
  }

  document.querySelectorAll("[data-ready-work]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  });
  back.addEventListener("click", function (e) {
    if (e.target === back) close();
    if (e.target.closest("[data-go-save]")) {
      close();
      const setup = document.getElementById("desk-setup");
      if (setup) setup.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();

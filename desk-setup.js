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
    },
    clawson: {
      shopName: "Clawson Electric",
      greetAs: "Clawson Electric",
      owner: "Casey Valliere",
      ringPhone: "208-946-0697",
      notifyEmail: "mvalliere@sandpoint.com",
      notifySms: "208-946-0697",
      area: "Sandpoint and Schweitzer, Idaho",
      services: ["Residential electrical", "Commercial electrical", "Backup generators", "Lighting", "Panels / service upgrades", "Rewires", "Snow-melt", "Home integration"],
      hoursNote: "No hours on sandpointelectric.com. Set them day by day. Until you do, the desk treats every call as after hours.",
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
      never: "No quotes, no generator diagnosis, no payment, no arrival times Casey has not approved."
    },
    nce: {
      shopName: "North County Electric LLC",
      greetAs: "North County Electric",
      owner: "Sean Behm",
      ringPhone: "208-255-7980",
      notifyEmail: "meghan@nceidaho.com",
      notifySms: "208-255-7980",
      area: "Sandpoint, Coeur d Alene, Priest Lake, to the Canadian border",
      services: ["Residential", "Commercial", "Industrial", "Generators", "Panels", "New construction", "Remodels"],
      hoursNote: "From nceidaho.com: Mon-Fri 8am-4p, plus 24-hour call return guarantee. After 4 and weekends go to the desk; you still make the callback.",
      hours: {
        mon: weekday("08:00", "16:00"),
        tue: weekday("08:00", "16:00"),
        wed: weekday("08:00", "16:00"),
        thu: weekday("08:00", "16:00"),
        fri: weekday("08:00", "16:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no generator/ATS diagnosis, no payment, no arrival times Sean has not approved."
    },
    panhandle: {
      shopName: "Panhandle Electric LLC",
      greetAs: "Panhandle Electric",
      owner: "Bryan and Debbie Lewis",
      ringPhone: "208-627-6639",
      notifyEmail: "info@pnhdlelectric.com",
      notifySms: "208-627-6639",
      area: "North Idaho and Western Montana",
      services: ["Commercial", "Residential", "Industrial", "Public works", "New construction", "Remodels", "Smart homes"],
      hoursNote: "No open/close hours on pnhdlelectric.com. Site says strive to get back within 24 hours. Set hours here. Until you do, every call is after hours.",
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
      never: "No quotes, no payment, no contracts, no arrival times you have not approved."
    },
    sageland: {
      shopName: "Sageland Electric LLC",
      greetAs: "Sageland Electric",
      owner: "Andy and Julia Markus",
      ringPhone: "208-603-9193",
      notifyEmail: "sagelandelectric@protonmail.com",
      notifySms: "208-603-9193",
      area: "Bonner and Kootenai Counties, Idaho",
      services: ["Residential", "Commercial", "Industrial", "Kohler generators", "Panels", "Lighting", "Repairs"],
      hoursNote: "From sagelandelectric.com gallery: Mon-Thu 8:00 AM-4:30 PM; Fri-Sun closed. After 4:30 and Friday-Sunday go to the desk.",
      hours: {
        mon: weekday("08:00", "16:30"),
        tue: weekday("08:00", "16:30"),
        wed: weekday("08:00", "16:30"),
        thu: weekday("08:00", "16:30"),
        fri: closed(),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no Kohler diagnosis, no payment, no arrival times Andy has not approved."
    },
    heritage: {
      shopName: "Heritage North Electric",
      greetAs: "Heritage North Electric",
      owner: "Tim Stevens",
      ringPhone: "208-603-4812",
      notifyEmail: "info@heritagenorthllc.com",
      notifySms: "208-603-4812",
      area: "Sandpoint, Bonner County, NW Montana",
      services: ["Residential", "Commercial", "Solar / alt-energy", "Generac", "EV chargers", "Smart home", "Troubleshooting"],
      hoursNote: "From heritagenorthllc.com: Mon-Fri 8 AM-5 PM. After 5 and weekends go to the desk. Do not quote Synchrony or the 2-year workmanship guarantee.",
      hours: {
        mon: weekday("08:00", "17:00"),
        tue: weekday("08:00", "17:00"),
        wed: weekday("08:00", "17:00"),
        thu: weekday("08:00", "17:00"),
        fri: weekday("08:00", "17:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no financing pitch, no workmanship-guarantee language, no payment, no arrival times Tim has not approved."
    },
    "7b": {
      shopName: "7B Handyman and Contracting",
      greetAs: "7B Handyman",
      owner: "Nick Douglas",
      ringPhone: "208-304-6335",
      notifyEmail: "info@7bhandyman.com",
      notifySms: "208-304-6335",
      area: "Bonner, Boundary, and Kootenai counties",
      services: ["Handyman", "General contracting", "Home inspections", "Snow / ice dams", "Decks", "Remodels"],
      hoursNote: "From 7bhandyman.com: Mon-Fri 7am-5pm. Inspection prices on the site may be noted; never applied. After 5 and weekends go to the desk.",
      hours: {
        mon: weekday("07:00", "17:00"),
        tue: weekday("07:00", "17:00"),
        wed: weekday("07:00", "17:00"),
        thu: weekday("07:00", "17:00"),
        fri: weekday("07:00", "17:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no applying inspection fees, no payment, no arrival times Nick has not approved."
    },
    garage: {
      shopName: "Sandpoint Garage Doors",
      greetAs: "Sandpoint Garage Doors",
      owner: "",
      ringPhone: "208-263-6040",
      notifyEmail: "office@sandpointgaragedoors.com",
      notifySms: "208-263-6040",
      area: "Sandpoint and surrounding areas",
      services: ["Garage door repair", "New doors / installation", "Openers", "Annual maintenance"],
      hoursNote: "From sandpointgaragedoors.com footer: Mon-Fri 8am-4pm. After 4 and weekends go to the desk.",
      hours: {
        mon: weekday("08:00", "16:00"),
        tue: weekday("08:00", "16:00"),
        wed: weekday("08:00", "16:00"),
        thu: weekday("08:00", "16:00"),
        fri: weekday("08:00", "16:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no spring/opener advice, no payment, no arrival times you have not approved."
    },
    nutech: {
      shopName: "Nu-Tech Heating and Cooling",
      greetAs: "Nu-Tech Heating and Cooling",
      owner: "",
      ringPhone: "208-820-3435",
      notifyEmail: "nutechhvac@proton.me",
      notifySms: "208-820-3435",
      area: "Sandpoint, Sagle, Coeur d Alene",
      services: ["Furnace / AC repair", "Replacements", "Maintenance", "New construction HVAC", "Light commercial", "Indoor air quality"],
      hoursNote: "No weekday hours on nutechheatingcooling.com. Contact page mentions emergency repair. Set hours here. Until you do, every call is after hours.",
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
      never: "No quotes, no furnace/AC diagnosis, no payment, no arrival times you have not approved."
    },
    believe: {
      shopName: "Believe Plumbing",
      greetAs: "Believe Plumbing",
      owner: "Dillon and Vera Emery",
      ringPhone: "208-690-4948",
      notifyEmail: "info@callbelieveplumbing.com",
      notifySms: "208-690-4948",
      area: "Sandpoint, Hayden, and North Idaho",
      services: ["Emergency plumbing", "Water heaters", "Drain cleaning", "Sewer camera", "Gas lines", "Commercial plumbing"],
      hoursNote: "Site says phones answered 24/7. Calendar UI is 6am-8pm: ring them first in that window. After 8pm the desk answers. Do not quote flat rates.",
      hours: {
        mon: weekday("06:00", "20:00"),
        tue: weekday("06:00", "20:00"),
        wed: weekday("06:00", "20:00"),
        thu: weekday("06:00", "20:00"),
        fri: weekday("06:00", "20:00"),
        sat: weekday("06:00", "20:00"),
        sun: weekday("06:00", "20:00")
      },
      vacation: [],
      never: "No flat-rate quotes, no shutoff instructions unless scripted, no payment, no arrival times Dillon and Vera have not approved."
    },
    rons: {
      shopName: "Rons Electric Inc.",
      greetAs: "Rons Electric",
      owner: "",
      ringPhone: "208-263-7294",
      notifyEmail: "Ronselectric22@gmail.com",
      notifySms: "208-263-7294",
      area: "Sandpoint, Ponderay, Kootenai",
      services: ["Lighting", "Troubleshooting", "Commercial / industrial", "New construction / remodels", "Generators"],
      hoursNote: "ronselectric.net: Monday 8am-4pm confirmed; Sat/Sun by appointment; emergency 24/7. Tue-Fri widget shows 8am-4am (likely typo) — confirm here. Defaulting Tue-Fri closed until you set them.",
      hours: {
        mon: weekday("08:00", "16:00"),
        tue: closed(),
        wed: closed(),
        thu: closed(),
        fri: closed(),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no panel diagnosis, no payment, no arrival times you have not approved."
    },
    mobileone: {
      shopName: "Mobile One Roadside Services",
      greetAs: "Mobile One Roadside",
      owner: "",
      ringPhone: "208-610-1440",
      notifyEmail: "mo@mobileoneroadside.com",
      notifySms: "208-610-1440",
      area: "North Idaho, Eastern Washington including Spokane, Western Montana",
      services: ["Emergency truck repair", "Trailer repair", "Diesel RV", "Fleet", "Lot check"],
      hoursNote: "Site: 24-hour dispatch, technician not an answering service. Calendar UI is 6am-8pm: ring them first. After 8pm overflow to the desk. Never offer a tow.",
      hours: {
        mon: weekday("06:00", "20:00"),
        tue: weekday("06:00", "20:00"),
        wed: weekday("06:00", "20:00"),
        thu: weekday("06:00", "20:00"),
        fri: weekday("06:00", "20:00"),
        sat: weekday("06:00", "20:00"),
        sun: weekday("06:00", "20:00")
      },
      vacation: [],
      never: "No quotes, no brake/cooling diagnosis, no towing, no payment, no ETAs you have not approved."
    },
    aqua: {
      shopName: "Aqua Plumbing",
      greetAs: "Aqua Plumbing",
      owner: "",
      ringPhone: "208-946-0532",
      notifyEmail: "dispatch.aqua@yahoo.com",
      notifySms: "208-946-0532",
      area: "Bonner and Boundary Counties",
      services: ["General plumbing", "Drain cleaning", "Sewer camera", "Tankless water heaters", "Frozen pipes"],
      hoursNote: "aquaplumbingid.com footer: OPEN HOURS 24 Hours. Desk is overflow. Confirm 208-946-0532 vs 208-265-2782.",
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
      never: "No quotes, no payment, no arrival times you have not approved."
    },
    age: {
      shopName: "Age Heating & Cooling",
      greetAs: "Age Heating & Cooling",
      owner: "",
      ringPhone: "208-603-2210",
      notifyEmail: "dispatch@ageheatingandcooling.com",
      notifySms: "208-603-2210",
      area: "Sandpoint and listed North Idaho towns",
      services: ["Furnace", "AC", "Mini-split", "Boiler", "Water heater", "Generators"],
      hoursNote: "No open/close hours on the fetched homepage/contact. Set them here.",
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
      never: "No Lennox quotes, no financing pitch, no payment, no arrival times you have not approved."
    },
    highmark: {
      shopName: "High Mark Heating & Cooling",
      greetAs: "High Mark Heating & Cooling",
      owner: "",
      ringPhone: "208-263-4797",
      notifyEmail: "highmarkheating@gmail.com",
      notifySms: "208-263-4797",
      area: "Bonner County, North Idaho",
      services: ["Furnace", "Heat pump", "Boiler", "Radiant", "Ductless", "AC"],
      hoursNote: "highmarkheatingandcooling.com: office Monday-Friday 8am-4pm. After-hours emergency on the same number.",
      hours: {
        mon: weekday("08:00", "16:00"),
        tue: weekday("08:00", "16:00"),
        wed: weekday("08:00", "16:00"),
        thu: weekday("08:00", "16:00"),
        fri: weekday("08:00", "16:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No equipment quotes, no payment, no arrival times you have not approved."
    },
    "premier-pond": {
      shopName: "Premier Tire — Ponderay",
      greetAs: "Premier Tire Ponderay",
      owner: "",
      ringPhone: "208-255-1191",
      notifyEmail: "ponderay@premiertirellc.com",
      notifySms: "208-255-1191",
      area: "Ponderay / Sandpoint; mobile heavy-duty as published",
      services: ["Passenger tires", "Commercial tires", "Brakes", "Alignment", "Lift kits"],
      hoursNote: "premiertirellc.com footer: Ponderay Mon-Fri 8am-6pm, Sat 9am-2pm.",
      hours: {
        mon: weekday("08:00", "18:00"),
        tue: weekday("08:00", "18:00"),
        wed: weekday("08:00", "18:00"),
        thu: weekday("08:00", "18:00"),
        fri: weekday("08:00", "18:00"),
        sat: weekday("09:00", "14:00"),
        sun: closed()
      },
      vacation: [],
      never: "No tire quotes, no payment, no arrival times you have not approved."
    },
    "premier-pr": {
      shopName: "Premier Tire — Priest River",
      greetAs: "Premier Tire Priest River",
      owner: "",
      ringPhone: "208-448-0549",
      notifyEmail: "priestriver@premiertirellc.com",
      notifySms: "208-448-0549",
      area: "Priest River / US-2",
      services: ["Passenger tires", "Commercial tires", "Brakes", "Alignment", "Lift kits"],
      hoursNote: "premiertirellc.com footer: Priest River Mon-Fri 8am-6pm, closed Saturday and Sunday.",
      hours: {
        mon: weekday("08:00", "18:00"),
        tue: weekday("08:00", "18:00"),
        wed: weekday("08:00", "18:00"),
        thu: weekday("08:00", "18:00"),
        fri: weekday("08:00", "18:00"),
        sat: closed(),
        sun: closed()
      },
      vacation: [],
      never: "No tire quotes, no payment, no arrival times you have not approved."
    },
    selkirk: {
      shopName: "Selkirk Offroad",
      greetAs: "Selkirk Offroad",
      owner: "",
      ringPhone: "208-610-4086",
      notifyEmail: "info@selkirkoffroad.com",
      notifySms: "208-610-4086",
      area: "Sagle, ID (US-95)",
      services: ["4x4 / offroad", "Specialty truck work"],
      hoursNote: "selkirkoffroad.com timed out at write time. No hours confirmed. Set them here.",
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
      never: "No quotes, no payment, no arrival times you have not approved."
    },
    gription: {
      shopName: "Gription Tire Pros",
      greetAs: "Gription Tire Pros",
      owner: "",
      ringPhone: "208-255-2020",
      notifyEmail: "griptiontirepros@gmail.com",
      notifySms: "208-255-2020",
      area: "Sandpoint, ID and surrounding",
      services: ["Tires", "Brakes", "Alignments", "Batteries", "Suspension"],
      hoursNote: "Hours on griptiontirepros.com rendered as template placeholders. Do not invent. Set real hours here.",
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
      never: "No tire quotes, no payment, no arrival times you have not approved. Do not offer towing."
    },
    bitterroot: {
      shopName: "Bitterroot Plumbing",
      greetAs: "Bitterroot Plumbing",
      owner: "Mike",
      ringPhone: "208-819-5709",
      notifyEmail: "bitterrootplumbing@gmail.com",
      notifySms: "208-819-5709",
      area: "Bonner County, Boundary County, Pend Oreille County",
      services: ["Plumbing repairs", "New construction", "Remodels", "Water heaters", "Filtration", "Radiant"],
      hoursNote: "From bitterrootplumbing.com: Monday–Saturday 6:30am–5:30pm. After 5:30 and Sunday go to the desk.",
      hours: {
        mon: weekday("06:30", "17:30"),
        tue: weekday("06:30", "17:30"),
        wed: weekday("06:30", "17:30"),
        thu: weekday("06:30", "17:30"),
        fri: weekday("06:30", "17:30"),
        sat: weekday("06:30", "17:30"),
        sun: closed()
      },
      vacation: [],
      never: "No quotes, no radiant/filtration diagnosis, no payment, no arrival times you have not approved."
    },
    nidplumb: {
      shopName: "North Idaho Plumbing",
      greetAs: "North Idaho Plumbing",
      owner: "Nate",
      ringPhone: "208-603-1700",
      notifyEmail: "office@nidplumbing.com",
      notifySms: "208-603-1700",
      area: "Bonners Ferry, Sandpoint, and surrounding communities",
      services: ["Emergency plumbing", "Water heaters", "Drain cleaning", "New construction", "Renovations"],
      hoursNote: "nidplumbing.com: 24/7 emergency; no office open/close listed. Calendar UI is 6am–8pm: ring them first. After 8pm the desk answers. Never promise a 60-minute arrival.",
      hours: {
        mon: weekday("06:00", "20:00"),
        tue: weekday("06:00", "20:00"),
        wed: weekday("06:00", "20:00"),
        thu: weekday("06:00", "20:00"),
        fri: weekday("06:00", "20:00"),
        sat: weekday("06:00", "20:00"),
        sun: weekday("06:00", "20:00")
      },
      vacation: [],
      never: "No quotes, no 60-minute ETA, no 100% satisfaction language, no payment, no arrival times Nate has not approved. This is nidplumbing.com, not the Hayden shop."
    },
    smb: {
      shopName: "SMB Electric LLC",
      greetAs: "SMB Electric",
      owner: "Steve Bangeman",
      ringPhone: "208-691-9250",
      notifyEmail: "smbelectricllc@gmail.com",
      notifySms: "208-691-9250",
      area: "Sandpoint, Sagle, Ponderay, Priest River, Bonners Ferry, and listed North Idaho towns",
      services: ["New construction electrical", "Remodels", "Panels", "Service calls", "Generators", "EV chargers"],
      hoursNote: "No open/close hours on smbelectricllcid.com. Set them here. Until you do, every call is after hours. Do not quote the one-year workmanship guarantee.",
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
      never: "No quotes, no workmanship-guarantee language, no payment, no arrival times Steve has not approved."
    },
    emmert: {
      shopName: "Emmert Electric & Mechanical LLC",
      greetAs: "Emmert Electric",
      owner: "Jeff and Jacob Emmert",
      ringPhone: "208-946-7676",
      notifyEmail: "Emmert208@gmail.com",
      notifySms: "208-946-7676",
      area: "Priest River home base; North Idaho within 75 miles",
      services: ["Furnace", "Heat pump", "Boiler", "AC", "Mini-split", "Panels", "Generators", "EV charging"],
      hoursNote: "emmert208.com: 24/7 emergency HVAC and electrical. No office open/close listed. Calendar UI is 6am–8pm: ring them first. After 8pm the desk answers.",
      hours: {
        mon: weekday("06:00", "20:00"),
        tue: weekday("06:00", "20:00"),
        wed: weekday("06:00", "20:00"),
        thu: weekday("06:00", "20:00"),
        fri: weekday("06:00", "20:00"),
        sat: weekday("06:00", "20:00"),
        sun: weekday("06:00", "20:00")
      },
      vacation: [],
      never: "No quotes, no furnace/electrical diagnosis, no payment, no arrival times Jeff and Jacob have not approved."
    },
    stove: {
      shopName: "Sagle Stove Shop / All About Chimneys",
      greetAs: "Sagle Stove Shop",
      owner: "Kris and Kalen Kulp",
      ringPhone: "208-265-2226",
      notifyEmail: "saglestoveshop@gmail.com",
      notifySms: "208-265-2226",
      area: "Bonner, Boundary, and Kootenai Counties; shop at 166 Gun Club Rd, Sagle",
      services: ["Stove installation", "Chimney cleaning", "Chimney relining", "Dryer vents", "Masonry", "Insurance inspection"],
      hoursNote: "No hours on saglestoveshop.com. Directory hours were ignored. Set them here. Until you do, every call is after hours.",
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
      never: "No stove quotes, no chimney diagnosis, no payment, no arrival times Kris and Kalen have not approved."
    },
    sunrize: {
      shopName: "SunRize Mechanical",
      greetAs: "SunRize Mechanical",
      owner: "Joe Miller",
      ringPhone: "208-699-9468",
      notifyEmail: "Office@sunrizehvac.com",
      notifySms: "208-699-9468",
      area: "Kootenai and Bonner counties including Sandpoint, Sagle, Priest River",
      services: ["Furnace", "AC", "Heat pump", "Mini-split", "Indoor air quality", "Gas lines", "Shop heaters"],
      hoursNote: "No open/close hours on sunrizehvac.com. Directory hours were ignored. Set them here. Until you do, every call is after hours.",
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
      never: "No equipment quotes, no furnace/AC diagnosis, no payment, no arrival times Joe has not approved."
    },
    pumpline: {
      shopName: "Pumpline",
      greetAs: "Pumpline",
      owner: "",
      ringPhone: "208-610-8822",
      notifyEmail: "office@pumpline.net",
      notifySms: "208-610-8822",
      area: "North Idaho, Western Montana, Ponderay and surrounding",
      services: ["Well pumps", "Sewer pumps", "Controls", "Electrical", "Emergency service"],
      hoursNote: "No hours or street on pumpline.net. Set hours here. Until you do, every call is after hours.",
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
      never: "No quotes, no well/sewer diagnosis, no payment, no arrival times you have not approved."
    },
    stinker: {
      shopName: "Little Stinker Septic Service",
      greetAs: "Little Stinker Septic",
      owner: "",
      ringPhone: "208-772-7562",
      notifyEmail: "littlestinker.office@yahoo.com",
      notifySms: "208-772-7562",
      area: "North Idaho and Newport WA including Sandpoint, Priest River, Oldtown, Rathdrum",
      services: ["Septic pumping", "Drain cleaning", "Grease traps", "Hydro jetting", "Camera inspections", "Installations"],
      hoursNote: "littlestinkerseptic.com: Mon–Sun 24hr. Calendar UI is 6am–8pm: ring them first. After 8pm the desk answers. Shop mobile 208-687-1828 is theirs, not ours.",
      hours: {
        mon: weekday("06:00", "20:00"),
        tue: weekday("06:00", "20:00"),
        wed: weekday("06:00", "20:00"),
        thu: weekday("06:00", "20:00"),
        fri: weekday("06:00", "20:00"),
        sat: weekday("06:00", "20:00"),
        sun: weekday("06:00", "20:00")
      },
      vacation: [],
      never: "No quotes, no drain-field diagnosis, no payment, no ETAs you have not approved."
    },
    paint: {
      shopName: "Satisfaction Painting",
      greetAs: "Satisfaction Painting",
      owner: "",
      ringPhone: "208-290-3753",
      notifyEmail: "Office@satisfactionpainting.com",
      notifySms: "208-290-3753",
      area: "Sandpoint (1424 North Boyer Avenue) and surrounding",
      services: ["Interior painting", "Exterior painting", "Commercial", "Cabinets", "Pressure washing", "Pre-stain / pre-finish"],
      hoursNote: "satisfactionpainting.com hours widget showed 7:00 am–4:00 pm as “open today” at fetch; weekday table was not labeled. Do not invent Mon–Fri. Set real hours here.",
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
      never: "No quotes, no color advice, no start-week promises, no payment, no arrival times you have not approved."
    },
    als: {
      shopName: "Al's Towing",
      greetAs: "Al's Towing",
      owner: "Alex",
      ringPhone: "208-265-8697",
      notifyEmail: "alstowing@hotmail.com",
      notifySms: "208-265-8697",
      area: "Sandpoint / Ponderay (605 Vermeer Dr)",
      services: ["Towing", "4x4 recovery", "Winch-outs", "Roadside", "RVs and trailers", "Jump starts", "Lockouts"],
      hoursNote: "alstowingidaho.com: 24 hours, 7 days a week. Calendar UI is 6am–8pm: ring them first. After 8pm the desk answers. Never quote a hook fee or ETA.",
      hours: {
        mon: weekday("06:00", "20:00"),
        tue: weekday("06:00", "20:00"),
        wed: weekday("06:00", "20:00"),
        thu: weekday("06:00", "20:00"),
        fri: weekday("06:00", "20:00"),
        sat: weekday("06:00", "20:00"),
        sun: weekday("06:00", "20:00")
      },
      vacation: [],
      never: "No hook-fee quotes, no ETAs, no payment, no veterans-discount amounts you have not approved."
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

  function minToHHMM(m) {
    m = Math.max(START_MIN, Math.min(END_MIN, Math.round(m / 30) * 30));
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }

  function yToHHMM(track, clientY) {
    const r = track.getBoundingClientRect();
    const t = r.height ? Math.min(1, Math.max(0, (clientY - r.top) / r.height)) : 0;
    return minToHHMM(START_MIN + t * SPAN);
  }

  function blockStyle(h) {
    const top = ((Math.max(toMin(h.start), START_MIN) - START_MIN) / SPAN) * 100;
    const bot = ((Math.min(toMin(h.end), END_MIN) - START_MIN) / SPAN) * 100;
    return "top:" + top + "%;height:" + Math.max(bot - top, 3) + "%";
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
  if (!state.hours) state.hours = JSON.parse(JSON.stringify(PRESETS[shop].hours));
  DAYS.forEach(function (d) {
    if (!state.hours[d]) state.hours[d] = closed();
    if (typeof state.hours[d].on !== "boolean") state.hours[d].on = false;
    if (!state.hours[d].start) state.hours[d].start = "07:00";
    if (!state.hours[d].end) state.hours[d].end = "16:00";
  });
  if (!Array.isArray(state.vacation)) state.vacation = [];
  if (!Array.isArray(state.services)) state.services = PRESETS[shop].services.slice();

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
      const on = !!h.on;
      return (
        '<div class="day-col' +
        (on ? "" : " closed") +
        '" data-day="' +
        d +
        '">' +
        "<h4>" +
        DAY_LABEL[d] +
        "</h4>" +
        '<label class="tog"><input type="checkbox" data-toggle="' +
        d +
        '"' +
        (on ? " checked" : "") +
        "> You first</label>" +
        '<div class="times"><input type="time" step="1800" data-start="' +
        d +
        '" value="' +
        h.start +
        '"> <input type="time" step="1800" data-end="' +
        d +
        '" value="' +
        h.end +
        '"></div>' +
        '<div class="track" data-track="' +
        d +
        '" title="Drag to set hours (6am–8pm)">' +
        '<div class="block" style="' +
        blockStyle(h) +
        '"></div></div></div>'
      );
    }).join("");
  }

  function syncDay(d) {
    const col = root.querySelector('.day-col[data-day="' + d + '"]');
    if (!col) return;
    const h = state.hours[d];
    col.classList.toggle("closed", !h.on);
    const box = col.querySelector("[data-toggle]");
    if (box) box.checked = !!h.on;
    const s = col.querySelector("[data-start]");
    const e = col.querySelector("[data-end]");
    if (s && s !== document.activeElement) s.value = h.start;
    if (e && e !== document.activeElement) e.value = h.end;
    const b = col.querySelector(".block");
    if (b) b.setAttribute("style", blockStyle(h));
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

    let drag = null;

    root.addEventListener("click", function (e) {
      const t = e.target.closest("[data-date],[data-week],#desk-save");
      if (!t) return;
      if (t.id === "desk-save") {
        e.preventDefault();
        save();
        return;
      }
      if (t.dataset.date) {
        const id = t.dataset.date;
        const i = state.vacation.indexOf(id);
        if (i >= 0) state.vacation.splice(i, 1);
        else state.vacation.push(id);
        const months = root.querySelector("#months");
        if (months) months.innerHTML = renderMonths();
        return;
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
        const months = root.querySelector("#months");
        if (months) months.innerHTML = renderMonths();
      }
    });

    root.addEventListener("change", function (e) {
      const t = e.target;
      if (t.dataset.toggle) {
        state.hours[t.dataset.toggle].on = t.checked;
        syncDay(t.dataset.toggle);
        return;
      }
      if (t.dataset.start) {
        const d = t.dataset.start;
        state.hours[d].start = t.value || state.hours[d].start;
        if (toMin(state.hours[d].end) <= toMin(state.hours[d].start)) {
          state.hours[d].end = minToHHMM(toMin(state.hours[d].start) + 30);
        }
        state.hours[d].on = true;
        syncDay(d);
        return;
      }
      if (t.dataset.end) {
        const d = t.dataset.end;
        state.hours[d].end = t.value || state.hours[d].end;
        if (toMin(state.hours[d].end) <= toMin(state.hours[d].start)) {
          state.hours[d].start = minToHHMM(toMin(state.hours[d].end) - 30);
        }
        state.hours[d].on = true;
        syncDay(d);
      }
    });

    root.addEventListener("pointerdown", function (e) {
      const track = e.target.closest("[data-track]");
      if (!track) return;
      e.preventDefault();
      const d = track.getAttribute("data-track");
      const t = yToHHMM(track, e.clientY);
      state.hours[d].on = true;
      state.hours[d].start = t;
      state.hours[d].end = minToHHMM(toMin(t) + 30);
      drag = { day: d, track: track, origin: t };
      try {
        track.setPointerCapture(e.pointerId);
      } catch (err) {}
      syncDay(d);
    });
    root.addEventListener("pointermove", function (e) {
      if (!drag) return;
      const a = toMin(drag.origin);
      const b = toMin(yToHHMM(drag.track, e.clientY));
      state.hours[drag.day].start = minToHHMM(Math.min(a, b));
      state.hours[drag.day].end = minToHHMM(Math.max(a, b) === Math.min(a, b) ? Math.min(a, b) + 30 : Math.max(a, b));
      syncDay(drag.day);
    });
    root.addEventListener("pointerup", function () {
      drag = null;
    });
    root.addEventListener("pointercancel", function () {
      drag = null;
    });
  }

  paint();
  bind();
})();

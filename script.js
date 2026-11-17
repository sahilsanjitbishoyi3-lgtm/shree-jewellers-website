
/* =========================================
   SHREE JEWELLERS - COMPLETE WEBSITE JS
========================================= */

/* MOBILE NAVIGATION */

const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  mobileNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });
}

/* STICKY HEADER */

const siteHeader = document.getElementById("siteHeader");

function updateHeader() {
  if (siteHeader) {
    siteHeader.classList.toggle("scrolled", window.scrollY > 30);
  }
}

window.addEventListener("scroll", updateHeader);
updateHeader();

/* COPYRIGHT YEAR */

const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* VIDEO ROTATION */

const heroVideo = document.getElementById("heroVideo");

const jewelleryClips = [
  "assets/videos/bridal-model.mp4",
  "assets/videos/bridal-gold.mp4",
  "assets/videos/gold-diamond-closeup.mp4"
];

let activeClip = 0;

if (heroVideo) {
  heroVideo.addEventListener("ended", () => {
    activeClip = (activeClip + 1) % jewelleryClips.length;

    heroVideo.src = jewelleryClips[activeClip];
    heroVideo.load();

    heroVideo.play().catch(error => {
      console.warn("Video playback was blocked:", error);
    });
  });

  heroVideo.addEventListener("error", () => {
    console.error(
      "Homepage video failed to load. Check the filename and folder."
    );
  });

  heroVideo.play().catch(() => {
    console.log("Video playback requires a browser action.");
  });
}

/* BACKGROUND MUSIC */

const heroMusic = document.getElementById("heroMusic");
const musicToggle = document.getElementById("musicToggle");

if (musicToggle && heroMusic) {
  musicToggle.addEventListener("click", async () => {
    if (heroMusic.paused) {
      try {
        await heroMusic.play();
        musicToggle.textContent = "♫ Turn Music Off";
        musicToggle.setAttribute("aria-pressed", "true");
      } catch (error) {
        musicToggle.textContent = "Music unavailable";
        console.error("Music playback failed:", error);
      }
    } else {
      heroMusic.pause();
      musicToggle.textContent = "♫ Turn Music On";
      musicToggle.setAttribute("aria-pressed", "false");
    }
  });

  heroMusic.addEventListener("error", () => {
    console.error("Audio file could not load. Check its filename and folder.");
  });
}

/* GOLD AND SILVER RATES */

const RATE_API = "https://api.dharun.dev/v1/bullion";

const gold24Element = document.getElementById("gold24");
const gold22Element = document.getElementById("gold22");
const silverElement = document.getElementById("silverRate");
const silverKgElement = document.getElementById("silverKg");
const rateStatus = document.getElementById("rateStatus");
const refreshRatesButton = document.getElementById("refreshRates");

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findNumericValue(object, possibleKeys) {
  if (!object || typeof object !== "object") return null;

  const normalizedKeys = possibleKeys.map(normalizeKey);

  for (const [key, value] of Object.entries(object)) {
    if (
      normalizedKeys.includes(normalizeKey(key)) &&
      value !== null &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  for (const value of Object.values(object)) {
    if (value && typeof value === "object") {
      const found = findNumericValue(value, possibleKeys);
      if (found !== null) return found;
    }
  }

  return null;
}

function formatRupees(value) {
  if (value === null || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return "₹" + value.toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

async function loadMetalRates() {
  if (!rateStatus) return;

  if (refreshRatesButton) {
    refreshRatesButton.disabled = true;
    refreshRatesButton.textContent = "Checking...";
  }

  rateStatus.textContent = "Checking latest available rates...";

  try {
    const response = await fetch(RATE_API, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Rate provider returned an error.");
    }

    const data = await response.json();

    const gold24 = findNumericValue(data, [
      "gold24", "gold24k", "gold_24k",
      "24k", "gold_999", "gold999"
    ]);

    const gold22 = findNumericValue(data, [
      "gold22", "gold22k", "gold_22k",
      "22k", "gold_916", "gold916"
    ]);

    const silver = findNumericValue(data, [
      "silver", "silver999", "silver_999", "silver_rate"
    ]);

    /*
      IMPORTANT:
      This example requires the API to return INR per gram.
      Do not show a value unless the provider's units and
      response format have been confirmed.
    */

    if (gold24 === null || gold22 === null || silver === null) {
      throw new Error("Rate data format could not be verified.");
    }

    if (gold24 <= 0 || gold22 <= 0 || silver <= 0) {
      throw new Error("Invalid rate values.");
    }

    gold24Element.textContent = formatRupees(gold24);
    gold22Element.textContent = formatRupees(gold22);
    silverElement.textContent = formatRupees(silver);
    silverKgElement.textContent = "Per kg: " + formatRupees(silver * 1000);

    rateStatus.textContent =
      "Rates checked: " + new Date().toLocaleString("en-IN");

  } catch (error) {
    console.error("Metal rate error:", error);

    if (gold24Element) gold24Element.textContent = "Unavailable";
    if (gold22Element) gold22Element.textContent = "Unavailable";
    if (silverElement) silverElement.textContent = "Unavailable";
    if (silverKgElement) silverKgElement.textContent = "Per kg: Unavailable";

    rateStatus.textContent =
      "Live rates unavailable. Please check again later.";
  } finally {
    if (refreshRatesButton) {
      refreshRatesButton.disabled = false;
      refreshRatesButton.textContent = "↻ Refresh Rates";
    }
  }
}

/* RATE BUTTON */

if (refreshRatesButton) {
  refreshRatesButton.addEventListener("click", loadMetalRates);
}

/* INITIAL RATE LOAD */

loadMetalRates();

/* AUTOMATIC HOURLY REFRESH */

setInterval(loadMetalRates, 60 * 60 * 1000);

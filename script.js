
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


/* =========================================
   CINEMATIC JEWELLERY VIDEO BANNER
========================================= */

const heroVideo = document.getElementById("heroVideo");
const heroMusic = document.getElementById("heroMusic");
const musicToggle = document.getElementById("musicToggle");

const jewelleryClips = [
  "assets/videos/bridal-model.mp4",
  "assets/videos/bridal-gold.mp4",
  "assets/videos/gold-diamond-closeup.mp4"
];

let activeClip = 0;
let isChangingClip = false;


/* Play the next video after the current video ends */

function playNextJewelleryClip() {

  if (!heroVideo || isChangingClip) return;

  isChangingClip = true;

  activeClip = (activeClip + 1) % jewelleryClips.length;

  heroVideo.classList.add("changing");

  setTimeout(() => {

    heroVideo.src = jewelleryClips[activeClip];
    heroVideo.load();

    heroVideo.play()
      .then(() => {
        heroVideo.classList.remove("changing");
        isChangingClip = false;
      })
      .catch(error => {
        console.warn("Video could not autoplay:", error);
        heroVideo.classList.remove("changing");
        isChangingClip = false;
      });

  }, 700);

}


if (heroVideo) {

  heroVideo.addEventListener("ended", playNextJewelleryClip);

  heroVideo.addEventListener("error", () => {
    console.error(
      "Homepage video could not load. Please check the video filename and folder."
    );
  });

  heroVideo.addEventListener("loadeddata", () => {
    if (heroVideo.paused) {
      heroVideo.play().catch(() => {
        console.log("Browser requires a user action to play the video.");
      });
    }
  });

}


/* =========================================
   BACKGROUND MUSIC CONTROL
========================================= */

if (musicToggle && heroMusic) {

  musicToggle.addEventListener("click", async () => {

    if (heroMusic.paused) {

      try {

        await heroMusic.play();
        musicToggle.textContent = "♫ Turn Music Off";
        musicToggle.setAttribute("aria-pressed", "true");

      } catch (error) {

        musicToggle.textContent = "Music unavailable";
        console.error("Background music could not play:", error);

      }

    } else {

      heroMusic.pause();
      musicToggle.textContent = "♫ Turn Music On";
      musicToggle.setAttribute("aria-pressed", "false");

    }

  });

}


/* =========================================
   GOLD AND SILVER RATE SECTION

   External API: dharun.dev
   Verify API response and terms before relying
   on these values for business transactions.
========================================= */

const RATE_API = "https://api.dharun.dev/v1/bullion";

const gold24Element = document.getElementById("gold24");
const gold22Element = document.getElementById("gold22");
const silverElement = document.getElementById("silverRate");
const silverKgElement = document.getElementById("silverKg");
const rateStatus = document.getElementById("rateStatus");
const refreshRatesButton = document.getElementById("refreshRates");


/* Find a numeric value in different possible API formats */

function findNumericValue(object, possibleKeys) {

  if (!object || typeof object !== "object") return null;

  const normalizedKeys = possibleKeys.map(key =>
    key.toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  for (const [key, value] of Object.entries(object)) {

    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (
      normalizedKeys.includes(normalizedKey) &&
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    if (
      normalizedKeys.includes(normalizedKey) &&
      typeof value === "string" &&
      value.trim() !== "" &&
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


/* Display Indian currency */

function formatRupees(value) {

  if (value === null || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return "₹" + value.toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });

}


/* Load the latest available rates */

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
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Rate provider returned an error.");
    }

    const data = await response.json();

    /*
      These key names are possible examples.
      The provider's actual JSON structure must be
      verified for accurate live rate display.
    */

    const gold24 = findNumericValue(data, [
      "gold24",
      "gold24k",
      "gold_24k",
      "24k",
      "gold_999",
      "gold999"
    ]);

    const gold22 = findNumericValue(data, [
      "gold22",
      "gold22k",
      "gold_22k",
      "22k",
      "gold_916",
      "gold916"
    ]);

    const silver = findNumericValue(data, [
      "silver",
      "silver999",
      "silver_999",
      "silver_rate"
    ]);

    if (
      gold24 === null ||
      gold22 === null ||
      silver === null
    ) {
      throw new Error("The rate provider data format could not be verified.");
    }

    /*
      Values must be rupees per gram.
      Do not display rates with an unverified unit.
    */

    gold24Element.textContent = formatRupees(gold24);
    gold22Element.textContent = formatRupees(gold22);
    silverElement.textContent = formatRupees(silver);
    silverKgElement.textContent =
      "Per kg: " + formatRupees(silver * 1000);

    rateStatus.textContent =
      "Rates checked: " + new Date().toLocaleString("en-IN");

  } catch (error) {

    console.error("Metal rate error:", error);

    if (gold24Element) gold24Element.textContent = "Unavailable";
    if (gold22Element) gold22Element.textContent = "Unavailable";
    if (silverElement) silverElement.textContent = "Unavailable";
    if (silverKgElement) silverKgElement.textContent = "Per kg: Unavailable";

    rateStatus.textContent =
      "Live rates are currently unavailable. Please check again later.";

  } finally {

    if (refreshRatesButton) {
      refreshRatesButton.disabled = false;
      refreshRatesButton.textContent = "↻ Refresh Rates";
    }

  }

}


/* Refresh rates when the visitor clicks */

if (refreshRatesButton) {

  refreshRatesButton.addEventListener("click", loadMetalRates);

}


/* Load rates when the page opens */

loadMetalRates();


/* Refresh every hour */

setInterval(loadMetalRates, 60 * 60 * 1000);


const WHATSAPP_NUMBER = "919437141499";

const BULLION_API =
  "https://api.dharun.dev/v1/bullion";


// MOBILE MENU

const menuToggle =
  document.getElementById("menuToggle");

const mobileNav =
  document.getElementById("mobileNav");

const siteHeader =
  document.getElementById("siteHeader");


menuToggle?.addEventListener("click", () => {

  const isOpen =
    mobileNav.classList.toggle("open");

  menuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  menuToggle.setAttribute(
    "aria-label",
    isOpen
      ? "Close navigation menu"
      : "Open navigation menu"
  );

});


mobileNav?.querySelectorAll("a").forEach(link => {

  link.addEventListener("click", () => {

    mobileNav.classList.remove("open");

    menuToggle?.setAttribute(
      "aria-expanded",
      "false"
    );

  });

});


// HEADER SHADOW

window.addEventListener("scroll", () => {

  siteHeader?.classList.toggle(
    "scrolled",
    window.scrollY > 12
  );

}, { passive: true });


// COPYRIGHT YEAR

document.getElementById("year").textContent =
  new Date().getFullYear();


// GOLD AND SILVER RATE HELPERS

function collectRateRecords(value, output = [], depth = 0) {

  if (depth > 7 || value == null) {
    return output;
  }

  if (Array.isArray(value)) {

    value.forEach(item =>
      collectRateRecords(item, output, depth + 1)
    );

    return output;
  }

  if (typeof value === "object") {

    const keys = Object.keys(value)
      .map(key => key.toLowerCase());

    const hasRate = keys.some(key =>
      /rate|price|per_gram|pergram|per_10g|per_kg|perkg/.test(key)
    );

    const labelText = keys.join(" ");

    if (
      hasRate ||
      /gold|silver|999|916|995|750/.test(labelText)
    ) {
      output.push(value);
    }

    Object.values(value).forEach(item => {

      if (item && typeof item === "object") {
        collectRateRecords(item, output, depth + 1);
      }

    });

  }

  return output;
}


function normaliseKey(value) {

  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

}


function numericFrom(record, keys) {

  for (const [key, value] of Object.entries(record || {})) {

    if (keys.includes(normaliseKey(key))) {

      const number = Number(
        String(value).replace(/[₹,\s]/g, "")
      );

      if (Number.isFinite(number) && number > 0) {
        return number;
      }

    }

  }

  return null;
}


function recordText(record) {

  return Object.entries(record || {})
    .map(([key, value]) => `${key} ${value}`)
    .join(" ")
    .toLowerCase();

}


function findRate(records, metal, purity) {

  const matches = records.filter(record => {

    const text = recordText(record);

    const hasMetal =
      text.includes(metal);

    const hasPurity =
      new RegExp(`(^|[^0-9])${purity}([^0-9]|$)`)
        .test(text);

    return hasMetal && hasPurity;

  });

  return matches[0] || null;

}


function getDisplayRate(record, metal, unit) {

  if (!record) {
    return null;
  }

  const gramKeys = [
    "pricepergram",
    "ratepergram",
    "pergram",
    "gramrate",
    "pricegram",
    "rategram"
  ];

  const tenGramKeys = [
    "priceper10g",
    "rateper10g",
    "per10g",
    "priceper10grams",
    "rateper10grams"
  ];

  const kgKeys = [
    "priceperkg",
    "rateperkg",
    "perkg",
    "kilogramrate",
    "priceperkilogram",
    "rateperkilogram"
  ];

  const generalKeys = [
    "rate",
    "price",
    "value",
    "amount",
    "benchmarkrate",
    "benchmarkprice"
  ];

  const gram = numericFrom(record, gramKeys);
  const tenGram = numericFrom(record, tenGramKeys);
  const kg = numericFrom(record, kgKeys);
  const general = numericFrom(record, generalKeys);


  if (unit === "gram") {

    if (gram) return gram;

    if (metal === "silver" && kg) {
      return kg / 1000;
    }

    if (tenGram) {
      return tenGram / 10;
    }

    if (general) {

      const text = recordText(record);

      if (
        text.includes("kg") ||
        text.includes("kilogram")
      ) {
        return general / 1000;
      }

      if (
        text.includes("10g") ||
        text.includes("10 gram")
      ) {
        return general / 10;
      }

      return general;
    }

  } else {

    if (kg) return kg;

    if (gram) return gram * 1000;

    if (general) {

      const text = recordText(record);

      if (
        text.includes("gram") &&
        !text.includes("kilogram")
      ) {
        return general * 1000;
      }

      return general;
    }

  }

  return null;

}


// FORMAT INDIAN CURRENCY

function formatINR(value) {

  return new Intl.NumberFormat("en-IN", {

    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2

  }).format(value);

}


// DISPLAY RATE

function setRate(id, value) {

  const element =
    document.getElementById(id);

  if (element) {

    element.textContent =
      value == null
        ? "Unavailable"
        : formatINR(value);

  }

}


// LOAD LIVE RATES

async function loadMetalRates() {

  const status =
    document.getElementById("rateStatus");

  const updated =
    document.getElementById("rateUpdated");

  const refresh =
    document.getElementById("refreshRates");


  if (status) {
    status.textContent = "Updating rates…";
  }

  if (refresh) {
    refresh.disabled = true;
  }


  try {

    const response = await fetch(BULLION_API, {

      method: "GET",

      headers: {
        "Accept": "application/json"
      },

      cache: "no-store"

    });


    const body = await response.json();


    if (!response.ok) {

      throw new Error(
        body?.error?.message ||
        "Rate provider request failed"
      );

    }


    const records =
      collectRateRecords(body.data ?? body);


    const gold24Record =
      findRate(records, "gold", "999");

    const gold22Record =
      findRate(records, "gold", "916");

    const silverRecord =
      findRate(records, "silver", "999");


    const gold24 =
      getDisplayRate(gold24Record, "gold", "gram");

    const gold22 =
      getDisplayRate(gold22Record, "gold", "gram");

    const silverGram =
      getDisplayRate(silverRecord, "silver", "gram");

    const silverKg =
      getDisplayRate(silverRecord, "silver", "kg");


    setRate("gold24", gold24);
    setRate("gold22", gold22);
    setRate("silverGram", silverGram);
    setRate("silverKg", silverKg);


    const anyRate = [
      gold24,
      gold22,
      silverGram,
      silverKg
    ].some(value => value != null);


    if (!anyRate) {

      throw new Error(
        "Provider response format could not be matched."
      );

    }


    if (status) {

      status.textContent =
        "Rates loaded from IBJA benchmark data.";

    }


    const retrieved =
      body?.meta?.retrieved_at ||
      body?.meta?.retrieved ||
      body?.meta?.updated_at;


    if (updated) {

      updated.textContent = retrieved
        ? `Provider retrieval: ${new Date(retrieved).toLocaleString("en-IN")}`
        : `Checked: ${new Date().toLocaleString("en-IN")}`;

    }


  } catch (error) {

    setRate("gold24", null);
    setRate("gold22", null);
    setRate("silverGram", null);
    setRate("silverKg", null);


    if (status) {

      status.textContent =
        "Live rates are temporarily unavailable. Please try again.";

    }


    if (updated) {

      updated.textContent =
        "No sample or estimated prices are displayed.";

    }


    console.error(
      "Bullion rate error:",
      error
    );

  } finally {

    if (refresh) {
      refresh.disabled = false;
    }

  }

}


// REFRESH BUTTON

document
  .getElementById("refreshRates")
  ?.addEventListener("click", loadMetalRates);


// LOAD RATES ON PAGE OPEN

loadMetalRates();


// AUTOMATIC REFRESH EVERY HOUR

setInterval(
  loadMetalRates,
  60 * 60 * 1000
);


// WHATSAPP LINKS

document
  .querySelectorAll('a[href*="wa.me/"]')
  .forEach(link => {

    const url = new URL(link.href);

    url.pathname = `/${WHATSAPP_NUMBER}`;

    link.href = url.toString();

  });


// VIDEO FALLBACK

const heroVideo =
  document.querySelector(".hero-video");

heroVideo?.addEventListener("error", () => {

  heroVideo.style.display = "none";

});


// =============================================
// SHREE JEWELLERS — PREMIUM EDITION
// Complete Interactive JavaScript
// =============================================

document.addEventListener("DOMContentLoaded", () => {

  // -------------------------------------------
  // 1. BASIC SETTINGS
  // -------------------------------------------

  const WHATSAPP_NUMBER = "919437141499";

  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  // -------------------------------------------
  // 2. STICKY HEADER
  // -------------------------------------------

  const header = document.getElementById("siteHeader");

  function updateHeader() {
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 30);
    }
  }

  window.addEventListener("scroll", updateHeader);
  updateHeader();

  // -------------------------------------------
  // 3. MOBILE NAVIGATION
  // -------------------------------------------

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

  // -------------------------------------------
  // 4. BACKGROUND MUSIC
  // Autoplay with sound is restricted by browsers. Try immediately,
  // then retry on the visitor's first tap/click/key press.

  const heroMusic = document.getElementById("heroMusic");
  const musicToggle = document.getElementById("musicToggle");
  const musicIcon = document.getElementById("musicIcon");
  const musicText = document.getElementById("musicText");

  if (heroMusic && musicToggle) {
    heroMusic.loop = true;
    heroMusic.volume = 0.45;

    let userTurnedMusicOff = false;

    function updateMusicButton(playing) {
      musicToggle.setAttribute("aria-pressed", String(playing));
      if (musicIcon) musicIcon.textContent = playing ? "♫" : "♪";
      if (musicText) musicText.textContent = playing ? "MUSIC ON" : "MUSIC OFF";
    }

    async function startBackgroundMusic() {
      if (userTurnedMusicOff || !heroMusic.paused) return;
      try {
        await heroMusic.play();
        updateMusicButton(true);
      } catch (error) {
        updateMusicButton(false);
        // The browser may require a direct visitor gesture before audio.
      }
    }

    updateMusicButton(false);
    startBackgroundMusic();

    const unlockMusic = () => {
      startBackgroundMusic();
      document.removeEventListener("pointerdown", unlockMusic);
      document.removeEventListener("keydown", unlockMusic);
      document.removeEventListener("touchstart", unlockMusic);
    };
    document.addEventListener("pointerdown", unlockMusic, { once: true });
    document.addEventListener("keydown", unlockMusic, { once: true });
    document.addEventListener("touchstart", unlockMusic, { once: true, passive: true });

    musicToggle.addEventListener("click", async () => {
      if (!heroMusic.paused) {
        userTurnedMusicOff = true;
        heroMusic.pause();
        updateMusicButton(false);
        return;
      }

      userTurnedMusicOff = false;
      try {
        await heroMusic.play();
        updateMusicButton(true);
      } catch (error) {
        updateMusicButton(false);
        alert("Please check your device volume and confirm the music file is available.");
      }
    });

    heroMusic.addEventListener("play", () => updateMusicButton(true));
    heroMusic.addEventListener("pause", () => updateMusicButton(false));
    heroMusic.addEventListener("error", () => {
      updateMusicButton(false);
      console.error("Background audio failed to load:", heroMusic.currentSrc);
    });
  }

  // 5. CINEMATIC VIDEO PLAYBACK
  // Keep bridal-model.mp4 as the only hero video.
  // Autoplay the two showcase videos silently when they enter view.

  const heroVideo = document.getElementById("heroVideo");

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    const heroPlayback = heroVideo.play();
    if (heroPlayback) heroPlayback.catch(() => {});
  }

  const showcaseVideos = document.querySelectorAll(".showcase-video-grid video");

  showcaseVideos.forEach(video => {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;

    const playShowcaseVideo = () => {
      const playback = video.play();
      if (playback) playback.catch(() => {});
    };

    if ("IntersectionObserver" in window) {
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            playShowcaseVideo();
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.25 });

      videoObserver.observe(video);
    } else {
      playShowcaseVideo();
    }
  });

  // -------------------------------------------
  // 6. PRODUCT SEARCH
  // -------------------------------------------

  const productSearch = document.getElementById("productSearch");
  const productCards = [...document.querySelectorAll(".product-card")];
  const emptyMessage = document.getElementById("emptyMessage");

  let selectedFilter = "all";

  function filterProducts() {

    const searchText = productSearch
      ? productSearch.value.toLowerCase().trim()
      : "";

    let visibleCount = 0;

    productCards.forEach(card => {

      const category = card.dataset.category || "";
      const name = card.dataset.name || "";

      const matchesCategory =
        selectedFilter === "all" || category === selectedFilter;

      const matchesSearch =
        name.toLowerCase().includes(searchText) ||
        category.toLowerCase().includes(searchText);

      const shouldShow = matchesCategory && matchesSearch;

      card.style.display = shouldShow ? "" : "none";

      if (shouldShow) visibleCount++;
    });

    if (emptyMessage) {
      emptyMessage.hidden = visibleCount !== 0;
    }
  }

  if (productSearch) {
    productSearch.addEventListener("input", filterProducts);
  }

  // -------------------------------------------
  // 7. CATEGORY FILTERS
  // -------------------------------------------

  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      filterButtons.forEach(btn => btn.classList.remove("active"));

      button.classList.add("active");

      selectedFilter = button.dataset.filter || "all";

      filterProducts();
    });
  });

  // -------------------------------------------
  // 8. WISHLIST
  // -------------------------------------------

  const wishlistItems = document.getElementById("wishlistItems");
  const wishlistCount = document.getElementById("wishlistCount");

  let wishlist = [];

  try {
    wishlist = JSON.parse(localStorage.getItem("shreeWishlist")) || [];
  } catch (error) {
    wishlist = [];
  }

  function saveWishlist() {
    try {
      localStorage.setItem("shreeWishlist", JSON.stringify(wishlist));
    } catch (error) {
      console.warn("Wishlist could not be saved.");
    }
  }

  function renderWishlist() {

    if (!wishlistItems || !wishlistCount) return;

    wishlistCount.textContent = `(${wishlist.length})`;

    wishlistItems.innerHTML = "";

    if (wishlist.length === 0) {
      wishlistItems.innerHTML =
        '<p class="empty-wishlist">Your wishlist is waiting for something beautiful.</p>';
      return;
    }

    wishlist.forEach(item => {

      const card = document.createElement("div");
      card.className = "wishlist-item";

      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.name;

      const details = document.createElement("div");

      const title = document.createElement("h4");
      title.textContent = item.name;

      const remove = document.createElement("button");
      remove.className = "wishlist-remove";
      remove.textContent = "REMOVE ♡";

      remove.addEventListener("click", () => {
        wishlist = wishlist.filter(product => product.id !== item.id);
        saveWishlist();
        renderWishlist();
        updateWishlistButtons();
      });

      details.append(title, remove);
      card.append(image, details);
      wishlistItems.appendChild(card);
    });
  }

  function updateWishlistButtons() {

    document.querySelectorAll(".product-card").forEach(card => {

      const button = card.querySelector(".wishlist-btn");

      if (!button) return;

      const id = card.dataset.name;

      const isSaved = wishlist.some(item => item.id === id);

      button.classList.toggle("active", isSaved);
      button.textContent = isSaved ? "♥" : "♡";
      button.setAttribute(
        "aria-label",
        isSaved ? "Remove from wishlist" : "Add to wishlist"
      );
    });
  }

  document.querySelectorAll(".product-card").forEach(card => {

    const button = card.querySelector(".wishlist-btn");

    if (!button) return;

    button.addEventListener("click", () => {

      const id = card.dataset.name;
      const image = card.querySelector("img")?.src || "";

      const existing = wishlist.find(item => item.id === id);

      if (existing) {
        wishlist = wishlist.filter(item => item.id !== id);
      } else {
        wishlist.push({
          id,
          name: id,
          image
        });
      }

      saveWishlist();
      renderWishlist();
      updateWishlistButtons();
    });
  });

  renderWishlist();
  updateWishlistButtons();

  // -------------------------------------------
  // 9. PRODUCT IMAGE ZOOM
  // -------------------------------------------

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".product-image").forEach(button => {

    button.addEventListener("click", () => {

      if (!lightbox || !lightboxImage) return;

      const imagePath = button.dataset.image;

      if (!imagePath) return;

      lightboxImage.src = imagePath;

      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");

      document.body.style.overflow = "hidden";
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightbox) {

    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLightbox();
  });

  // -------------------------------------------
  // 10. WHATSAPP PRODUCT ENQUIRY
  // -------------------------------------------

  document.querySelectorAll(".enquiry-btn").forEach(button => {

    button.addEventListener("click", () => {

      const product = button.dataset.product || "Jewellery";

      const message =
        `Hello SHREE JEWELLERS! I am interested in ${product}. Please share more details and availability.`;

      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(url, "_blank", "noopener,noreferrer");
    });
  });

  // -------------------------------------------
  // 11. GIFT FINDER
  // -------------------------------------------

  document.querySelectorAll("[data-gift]").forEach(button => {

    button.addEventListener("click", () => {

      const occasion = button.dataset.gift;

      const message =
        `Hello SHREE JEWELLERS! I am looking for a jewellery gift for ${occasion}. Please suggest some designs.`;

      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(url, "_blank", "noopener,noreferrer");
    });
  });

  // -------------------------------------------
  // 12. APPOINTMENT FORM
  // -------------------------------------------

  const appointmentForm = document.getElementById("appointmentForm");
  const visitDate = document.getElementById("visitDate");

  if (visitDate) {
    const today = new Date();
    const localToday = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    visitDate.min = localToday;
  }

  if (appointmentForm) {

    appointmentForm.addEventListener("submit", event => {

      event.preventDefault();

      const name = document.getElementById("customerName").value.trim();
      const date = visitDate.value;
      const purpose = document.getElementById("visitPurpose").value;

      if (!name || !date || !purpose) {
        alert("Please fill in all appointment details.");
        return;
      }

      if (date < visitDate.min) {
        alert("Please select today or a future date.");
        return;
      }

      const message =
        `Hello SHREE JEWELLERS!\n\nI would like to request a store visit.\n\nName: ${name}\nPreferred Date: ${date}\nPurpose: ${purpose}\n\nPlease confirm availability.`;

      const url =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  // -------------------------------------------
  // 13. TESTIMONIAL SLIDER
  // -------------------------------------------

  const testimonials = [
    {
      text: "Every beautiful piece tells a story. Discover yours at SHREE JEWELLERS.",
      author: "SHREE JEWELLERS"
    },
    {
      text: "Tradition, elegance and beauty come together in every special moment.",
      author: "SHREE JEWELLERS"
    },
    {
      text: "Celebrate your precious moments with timeless jewellery.",
      author: "SHREE JEWELLERS"
    }
  ];

  let testimonialIndex = 0;

  const testimonialText = document.getElementById("testimonialText");
  const testimonialAuthor = document.getElementById("testimonialAuthor");

  function showTestimonial() {

    if (!testimonialText || !testimonialAuthor) return;

    testimonialText.textContent = testimonials[testimonialIndex].text;
    testimonialAuthor.textContent = testimonials[testimonialIndex].author;
  }

  function changeTestimonial(direction) {

    testimonialIndex =
      (testimonialIndex + direction + testimonials.length) %
      testimonials.length;

    showTestimonial();
  }

  document.getElementById("testimonialPrev")?.addEventListener(
    "click",
    () => changeTestimonial(-1)
  );

  document.getElementById("testimonialNext")?.addEventListener(
    "click",
    () => changeTestimonial(1)
  );

  // -------------------------------------------
  // 14. DARK / LIGHT MODE
  // -------------------------------------------

  const themeToggle = document.getElementById("themeToggle");

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("shreeTheme") || "light";
  } catch (error) {
    savedTheme = "light";
  }

  function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {
      themeToggle.textContent = isDark ? "☀" : "☾";
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  applyTheme(savedTheme);

  if (themeToggle) {

    themeToggle.addEventListener("click", () => {

      const nextTheme = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("shreeTheme", nextTheme);
      } catch (error) {
        console.warn("Theme preference could not be saved.");
      }
    });
  }

  // -------------------------------------------
  // 15. SCROLL REVEAL ANIMATIONS
  // -------------------------------------------

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });

    }, {
      threshold: 0.12
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add("visible");
    });
  }

  // -------------------------------------------
  // 16. BACK TO TOP
  // -------------------------------------------

  const backToTop = document.getElementById("backToTop");

  function updateBackToTop() {

    if (!backToTop) return;

    backToTop.classList.toggle("visible", window.scrollY > 500);
  }

  window.addEventListener("scroll", updateBackToTop);
  updateBackToTop();

  if (backToTop) {

    backToTop.addEventListener("click", () => {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  // -------------------------------------------
  // 17. RECENTLY VIEWED PRODUCTS
  // -------------------------------------------

  const recentlyViewed = [];

  document.querySelectorAll(".product-image").forEach(button => {

    button.addEventListener("click", () => {

      const card = button.closest(".product-card");

      if (!card) return;

      const name = card.dataset.name;

      if (!name) return;

      const existingIndex = recentlyViewed.indexOf(name);

      if (existingIndex !== -1) {
        recentlyViewed.splice(existingIndex, 1);
      }

      recentlyViewed.unshift(name);

      if (recentlyViewed.length > 5) {
        recentlyViewed.pop();
      }

      try {
        sessionStorage.setItem(
          "shreeRecentlyViewed",
          JSON.stringify(recentlyViewed)
        );
      } catch (error) {
        console.warn("Recently viewed list could not be saved.");
      }
    });
  });

  // -------------------------------------------
  // 18. GOLD AND SILVER RATE PLACEHOLDER
  // -------------------------------------------

  const refreshRates = document.getElementById("refreshRates");
  const rateStatus = document.getElementById("rateStatus");

  if (refreshRates) {

    refreshRates.addEventListener("click", () => {

      if (rateStatus) {
        rateStatus.textContent =
          "Live market data source is not connected yet. Please contact the store for today's rates.";
      }

    });
  }

  // -------------------------------------------
  // 19. IMAGE ERROR HANDLING
  // -------------------------------------------

  document.querySelectorAll("img").forEach(image => {

    image.addEventListener("error", () => {
      image.classList.add("image-error");
      console.warn("Image could not be loaded:", image.src);
    });
  });

  console.log("SHREE JEWELLERS website loaded successfully.");

});

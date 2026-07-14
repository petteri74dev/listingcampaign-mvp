(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const params = new URLSearchParams(window.location.search);
  const storageKey = `${config.siteId || "mvp"}:hero-variant`;

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Storage can be unavailable in strict privacy modes.
      }
    }
  };

  const forcedVariant = params.get("variant");
  let variant = forcedVariant === "a" || forcedVariant === "b"
    ? forcedVariant
    : safeStorage.get(storageKey);

  if (variant !== "a" && variant !== "b") {
    variant = Math.random() < 0.5 ? "a" : "b";
    safeStorage.set(storageKey, variant);
  }

  const copy = config.heroVariants?.[variant] || {};
  document.querySelectorAll("[data-copy-key]").forEach((element) => {
    const value = copy[element.dataset.copyKey];
    if (typeof value === "string" && value.trim()) {
      element.textContent = value;
    }
  });

  document.documentElement.dataset.variant = variant;

  if (config.analyticsDomain && !config.analyticsDomain.includes("YOUR_")) {
    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = config.analyticsDomain;
    script.src = "https://plausible.io/js/script.tagged-events.js";
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.plausible = window.plausible || function plausible() {
    window.plausible.q = window.plausible.q || [];
    window.plausible.q.push(arguments);
  };

  function track(name, props = {}) {
    const payload = {
      event: name,
      site: config.siteId || "unknown",
      variant,
      ...props
    };
    window.dataLayer.push(payload);
    if (config.analyticsDomain) {
      window.plausible(name, { props: payload });
    }
  }

  const attributionKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term"
  ];

  const attribution = {};
  attributionKeys.forEach((key) => {
    const fromUrl = params.get(key);
    const saved = safeStorage.get(`${config.siteId || "mvp"}:${key}`);
    const value = fromUrl || saved || "";
    if (fromUrl) safeStorage.set(`${config.siteId || "mvp"}:${key}`, fromUrl);
    attribution[key] = value;
  });

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    const values = {
      ...attribution,
      variant,
      page_url: window.location.href
    };

    Object.entries(values).forEach(([name, value]) => {
      let input = form.querySelector(`[name="${name}"]`);
      if (!input) {
        input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        form.appendChild(input);
      }
      input.value = value;
    });

    let started = false;
    form.addEventListener("input", () => {
      if (!started) {
        started = true;
        track("Lead Form Started");
      }
    });

    form.addEventListener("submit", () => {
      const plan = form.querySelector("[name=plan]")?.value || "not-set";
      track("Lead Submitted", { plan });
    });
  });

  document.querySelectorAll("[data-track]").forEach((element) => {
    element.addEventListener("click", () => {
      track(element.dataset.track, {
        label: element.dataset.trackLabel || element.textContent.trim().slice(0, 80)
      });
    });
  });

  document.querySelectorAll("[data-plan-select]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const plan = button.dataset.planSelect;
      const planInput = document.querySelector("[data-lead-form] [name=plan]");
      if (planInput && plan) planInput.value = plan;
      track("Plan Selected", { plan });

      const checkoutUrl = config.checkoutUrl?.[plan] || "";
      if (checkoutUrl) {
        event.preventDefault();
        track("Checkout Clicked", { plan });
        window.location.assign(checkoutUrl);
      }
    });
  });

  document.querySelectorAll("[data-booking-link]").forEach((link) => {
    if (config.bookingUrl) {
      link.href = config.bookingUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.addEventListener("click", () => track("Booking Clicked"));
    } else {
      link.href = "#pilot";
    }
  });

  const menuButton = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        menu.hidden = true;
      });
    });
  }

  const observed = new Set();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || observed.has(entry.target.id)) return;
        observed.add(entry.target.id);
        if (entry.target.id === "pricing") track("Pricing Viewed");
        if (entry.target.id === "demo") track("Demo Viewed");
      });
    }, { threshold: 0.35 });
    [document.getElementById("demo"), document.getElementById("pricing")]
      .filter(Boolean)
      .forEach((section) => observer.observe(section));
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
  document.querySelectorAll("[data-legal-name]").forEach((element) => {
    element.textContent = config.legalName || "Pilot operator to be configured";
  });
  document.querySelectorAll("[data-contact-email]").forEach((element) => {
    const email = config.contactEmail || "configure-before-launch@example.com";
    element.textContent = email;
    if (element.tagName === "A") element.href = `mailto:${email}`;
  });

  window.MvpCore = { track, variant };
  document.documentElement.classList.add("is-ready");
})();

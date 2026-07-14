(() => {
  "use strict";

  const studio = document.querySelector("[data-campaign-studio]");
  if (!studio) return;

  const fileInput = studio.querySelector("[data-demo-file]");
  const uploadLabel = studio.querySelector("[data-upload-label]");
  const uploadSummary = studio.querySelector("[data-upload-summary]");
  const uploadThumbs = studio.querySelector("[data-upload-thumbs]");
  const generateButton = studio.querySelector("[data-demo-generate]");
  const status = studio.querySelector("[data-demo-status]");
  const statusText = studio.querySelector("[data-status-text]");
  const addressInput = studio.querySelector("[data-demo-address]");
  const detailsInput = studio.querySelector("[data-demo-details]");
  const highlightInput = studio.querySelector("[data-demo-highlight]");
  const agentInput = studio.querySelector("[data-demo-agent]");
  const outputStage = studio.querySelector("[data-output-stage]");
  const styleOutput = studio.querySelector("[data-output-style]");
  const socialStatus = studio.querySelector("[data-social-status]");
  const socialMode = studio.querySelector("[data-social-mode]");
  const shareCampaignButton = studio.querySelector("[data-share-campaign]");
  const publishCampaignButton = studio.querySelector("[data-publish-campaign]");
  const socialApiBaseUrl = String(window.SITE_CONFIG?.socialApiBaseUrl || "")
    .trim()
    .replace(/\/$/, "");
  const themeClasses = [
    "theme-editorial",
    "theme-warm",
    "theme-luxury",
    "theme-nordic",
    "theme-bold",
    "theme-cinematic"
  ];

  const presets = {
    Editorial: {
      slug: "editorial",
      kicker: "JUST LISTED",
      hook: "A home designed for everyday life.",
      cta: "SAVE THIS HOME",
      accent: "#b8f36a",
      ink: "#13201a",
      surface: "#f5f3ed",
      filter: "saturate(0.92) contrast(1.04)"
    },
    Warm: {
      slug: "warm",
      kicker: "WELCOME HOME",
      hook: "Space to settle in. Room to make it yours.",
      cta: "COME TAKE A LOOK",
      accent: "#f27855",
      ink: "#43261f",
      surface: "#fff1df",
      filter: "saturate(1.08) sepia(0.1) brightness(1.03)"
    },
    Luxury: {
      slug: "luxury",
      kicker: "PRIVATE COLLECTION",
      hook: "An address of quiet distinction.",
      cta: "ARRANGE A PRIVATE VIEWING",
      accent: "#d8bb7c",
      ink: "#0b0b0a",
      surface: "#eee8dc",
      filter: "saturate(0.72) contrast(1.15) brightness(0.9)"
    },
    Nordic: {
      slug: "nordic",
      kicker: "NEW TO MARKET",
      hook: "Light, space and a view worth waking up to.",
      cta: "EXPLORE THE HOME",
      accent: "#1479a8",
      ink: "#102a36",
      surface: "#eef8fb",
      filter: "saturate(0.78) brightness(1.08) contrast(0.96)"
    },
    Bold: {
      slug: "bold",
      kicker: "STOP SCROLLING",
      hook: "This one deserves the full tour.",
      cta: "BOOK THE FIRST VIEWING",
      accent: "#f4ff3f",
      ink: "#2118d8",
      surface: "#f4ff3f",
      filter: "saturate(1.24) contrast(1.12)"
    },
    Cinematic: {
      slug: "cinematic",
      kicker: "NOW SHOWING",
      hook: "Every room has a story. Start here.",
      cta: "WATCH THE FULL TOUR",
      accent: "#f0a45d",
      ink: "#260f17",
      surface: "#f6e9df",
      filter: "saturate(0.86) contrast(1.18) brightness(0.83)"
    }
  };

  let selectedFiles = [];
  let objectUrls = [];
  let started = false;
  let generated = false;

  function trackStart() {
    if (started) return;
    started = true;
    window.MvpCore?.track("Demo Started", { demo: "listing-campaign-studio" });
  }

  function currentStyleName() {
    return studio.querySelector("[name=listing-style]:checked")?.value || "Editorial";
  }

  function currentPreset() {
    return presets[currentStyleName()] || presets.Editorial;
  }

  function inputValue(input, fallback) {
    return input?.value.trim() || fallback;
  }

  function setStatus(message, complete) {
    status?.classList.toggle("is-complete", Boolean(complete));
    if (statusText) statusText.textContent = message;
  }

  function setAll(selector, value) {
    studio.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  }

  function addressTag(address) {
    const clean = address
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    return clean ? "#" + clean : "#NewListing";
  }

  function campaignCopy(address, details, highlight, agent, styleName) {
    const preset = presets[styleName] || presets.Editorial;
    const tag = addressTag(address);
    let caption = "";

    if (styleName === "Warm") {
      caption =
        "Welcome to " + address + ". " + highlight + " With " + details +
        ", this is a place to slow down, settle in and make your own. Message " +
        agent + " to arrange a private tour.";
    } else if (styleName === "Luxury") {
      caption =
        "Introducing " + address + ". " + highlight + " " + details +
        ". Private viewings are now available through " + agent + ".";
    } else if (styleName === "Nordic") {
      caption =
        address + ", clearly presented. " + highlight + " " + details +
        ". View the complete photo tour and contact " + agent + " for availability.";
    } else if (styleName === "Bold") {
      caption =
        "Stop scrolling — " + address + " is live. " + highlight +
        " Tour it now, save it for later and message " + agent + " before the first viewing slots go.";
    } else if (styleName === "Cinematic") {
      caption =
        "Now showing: " + address + ". " + highlight +
        " Step inside the full story and arrange a private viewing with " + agent + ".";
    } else {
      caption =
        "Now on the market: " + address + ". " + highlight + " " + details +
        ". Explore the full tour, save your favourite details and book a private viewing with " +
        agent + ".";
    }

    const hashtagSets = {
      Luxury: tag + " #PrivateListing #LuxuryRealEstate #PropertyPortfolio #PrivateViewing",
      Warm: tag + " #WelcomeHome #NewHome #HouseHunting #HomeInspiration",
      Nordic: tag + " #NordicHomes #ScandinavianLiving #PropertyDesign #NewListing",
      Bold: tag + " #MustSeeHome #PropertyTok #HouseTour #JustListed",
      Cinematic: tag + " #PropertyFilm #HomeTour #RealEstateVideo #NowShowing"
    };
    const hashtags = hashtagSets[styleName] ||
      tag + " #JustListed #NewListing #PropertyTour #RealEstate";

    return {
      kicker: preset.kicker,
      hook: preset.hook,
      cta: preset.cta,
      caption,
      hashtags,
      tiktok: "POV: you found " + address + ". " + preset.hook + " " + hashtags,
      email: "New listing: " + address + " — private viewing now available"
    };
  }

  function renderThumbnails() {
    if (!uploadThumbs) return;
    uploadThumbs.replaceChildren();

    objectUrls.forEach((url, index) => {
      const thumb = document.createElement("div");
      thumb.className = "upload-thumb";

      const image = document.createElement("img");
      image.src = url;
      image.alt = "";

      const label = document.createElement("span");
      label.textContent = String(index + 1).padStart(2, "0");

      thumb.append(image, label);
      uploadThumbs.append(thumb);
    });
  }

  function renderImages() {
    studio.querySelectorAll("[data-image-slot]").forEach((element) => {
      const requested = Number.parseInt(element.dataset.imageSlot || "0", 10);
      const url = objectUrls.length ? objectUrls[requested % objectUrls.length] : "";
      const imageValue = url ? 'url("' + url + '")' : "";
      element.style.backgroundImage =
        url && element.classList.contains("reel-scene")
          ? "linear-gradient(180deg, transparent, rgba(0,0,0,.66)), " + imageValue
          : imageValue;
      element.classList.toggle("has-upload", Boolean(url));
    });
  }

  function renderCampaign() {
    const address = inputValue(addressInput, "22 Seaview Road");
    const details = inputValue(detailsInput, "4 rooms · 2 baths · 148 m²");
    const highlight = inputValue(
      highlightInput,
      "Sea views, a private terrace and a bright open-plan living space."
    );
    const agent = inputValue(agentInput, "Alex Morgan");
    const styleName = currentStyleName();
    const preset = currentPreset();
    const copy = campaignCopy(address, details, highlight, agent, styleName);

    outputStage?.classList.remove(...themeClasses);
    outputStage?.classList.add("theme-" + preset.slug);
    if (styleOutput) styleOutput.textContent = styleName;

    setAll("[data-output-address]", address);
    setAll("[data-output-details]", details);
    setAll("[data-output-highlight]", highlight);
    setAll("[data-output-agent]", agent);
    setAll("[data-output-kicker]", copy.kicker);
    setAll("[data-output-hook]", copy.hook);
    setAll("[data-output-cta]", copy.cta);
    setAll('[data-copy-content="caption"]', copy.caption);
    setAll('[data-copy-content="hashtags"]', copy.hashtags);
    setAll('[data-copy-content="tiktok"]', copy.tiktok);
    setAll('[data-copy-content="email"]', copy.email);
    renderImages();
  }

  function revokeImages() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
  }

  fileInput?.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []).slice(0, 6);
    if (!files.length) return;

    trackStart();
    revokeImages();
    selectedFiles = files;
    objectUrls = files.map((file) => URL.createObjectURL(file));

    if (uploadLabel) {
      uploadLabel.textContent = files.length === 1
        ? "1 photo loaded — add more"
        : files.length + " photos loaded";
    }
    if (uploadSummary) {
      uploadSummary.textContent =
        files.length + " source photo" + (files.length === 1 ? "" : "s") +
        " ready for channel-specific crops.";
    }

    renderThumbnails();
    renderCampaign();
    setStatus(files.length + " photos ready — build the campaign", false);
  });

  [addressInput, detailsInput, highlightInput, agentInput].forEach((input) => {
    input?.addEventListener("input", () => {
      trackStart();
      if (generated) renderCampaign();
    });
  });

  studio.querySelectorAll("[name=listing-style]").forEach((input) => {
    input.addEventListener("change", () => {
      trackStart();
      renderCampaign();
      if (generated) {
        setStatus(currentStyleName() + " campaign system applied", true);
      }
    });
  });

  generateButton?.addEventListener("click", () => {
    trackStart();
    generateButton.disabled = true;
    generateButton.textContent = "Building 8 campaign assets…";
    setStatus("Preparing channel layouts and copy", false);
    outputStage?.classList.add("is-processing");

    window.setTimeout(() => {
      renderCampaign();
      generated = true;
      outputStage?.classList.remove("is-processing");
      outputStage?.classList.add("is-generated");
      generateButton.disabled = false;
      generateButton.textContent = "Regenerate campaign";
      setStatus("8 campaign assets ready", true);

      window.MvpCore?.track("Demo Completed", {
        demo: "listing-campaign-studio",
        style: currentStyleName(),
        uploaded_images: selectedFiles.length,
        generated_assets: 8
      });
    }, 700);
  });

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = value;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.append(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  studio.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = button.dataset.copyTarget;
      const content = studio.querySelector('[data-copy-content="' + target + '"]');
      const value = content?.textContent.trim();
      if (!value) return;

      const original = button.textContent;
      try {
        await copyText(value);
        button.textContent = "Copied";
        setStatus("Copy added to clipboard", true);
        window.MvpCore?.track("Campaign Copy Copied", { type: target });
      } catch {
        button.textContent = "Select text";
        setStatus("Clipboard access was blocked", false);
      }
      window.setTimeout(() => {
        button.textContent = original;
      }, 1400);
    });
  });

  function loadImage(url) {
    return new Promise((resolve) => {
      if (!url) {
        resolve(null);
        return;
      }

      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = url;
    });
  }

  function drawCover(context, image, width, height) {
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(
      image,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
  }

  function drawPlaceholder(context, width, height) {
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#a9bdb0");
    background.addColorStop(0.42, "#708d7a");
    background.addColorStop(0.43, "#e9e3d7");
    background.addColorStop(0.78, "#e9e3d7");
    background.addColorStop(0.79, "#587262");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    let line = "";
    let currentY = y;
    let lines = 0;

    for (let index = 0; index < words.length; index += 1) {
      const test = line ? line + " " + words[index] : words[index];
      if (context.measureText(test).width > maxWidth && line) {
        context.fillText(line, x, currentY);
        currentY += lineHeight;
        lines += 1;
        line = words[index];
        if (lines >= maxLines - 1) break;
      } else {
        line = test;
      }
    }

    if (line && lines < maxLines) context.fillText(line, x, currentY);
  }

  async function buildCanvas(type) {
    const dimensions = {
      feed: [1080, 1350],
      story: [1080, 1920],
      carousel: [1080, 1080],
      tiktok: [1080, 1920]
    };
    const indexes = { feed: 0, story: 1, carousel: 2, tiktok: 2 };
    const size = dimensions[type] || dimensions.feed;
    const canvas = document.createElement("canvas");
    canvas.width = size[0];
    canvas.height = size[1];
    const context = canvas.getContext("2d");

    const address = inputValue(addressInput, "22 Seaview Road");
    const details = inputValue(detailsInput, "4 rooms · 2 baths · 148 m²");
    const highlight = inputValue(
      highlightInput,
      "Sea views, a private terrace and a bright open-plan living space."
    );
    const preset = currentPreset();
    const styleName = currentStyleName();
    const copy = campaignCopy(
      address,
      details,
      highlight,
      inputValue(agentInput, "Alex Morgan"),
      styleName
    );
    const imageUrl = objectUrls.length
      ? objectUrls[indexes[type] % objectUrls.length]
      : "";
    const image = await loadImage(imageUrl);

    context.save();
    context.filter = preset.filter;
    if (image) drawCover(context, image, canvas.width, canvas.height);
    else drawPlaceholder(context, canvas.width, canvas.height);
    context.restore();

    const vertical = type === "story" || type === "tiktok";
    const darkStyle = styleName === "Luxury" || styleName === "Cinematic";

    if (styleName === "Editorial") {
      const panelHeight = vertical ? 560 : type === "carousel" ? 370 : 430;
      context.fillStyle = preset.surface;
      context.fillRect(0, canvas.height - panelHeight, canvas.width, panelHeight);
      context.fillStyle = preset.accent;
      context.fillRect(70, canvas.height - panelHeight + 58, 94, 12);
      context.fillStyle = preset.ink;
    } else if (styleName === "Warm") {
      context.fillStyle = "rgba(242,120,85,.20)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const panelHeight = vertical ? 650 : type === "carousel" ? 430 : 480;
      roundedRect(context, 64, canvas.height - panelHeight - 64, canvas.width - 128, panelHeight, 46);
      context.fillStyle = "rgba(255,241,223,.94)";
      context.fill();
      context.fillStyle = preset.ink;
    } else if (styleName === "Nordic") {
      const panelHeight = vertical ? 610 : type === "carousel" ? 390 : 455;
      context.fillStyle = "rgba(238,248,251,.96)";
      context.fillRect(0, canvas.height - panelHeight, canvas.width, panelHeight);
      context.fillStyle = preset.accent;
      context.fillRect(0, canvas.height - panelHeight, 24, panelHeight);
      context.fillRect(72, canvas.height - panelHeight + 58, 170, 5);
      context.fillStyle = preset.ink;
    } else if (styleName === "Bold") {
      const panelHeight = vertical ? 650 : type === "carousel" ? 420 : 500;
      context.fillStyle = "rgba(33,24,216,.16)";
      context.fillRect(0, 0, canvas.width, canvas.height - panelHeight);
      context.fillStyle = preset.surface;
      context.fillRect(0, canvas.height - panelHeight, canvas.width, panelHeight);
      context.fillStyle = preset.ink;
      context.fillRect(0, canvas.height - panelHeight, canvas.width, 26);
      context.fillStyle = preset.ink;
    } else if (styleName === "Cinematic") {
      const shade = context.createLinearGradient(0, canvas.height * 0.25, 0, canvas.height);
      shade.addColorStop(0, "rgba(38,15,23,.08)");
      shade.addColorStop(1, "rgba(38,15,23,.94)");
      context.fillStyle = shade;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(17,6,10,.92)";
      context.fillRect(0, 0, canvas.width, vertical ? 118 : 82);
      context.fillRect(0, canvas.height - (vertical ? 118 : 82), canvas.width, vertical ? 118 : 82);
      context.fillStyle = "#ffffff";
    } else {
      const shade = context.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,.86)");
      context.fillStyle = shade;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = preset.accent;
      context.lineWidth = 3;
      context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
      context.fillStyle = "#ffffff";
    }

    const margin = styleName === "Warm" ? 118 : styleName === "Bold" ? 64 : 72;
    const panelY = vertical
      ? canvas.height - 470
      : type === "carousel"
        ? canvas.height - 285
        : canvas.height - 330;

    context.font = "700 30px Arial, sans-serif";
    context.fillStyle = styleName === "Bold" ? preset.ink : preset.accent;
    context.fillText(copy.kicker, margin, panelY);
    context.fillStyle = darkStyle ? "#ffffff" : preset.ink;
    context.font = darkStyle
      ? "500 66px Georgia, serif"
      : styleName === "Bold"
        ? "900 76px Arial, sans-serif"
        : "800 68px Arial, sans-serif";
    wrapText(context, address, margin, panelY + 88, canvas.width - margin * 2, 76, 2);

    context.font = "500 30px Arial, sans-serif";
    context.fillStyle = darkStyle ? "#eadfd9" : preset.ink;
    wrapText(context, details, margin, panelY + 190, canvas.width - margin * 2, 42, 2);

    context.font = "700 25px Arial, sans-serif";
    context.fillStyle = styleName === "Bold" ? preset.ink : preset.accent;
    context.fillText(copy.cta, margin, canvas.height - 92);
    context.font = "800 23px Arial, sans-serif";
    context.fillStyle = darkStyle ? "#ffffff" : preset.ink;
    context.fillText("LISTINGTWIN × YOUR BRAND", 70, 88);
    return canvas;
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function assetFilename(type) {
    return slugify(inputValue(addressInput, "listing")) + "-" + type + "-" +
      currentPreset().slug + ".png";
  }

  async function renderAssetBlob(type) {
    const canvas = await buildCanvas(type);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG rendering failed");
    return blob;
  }

  function downloadBlob(blob, filename) {
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  }

  function setSocialStatus(message, tone) {
    if (!socialStatus) return;
    socialStatus.textContent = message;
    socialStatus.classList.toggle("is-success", tone === "success");
    socialStatus.classList.toggle("is-warning", tone === "warning");
  }

  async function shareAsset(type) {
    const blob = await renderAssetBlob(type);
    const file = new File([blob], assetFilename(type), { type: "image/png" });
    const canShareFile = Boolean(
      navigator.share && navigator.canShare && navigator.canShare({ files: [file] })
    );

    if (!canShareFile) {
      setSocialStatus(
        "This browser cannot hand image files to social apps. Open the live site on your phone, or connect an account for direct publishing.",
        "warning"
      );
      setStatus("Phone file sharing is not available in this browser", false);
      return false;
    }

    const address = inputValue(addressInput, "22 Seaview Road");
    const copy = campaignCopy(
      address,
      inputValue(detailsInput, "4 rooms · 2 baths · 148 m²"),
      inputValue(highlightInput, "Sea views, a private terrace and a bright open-plan living space."),
      inputValue(agentInput, "Alex Morgan"),
      currentStyleName()
    );

    await navigator.share({
      files: [file],
      title: address,
      text: type === "tiktok" ? copy.tiktok : copy.caption
    });
    setSocialStatus("Creative handed to your phone's share sheet.", "success");
    setStatus(type + " creative shared", true);
    window.MvpCore?.track("Campaign Asset Shared", { type, style: currentStyleName() });
    return true;
  }

  studio.querySelectorAll("[data-download-asset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const type = button.dataset.downloadAsset || "feed";
      const original = button.textContent;
      button.disabled = true;
      button.textContent = "Rendering…";

      try {
        const blob = await renderAssetBlob(type);
        downloadBlob(blob, assetFilename(type));
        button.textContent = "Downloaded";
        setStatus(type + " PNG exported", true);
        window.MvpCore?.track("Campaign Asset Downloaded", {
          type,
          style: currentStyleName()
        });
      } catch {
        button.textContent = "Try again";
        setStatus("Could not export the PNG", false);
      }

      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = original;
      }, 1500);
    });
  });

  studio.querySelectorAll("[data-share-asset]").forEach((button) => {
    button.addEventListener("click", async () => {
      const type = button.dataset.shareAsset || "tiktok";
      const original = button.textContent;
      button.disabled = true;
      button.textContent = "Opening…";
      try {
        const shared = await shareAsset(type);
        button.textContent = shared ? "Shared" : "Use phone";
      } catch (error) {
        button.textContent = error?.name === "AbortError" ? "Cancelled" : "Try again";
        if (error?.name !== "AbortError") {
          setSocialStatus("The share sheet could not be opened. Try again on your phone.", "warning");
        }
      }
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = original;
      }, 1600);
    });
  });

  shareCampaignButton?.addEventListener("click", async () => {
    const original = shareCampaignButton.textContent;
    shareCampaignButton.disabled = true;
    shareCampaignButton.textContent = "Preparing vertical creative…";
    try {
      const shared = await shareAsset("tiktok");
      shareCampaignButton.textContent = shared ? "Shared to phone" : "Open on your phone";
    } catch (error) {
      shareCampaignButton.textContent = error?.name === "AbortError" ? "Share cancelled" : "Try again";
    }
    window.setTimeout(() => {
      shareCampaignButton.disabled = false;
      shareCampaignButton.textContent = original;
    }, 1800);
  });

  const providerNames = {
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook Page",
    youtube: "YouTube"
  };

  function markProviderConnected(provider) {
    const channel = studio.querySelector('[data-social-provider="' + provider + '"]');
    const button = channel?.querySelector("[data-connect-provider]");
    if (!channel || !button) return;
    channel.classList.add("is-connected");
    button.textContent = "Connected";
    button.disabled = true;
  }

  studio.querySelectorAll("[data-connect-provider]").forEach((button) => {
    button.addEventListener("click", () => {
      const provider = button.dataset.connectProvider;
      if (!provider) return;

      if (!socialApiBaseUrl) {
        setSocialStatus(
          providerNames[provider] +
            " connection is UI-ready. Add the secure social API URL in config.js to start the real OAuth flow.",
          "warning"
        );
        window.MvpCore?.track("Social Connect Requested", { provider, mode: "demo" });
        return;
      }

      const configuredReturnUrl = String(window.SITE_CONFIG?.socialReturnUrl || "").trim();
      const returnUrl = configuredReturnUrl || window.location.href.split("?")[0];
      const connectUrl = socialApiBaseUrl + "/oauth/" + encodeURIComponent(provider) +
        "/start?return_url=" + encodeURIComponent(returnUrl);
      window.MvpCore?.track("Social Connect Requested", { provider, mode: "live" });
      window.location.assign(connectUrl);
    });
  });

  publishCampaignButton?.addEventListener("click", async () => {
    const channels = Array.from(
      studio.querySelectorAll('[name="publish-channel"]:checked')
    ).map((input) => input.value);

    if (!channels.length) {
      setSocialStatus("Choose at least one publishing channel.", "warning");
      return;
    }

    if (!selectedFiles.length) {
      setSocialStatus("Add at least one real property photo before publishing.", "warning");
      return;
    }

    if (!socialApiBaseUrl) {
      setSocialStatus(
        "Direct publishing needs the OAuth backend. The button is wired, but no access tokens are ever placed in this static page.",
        "warning"
      );
      window.MvpCore?.track("Campaign Publish Requested", { channels, mode: "demo" });
      return;
    }

    const original = publishCampaignButton.textContent;
    publishCampaignButton.disabled = true;
    publishCampaignButton.textContent = "Preparing campaign…";
    setSocialStatus("Rendering and securely transferring the approved assets…");

    try {
      const address = inputValue(addressInput, "22 Seaview Road");
      const details = inputValue(detailsInput, "4 rooms · 2 baths · 148 m²");
      const highlight = inputValue(
        highlightInput,
        "Sea views, a private terrace and a bright open-plan living space."
      );
      const agent = inputValue(agentInput, "Alex Morgan");
      const copy = campaignCopy(address, details, highlight, agent, currentStyleName());
      const form = new FormData();
      form.append("metadata", JSON.stringify({
        address,
        details,
        highlight,
        agent,
        style: currentStyleName(),
        channels,
        copy
      }));

      for (const type of ["feed", "story", "carousel", "tiktok"]) {
        const blob = await renderAssetBlob(type);
        form.append("assets", blob, assetFilename(type));
      }

      const response = await fetch(socialApiBaseUrl + "/campaigns/publish", {
        method: "POST",
        body: form,
        credentials: "include"
      });
      if (!response.ok) throw new Error("Publish request failed with " + response.status);

      setSocialStatus("Campaign accepted for publishing. Platform status updates will appear here.", "success");
      publishCampaignButton.textContent = "Sent to channels";
      window.MvpCore?.track("Campaign Publish Requested", { channels, mode: "live" });
    } catch {
      setSocialStatus("Publishing failed before platform confirmation. No campaign was marked as live.", "warning");
      publishCampaignButton.textContent = "Try publishing again";
    }

    window.setTimeout(() => {
      publishCampaignButton.disabled = false;
      publishCampaignButton.textContent = original;
    }, 2200);
  });

  if (socialMode) socialMode.textContent = socialApiBaseUrl ? "LIVE OAUTH" : "DEMO MODE";
  const callbackParams = new URLSearchParams(window.location.search);
  const connectedProvider = callbackParams.get("social_connected");
  if (connectedProvider && providerNames[connectedProvider]) {
    markProviderConnected(connectedProvider);
    setSocialStatus(providerNames[connectedProvider] + " connected successfully.", "success");
  }

  window.addEventListener("beforeunload", revokeImages);
  renderCampaign();
})();

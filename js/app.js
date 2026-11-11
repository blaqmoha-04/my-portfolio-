(() => {
  const site = window.PORTFOLIO_SITE;
  const api = window.PortfolioAPI;
  const grid = document.querySelector("#project-grid");
  const filters = [...document.querySelectorAll(".filter-button")];
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");
  const contactForm = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  let projects = [];
  let currentProfile = site;
  let activeFilter = "all";

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    navigation.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });

  function safeLink(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, window.location.href);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch (error) {
      return "";
    }
    return "";
  }

  function renderProject(project, index) {
    const link = safeLink(project.url);
    const article = document.createElement(link ? "a" : "article");
    article.className = "project-card reveal";
    article.style.setProperty("--card-color", ["#dfd2c2", "#d4d9ce", "#e2cfbd", "#d7d5c7"][index % 4]);
    if (link) {
      article.href = link;
      article.target = "_blank";
      article.rel = "noopener noreferrer";
      article.setAttribute("aria-label", `${project.title} — opens in a new tab`);
    }

    const visual = document.createElement("div");
    visual.className = "project-visual";
    visual.setAttribute("aria-hidden", "true");
    const thumbnail = safeLink(project.thumbnail);
    if (thumbnail) {
      const image = document.createElement("img");
      image.src = thumbnail;
      image.alt = "";
      image.loading = "lazy";
      visual.append(image);
    }

    const type = document.createElement("span");
    type.className = "project-type";
    type.textContent = project.category === "graphic-design" ? "Graphic design" : "Software development";

    const info = document.createElement("div");
    info.className = "project-info";
    const text = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = project.title;
    const description = document.createElement("p");
    description.textContent = project.summary || "";
    text.append(title);
    if (description.textContent) text.append(description);

    const arrow = document.createElement("span");
    arrow.className = "project-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = link ? "↗" : "＋";
    info.append(text, arrow);
    article.append(visual, type, info);
    return article;
  }

  function renderProjects() {
    const visible = projects.filter((project) => activeFilter === "all" || project.category === activeFilter);
    grid.replaceChildren();
    if (visible.length) {
      visible.forEach((project, index) => grid.append(renderProject(project, index)));
      observeReveals();
      return;
    }

    const empty = document.createElement("div");
    empty.className = "empty-projects";
    const mark = document.createElement("span");
    mark.className = "empty-mark";
    mark.textContent = "✳";
    mark.setAttribute("aria-hidden", "true");
    const message = document.createElement("p");
    message.textContent = activeFilter === "all"
      ? "Projects will appear here as they’re ready to share. Nothing has been added yet."
      : `No ${activeFilter === "graphic-design" ? "graphic design" : "software development"} projects have been added yet.`;
    empty.append(mark, message);
    grid.append(empty);
  }

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      renderProjects();
    });
  });

  function renderSite(profile) {
    currentProfile = profile;
    const hero = profile.hero;
    const title = document.querySelector("#hero-title");
    title.textContent = profile.name;
    const headline = document.querySelector("#hero-headline");
    headline.replaceChildren();
    hero.headline.forEach((parts) => {
      const line = document.createElement("span");
      line.className = "headline-line";
      parts.forEach((part) => {
        const text = document.createElement("span");
        if (part.style === "serif" || part.style === "outline") text.className = `${part.style}-word`;
        text.textContent = part.text;
        line.append(text);
      });
      headline.append(line);
    });
    document.querySelector("#hero-eyebrow").textContent = hero.eyebrow;
    document.querySelector("#hero-intro").textContent = hero.intro;
    const profileImage = document.querySelector("#hero-profile-image");
    const profileImageUrl = safeLink(profile.profileImage?.url);
    profileImage.hidden = !profileImageUrl;
    profileImage.closest(".hero-art").classList.toggle("has-profile-image", Boolean(profileImageUrl));
    if (profileImageUrl) {
      profileImage.src = profileImageUrl;
      profileImage.alt = profile.profileImage.altText || `${profile.name} profile photo`;
    } else {
      profileImage.removeAttribute("src");
      profileImage.alt = "";
    }
    document.querySelector("#about-copy").textContent = profile.about;
    document.title = profile.website.title;
    document.querySelector("#meta-description").content = profile.website.description;
    const email = profile.email || "";
    const emailLink = document.querySelector("#email-link");
    emailLink.textContent = email || "Add an email address in js/data/site.js";
    emailLink.href = email ? `mailto:${email}` : "#contact";
    document.querySelector("#footer-tagline").textContent = profile.footerTagline;
    document.querySelector(".wordmark").setAttribute("aria-label", `${profile.name}, home`);
    document.querySelector(".footer-mark").setAttribute("aria-label", `${profile.name}, back to top`);
    document.querySelector("#footer-name").textContent = profile.name;

    const socialLinks = document.querySelector("#social-links");
    socialLinks.replaceChildren();
    profile.socialLinks.forEach((item) => {
      const url = safeLink(item.url);
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.label;
      socialLinks.append(link);
    });
    socialLinks.hidden = socialLinks.childElementCount === 0;

    const groups = document.querySelector("#skill-groups");
    groups.replaceChildren();
    profile.skills.forEach((group) => {
      const section = document.createElement("section");
      section.className = "skill-group";
      const heading = document.createElement("h3");
      heading.textContent = group.category;
      section.append(heading);
      if (group.items.length) {
        const list = document.createElement("ul");
        list.className = "skill-list";
        group.items.forEach((skill) => {
          const item = document.createElement("li");
          item.textContent = skill;
          list.append(item);
        });
        section.append(list);
      } else {
        const placeholder = document.createElement("p");
        placeholder.className = "skill-placeholder";
        placeholder.textContent = "Add your tools and specialties in js/data/site.js.";
        section.append(placeholder);
      }
      groups.append(section);
    });
  }

  function observeReveals() {
    const revealItems = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 })
    : null;

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    document.querySelector(".scroll-progress").style.width = `${progress}%`;
  }
  window.addEventListener("scroll", updateProgress, { passive: true });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const values = Object.fromEntries(new FormData(contactForm).entries());
    const button = contactForm.querySelector('button[type="submit"]');
    status.textContent = "";
    button.disabled = true;
    try {
      if (!api.isConfigured()) {
        const email = currentProfile.email;
        if (!email) {
          status.textContent = "Add your email to the portfolio profile to enable the email fallback.";
          return;
        }
        const subject = encodeURIComponent(`Portfolio enquiry from ${values.name}`);
        const body = encodeURIComponent(`${values.message}\n\nFrom: ${values.name} (${values.email})`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        status.textContent = "Your email app should open with your message ready to send.";
      } else {
        await api.sendContact(values);
        contactForm.reset();
        status.textContent = "Thanks — your message has been sent.";
      }
    } catch (error) {
      status.textContent = error instanceof api.ApiError
        ? error.message
        : "Your message could not be sent. Please try again later.";
    } finally {
      button.disabled = false;
    }
  });

  renderSite(site);
  const year = new Date().getFullYear();
  document.querySelector("#current-year").textContent = year;
  document.querySelector("#portfolio-year").textContent = year;
  if (api.isConfigured()) {
    api.getPortfolio().then(renderSite).catch((error) => {
      console.error("Could not load portfolio profile:", error);
      document.querySelector("#about-copy").textContent = "The portfolio profile could not be loaded. Please try again later.";
      document.querySelector("#skill-groups").textContent = "Skills could not be loaded.";
    });
  }
  api.getProjects().then((items) => {
    projects = Array.isArray(items) ? items : items.projects;
    if (!Array.isArray(projects)) throw new api.ApiError("The projects response has an invalid format.", 502);
    renderProjects();
  }).catch((error) => {
    console.error("Could not load portfolio projects:", error);
    grid.textContent = "Projects could not be loaded. Please try again later.";
  });
  updateProgress();
  document.documentElement.classList.add("reveal-ready");
})();

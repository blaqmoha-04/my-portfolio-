(() => {
  const site = window.PORTFOLIO_SITE;
  const api = window.PortfolioAPI;
  const grid = document.querySelector("#project-grid");
  const filters = [...document.querySelectorAll(".filter-button")];
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");
  const contactForm = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const dataStatus = document.querySelector("#portfolio-status");
  const connectButton = document.querySelector("#connect-backend");
  const connectionStatus = document.querySelector("#connection-status");
  const dataIssues = new Set();
  let projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  let currentProfile = site;
  let activeFilter = "all";
  let contactSubmitting = false;
  let backendConnected = false;

  function setDataIssue(source, message) {
    if (message) dataIssues.add(`${source}: ${message}`);
    else {
      for (const issue of dataIssues) {
        if (issue.startsWith(`${source}:`)) dataIssues.delete(issue);
      }
    }
    dataStatus.textContent = [...dataIssues].join(" ");
    dataStatus.hidden = dataIssues.size === 0;
  }

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

    const galleryItems = Array.isArray(project.gallery) ? project.gallery : [];
    const gallery = document.createElement("div");
    gallery.className = "project-gallery";
    gallery.setAttribute("aria-label", `${project.gallery?.length || 0} project gallery images`);
    galleryItems.forEach((item, imageIndex) => {
      const imageUrl = safeLink(item.url);
      if (!imageUrl) return;
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = item.altText || `${project.title} gallery image ${imageIndex + 1}`;
      image.loading = "lazy";
      gallery.append(image);
    });

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
    article.append(visual, type);
    if (gallery.childElementCount) article.append(gallery);
    article.append(info);
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
    emailLink.textContent = email || "Add an email address in the admin dashboard";
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
        placeholder.textContent = "Add accurate tools and specialties through the admin dashboard.";
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
    if (contactSubmitting || !contactForm.reportValidity()) return;
    if (api.isConfigured() && !backendConnected) {
      status.textContent = "Connect to your local backend before sending a message.";
      return;
    }
    const values = Object.fromEntries(new FormData(contactForm).entries());
    const button = contactForm.querySelector('button[type="submit"]');
    status.textContent = "";
    contactSubmitting = true;
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
      contactSubmitting = false;
      button.disabled = false;
    }
  });

  async function loadLiveContent() {
    const [profileResult, projectsResult] = await Promise.allSettled([
      api.getPortfolio(),
      api.getProjects()
    ]);
    let profileLoaded = false;
    let projectsLoaded = false;

    if (profileResult.status === "fulfilled") {
      try {
        renderSite(profileResult.value);
        setDataIssue("Profile", "");
        profileLoaded = true;
      } catch (error) {
        console.error("The portfolio profile response could not be displayed.", error);
        setDataIssue("Profile", "the live profile could not be displayed; saved profile content remains visible.");
      }
    } else {
      console.warn("Could not load live portfolio profile; keeping the saved fallback content.", profileResult.reason);
      setDataIssue("Profile", "showing saved fallback content because the live profile could not be loaded.");
    }

    if (projectsResult.status === "fulfilled") {
      const items = projectsResult.value;
      const liveProjects = Array.isArray(items) ? items : items?.projects;
      if (Array.isArray(liveProjects)) {
        projects = liveProjects;
        renderProjects();
        setDataIssue("Projects", "");
        projectsLoaded = true;
      } else {
        setDataIssue("Projects", "the live projects response was invalid; saved project content remains visible.");
      }
    } else {
      console.warn("Could not load live portfolio projects; keeping the saved fallback content.", projectsResult.reason);
      setDataIssue("Projects", "showing saved fallback content because live projects could not be loaded.");
    }
    grid.setAttribute("aria-busy", "false");
    return profileLoaded && projectsLoaded;
  }

  connectButton.addEventListener("click", async () => {
    if (!api.isConfigured()) {
      connectionStatus.textContent = "The local backend URL is not configured.";
      return;
    }
    connectButton.disabled = true;
    grid.setAttribute("aria-busy", "true");
    connectionStatus.textContent = "Checking the local backend. Allow Local Network Access if Chrome asks.";
    try {
      await api.checkHealth();
      backendConnected = true;
      connectionStatus.textContent = "Backend connected. Loading live portfolio and project data.";
      const allContentLoaded = await loadLiveContent();
      connectionStatus.textContent = allContentLoaded
        ? "Connected. Live portfolio and project data are loaded."
        : "Connected, but some live data could not be loaded. Saved content remains visible where needed.";
    } catch (error) {
      backendConnected = false;
      grid.setAttribute("aria-busy", "false");
      if (error instanceof api.ApiError && error.status === 403) {
        connectionStatus.textContent = "The backend rejected this site origin. Check its CORS allowlist.";
      } else if (error instanceof api.ApiError && error.status >= 500) {
        connectionStatus.textContent = "The backend responded, but its health check failed. Check that PostgreSQL is running.";
      } else if (error instanceof api.ApiError) {
        connectionStatus.textContent = `The backend could not connect: ${error.message}`;
      } else {
        connectionStatus.textContent = "Could not reach your local backend. Make sure it is running, this site is allowed by backend CORS, and allow Local Network Access if Chrome prompts.";
      }
    } finally {
      connectButton.disabled = false;
    }
  });

  renderSite(site);
  const year = new Date().getFullYear();
  document.querySelector("#current-year").textContent = year;
  document.querySelector("#portfolio-year").textContent = year;
  renderProjects();
  grid.setAttribute("aria-busy", "false");
  if (!api.isConfigured()) {
    connectButton.disabled = true;
    connectionStatus.textContent = "The local backend URL is not configured. Showing saved portfolio content.";
  }
  updateProgress();
  document.documentElement.classList.add("reveal-ready");
})();

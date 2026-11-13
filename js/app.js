(() => {
  const content = window.PORTFOLIO_CONTENT;
  const personal = content.personalInfo;
  const hero = content.heroContent;
  const about = content.aboutContent;
  const contact = content.contactInfo;
  const settings = content.websiteSettings;
  const api = window.PortfolioAPI;
  const grid = document.querySelector("#project-grid");
  const filters = [...document.querySelectorAll(".filter-button")];
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");
  const profileTransition = document.querySelector(".profile-transition");
  const profileStage = document.querySelector(".profile-stage");
  const navProfileSlot = document.querySelector(".nav-profile-slot");
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  let projects = [];
  let projectState = "loading";
  let activeFilter = "all";
  let profileFrame = 0;

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

  function setText(selector, value) {
    document.querySelector(selector).textContent = value || "";
  }

  function renderLines(element, lines, lineClass = "") {
    element.replaceChildren();
    lines.forEach((parts, index) => {
      if (index) {
        if (lineClass) {
          element.append(document.createElement("br"));
        } else {
          element.append(document.createElement("br"));
        }
      }
      const line = lineClass ? document.createElement("span") : element;
      if (lineClass) line.className = lineClass;
      parts.forEach((part) => {
        const span = document.createElement("span");
        if (part.style === "serif" || part.style === "outline") span.className = `${part.style}-word`;
        span.textContent = part.text;
        line.append(span);
      });
      if (lineClass) element.append(line);
    });
  }

  function renderSite() {
    document.title = settings.title;
    document.querySelector("#meta-description").content = settings.description;
    const profileImage = document.querySelector(".profile-transition-image");
    profileImage.src = personal.profileImage;
    profileImage.alt = `${personal.fullName} profile photo`;
    profileTransition.setAttribute("aria-label", `${personal.fullName}, home`);
    setText("#nav-logo-text", settings.monogram);
    document.querySelector(".nav-brand-mark").setAttribute("aria-label", `${personal.fullName}, home`);
    document.querySelector(".footer-mark").setAttribute("aria-label", `${personal.fullName}, back to top`);

    document.querySelectorAll("[data-nav-label]").forEach((link) => {
      link.textContent = settings.navigation[link.dataset.navLabel];
    });
    setText("#nav-contact-label", settings.navigation.contact);
    setText("#hero-title", personal.fullName);
    setText("#hero-eyebrow", personal.professionalTitle);
    setText("#hero-intro", hero.description);
    setText("#hero-work-action", hero.actions.work);
    setText("#hero-contact-action", hero.actions.contact);
    renderLines(document.querySelector("#hero-headline"), hero.headline, "headline-line");

    const ticker = document.querySelector("#ticker");
    ticker.setAttribute("aria-label", settings.tickerLabel);
    const track = ticker.querySelector(".ticker-track");
    const tickerItems = [...settings.ticker, ...settings.ticker];
    track.replaceChildren(...tickerItems.flatMap((label) => {
      const text = document.createElement("span");
      text.textContent = label;
      const mark = document.createElement("i");
      mark.textContent = settings.monogram;
      return [text, mark];
    }));

    setText("#work-eyebrow", settings.work.eyebrow);
    renderLines(document.querySelector("#work-title"), settings.work.heading);
    setText("#work-note", settings.work.note);
    filters.forEach((button) => {
      button.textContent = settings.work.filters[button.dataset.filter];
    });

    setText("#about-eyebrow", about.eyebrow);
    renderLines(document.querySelector("#about-title"), about.heading);
    setText("#about-copy", about.description);
    setText("#about-aside", about.aside);
    const values = document.querySelector("#values-row");
    values.setAttribute("aria-label", about.principles.join(", "));
    values.replaceChildren(...about.principles.flatMap((principle, index) => {
      const text = document.createElement("span");
      text.textContent = principle;
      if (index === about.principles.length - 1) return [text];
      const mark = document.createElement("span");
      mark.className = "value-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "↗";
      return [text, mark];
    }));

    setText("#skills-eyebrow", settings.skillsSection.eyebrow);
    renderLines(document.querySelector("#skills-title"), settings.skillsSection.heading);
    setText("#skills-note", settings.skillsSection.note);

    setText("#contact-eyebrow", contact.eyebrow);
    renderLines(document.querySelector("#contact-title"), contact.heading);
    setText("#contact-intro", contact.description);
    setText("#contact-name-label", contact.form.nameLabel);
    setText("#contact-email-label", contact.form.emailLabel);
    setText("#contact-message-label", contact.form.messageLabel);
    setText("#contact-submit-label", contact.form.submit);
    contactForm.elements.name.placeholder = contact.form.namePlaceholder;
    contactForm.elements.email.placeholder = contact.form.emailPlaceholder;
    contactForm.elements.message.placeholder = contact.form.messagePlaceholder;
    setText("#direct-email-label", contact.directEmailLabel);
    const emailLink = document.querySelector("#email-link");
    if (contact.email) {
      emailLink.href = `mailto:${contact.email}`;
      emailLink.textContent = contact.email;
      emailLink.hidden = false;
    } else {
      emailLink.removeAttribute("href");
      emailLink.textContent = "";
      emailLink.hidden = true;
    }
    setText("#contact-decoration", settings.monogram);

    const socialLinks = document.querySelector("#social-links");
    socialLinks.replaceChildren();
    content.socialLinks.forEach((item) => {
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
    content.skills.forEach((group, index) => {
      const section = document.createElement("section");
      section.className = "skill-group reveal";
      section.style.setProperty("--reveal-delay", `${(index % 2) * 70}ms`);
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
        placeholder.textContent = settings.skillsSection.empty;
        section.append(placeholder);
      }
      groups.append(section);
    });

    setText("#footer-logo-text", settings.monogram);
    setText("#footer-tagline", settings.footer.tagline);
    setText("#footer-name", settings.brandName);
    setText("#footer-rights", settings.footer.rights);
    const year = new Date().getFullYear();
    setText("#current-year", year);
    setText("#portfolio-year", year);
  }

  function renderProject(project, index) {
    const article = document.createElement("article");
    article.className = "project-card reveal";
    article.style.setProperty("--card-color", ["#dfd2c2", "#d4d9ce", "#e2cfbd", "#d7d5c7"][index % 4]);
    article.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);

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
    const category = settings.work.filters[project.category] || "Project";
    type.textContent = project.featured ? `${settings.work.featuredLabel} · ${category}` : category;

    const galleryItems = Array.isArray(project.gallery) ? project.gallery : [];
    const gallery = document.createElement("div");
    gallery.className = "project-gallery";
    gallery.setAttribute("aria-label", `${galleryItems.length} project gallery images`);
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
    text.append(title);
    if (project.summary) {
      const summary = document.createElement("p");
      summary.textContent = project.summary;
      text.append(summary);
    }
    const technologies = Array.isArray(project.technologies) ? project.technologies : project.tags;
    if (Array.isArray(technologies) && technologies.length) {
      const techList = document.createElement("p");
      techList.className = "project-technologies";
      techList.textContent = technologies.join(" · ");
      text.append(techList);
    }
    info.append(text);

    const links = document.createElement("div");
    links.className = "project-links";
    const demoUrl = safeLink(project.liveDemoUrl || project.url);
    const githubUrl = safeLink(project.githubUrl);
    [[demoUrl, settings.work.demoLink], [githubUrl, settings.work.githubLink]].forEach(([url, label]) => {
      if (!url) return;
      const link = document.createElement("a");
      link.className = "project-link";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = label;
      links.append(link);
    });

    article.append(visual, type);
    if (gallery.childElementCount) article.append(gallery);
    article.append(info);
    if (links.childElementCount) article.append(links);
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
    if (projectState === "loading") message.textContent = settings.work.loading;
    else if (projectState === "offline") message.textContent = settings.work.unavailable;
    else if (projectState === "not-configured") message.textContent = settings.work.notConfigured;
    else if (activeFilter === "all") message.textContent = settings.work.empty;
    else message.textContent = settings.work.emptyByFilter[activeFilter] || settings.work.empty;
    empty.append(mark, message);
    grid.append(empty);
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
    scheduleProfilePosition();
    if (window.innerWidth > 760) closeMenu();
  });

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

  if ("IntersectionObserver" in window) {
    const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const sectionsInView = new Set();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) sectionsInView.add(entry.target);
        else sectionsInView.delete(entry.target);
      });

      const currentSection = [...sectionsInView].sort((a, b) => {
        const marker = window.innerHeight * 0.35;
        return Math.abs(a.getBoundingClientRect().top - marker) - Math.abs(b.getBoundingClientRect().top - marker);
      })[0];
      navigationLinks.forEach((link) => {
        if (currentSection && link.hash === `#${currentSection.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

    navigationLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) sectionObserver.observe(section);
    });
  }

  function updateProfilePosition() {
    profileFrame = 0;
    const stage = profileStage.getBoundingClientRect();
    const slot = navProfileSlot.getBoundingClientRect();
    const header = document.querySelector(".site-header").getBoundingClientRect();
    const heroSize = parseFloat(window.getComputedStyle(profileTransition).fontSize);
    const navSize = slot.width;
    const scrollProgress = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? (window.scrollY > 0 ? 1 : 0)
      : Math.min(1, Math.max(0, window.scrollY / 320));
    const easedProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress);
    const startLeft = stage.left + (stage.width - heroSize) / 2;
    const startTop = stage.top + window.scrollY + (stage.height - heroSize) / 2;
    const targetLeft = slot.left + (slot.width - navSize) / 2;
    const targetTop = header.top + (header.height - navSize) / 2;
    const mix = (start, end) => start + (end - start) * easedProgress;

    const scale = mix(heroSize, navSize) / heroSize;
    profileTransition.style.transform = `translate3d(${mix(startLeft, targetLeft)}px, ${mix(startTop, targetTop)}px, 0) scale(${scale})`;
  }

  function scheduleProfilePosition() {
    if (profileFrame) return;
    profileFrame = window.requestAnimationFrame(updateProfilePosition);
  }

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0;
    document.querySelector(".scroll-progress").style.transform = `scaleX(${progress / 100})`;
    scheduleProfilePosition();
  }

  window.addEventListener("scroll", updateProgress, { passive: true });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    if (!contact.email) {
      formStatus.textContent = "Add your email address in frontend/js/data/portfolio.js to receive messages.";
      return;
    }
    const values = Object.fromEntries(new FormData(contactForm).entries());
    const subject = encodeURIComponent(`Portfolio enquiry from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\nFrom: ${values.name} (${values.email})`);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    formStatus.textContent = "Your email app should open with your message ready to send.";
  });

  async function loadProjects() {
    if (!api.isConfigured()) {
      projectState = "not-configured";
      grid.setAttribute("aria-busy", "false");
      renderProjects();
      return;
    }

    grid.setAttribute("aria-busy", "true");
    try {
      const response = await api.getProjects();
      const liveProjects = Array.isArray(response) ? response : response?.projects;
      if (!Array.isArray(liveProjects)) throw new Error("The project API response was invalid.");
      projects = liveProjects;
      projectState = "ready";
    } catch (error) {
      console.warn("Could not load projects; the rest of the portfolio is still available.", error);
      projects = [];
      projectState = "offline";
    } finally {
      grid.setAttribute("aria-busy", "false");
      renderProjects();
    }
  }

  renderSite();
  renderProjects();
  void loadProjects();
  updateProfilePosition();
  updateProgress();
  document.documentElement.classList.add("reveal-ready");
  observeReveals();
})();

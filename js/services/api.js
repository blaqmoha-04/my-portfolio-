(() => {
  const config = window.PORTFOLIO_CONFIG;
  const localProjects = window.PORTFOLIO_PROJECTS;

  class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  function apiUrl(path) {
    if (!config.apiBaseUrl) return null;
    return `${config.apiBaseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }

  async function request(path, options) {
    const url = apiUrl(path);
    if (!url) throw new ApiError("The portfolio API has not been configured.", 0);

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options && options.body ? { "Content-Type": "application/json" } : {}),
        ...(options && options.headers ? options.headers : {})
      }
    });

    if (!response.ok) {
      const message = `The portfolio API returned an error (${response.status}).`;
      throw new ApiError(message, response.status);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function requireAccessToken(accessToken) {
    if (!accessToken) throw new ApiError("An administrator access token is required.", 401);
    return { Authorization: `Bearer ${accessToken}` };
  }

  window.PortfolioAPI = Object.freeze({
    ApiError,
    isConfigured: () => Boolean(config.apiBaseUrl),
    getPortfolio: () => config.apiBaseUrl
      ? request("/api/portfolio")
      : Promise.resolve(window.PORTFOLIO_SITE),
    getProjects: () => config.apiBaseUrl
      ? request("/api/projects")
      : Promise.resolve(localProjects),
    createProject: (project, accessToken) => request("/api/projects", {
      method: "POST",
      headers: requireAccessToken(accessToken),
      body: JSON.stringify(project)
    }),
    updateProject: (projectId, project, accessToken) => request(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PUT",
      headers: requireAccessToken(accessToken),
      body: JSON.stringify(project)
    }),
    deleteProject: (projectId, accessToken) => request(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "DELETE",
      headers: requireAccessToken(accessToken)
    }),
    getContactMessages: (accessToken) => request("/api/admin/messages", {
      headers: requireAccessToken(accessToken)
    }),
    updateContactMessage: (messageId, updates, accessToken) => request(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
      method: "PATCH",
      headers: requireAccessToken(accessToken),
      body: JSON.stringify(updates)
    }),
    deleteContactMessage: (messageId, accessToken) => request(`/api/admin/messages/${encodeURIComponent(messageId)}`, {
      method: "DELETE",
      headers: requireAccessToken(accessToken)
    }),
    uploadProjectImage: async (file, accessToken) => {
      const url = apiUrl("/api/uploads");
      if (!url) throw new ApiError("The portfolio API has not been configured.", 0);
      if (!accessToken) throw new ApiError("An administrator access token is required.", 401);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        body: formData
      });
      if (!response.ok) throw new ApiError(`The portfolio API returned an error (${response.status}).`, response.status);
      return response.json();
    },
    updatePortfolio: (portfolio, accessToken) => request("/api/portfolio", {
      method: "PUT",
      headers: requireAccessToken(accessToken),
      body: JSON.stringify(portfolio)
    }),
    sendContact: (message) => request("/api/contact", {
      method: "POST",
      body: JSON.stringify(message)
    })
  });
})();

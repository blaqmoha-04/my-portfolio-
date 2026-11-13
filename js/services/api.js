(() => {
  const config = window.PORTFOLIO_CONFIG || { apiBaseUrl: "" };

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
      credentials: "omit",
      headers: {
        Accept: "application/json",
        ...(options && options.body ? { "Content-Type": "application/json" } : {}),
        ...(options && options.headers ? options.headers : {})
      }
    });

    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || `The portfolio API returned an error (${response.status}).`;
      throw new ApiError(message, response.status);
    }
    if (response.status === 204) return null;
    return payload;
  }

  window.PortfolioAPI = Object.freeze({
    ApiError,
    isConfigured: () => Boolean(config.apiBaseUrl),
    getProjects: () => request("/api/projects")
  });
})();

const localHostname = ["localhost", "127.0.0.1"].includes(window.location.hostname);

window.PORTFOLIO_CONFIG = Object.freeze({
  // Set this to the deployed project API origin before publishing the frontend.
  apiBaseUrl: localHostname ? "http://localhost:4000" : ""
});

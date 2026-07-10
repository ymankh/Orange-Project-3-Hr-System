(function () {
  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (error) {
      console.warn(`Ignoring invalid ${key} data.`, error);
      return [];
    }
  }

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`);
    return response.json();
  }

  window.demoData = { readArray, fetchJson };
})();

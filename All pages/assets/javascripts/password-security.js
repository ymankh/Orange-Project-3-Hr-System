(function () {
  const iterations = 210000;
  const encoder = new TextEncoder();

  function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }

  function fromBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  async function derive(password, salt, usages) {
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    return crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt, iterations },
      key,
      256
    );
  }

  async function hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = new Uint8Array(await derive(password, salt));
    return `pbkdf2-sha256$${iterations}$${toBase64(salt)}$${toBase64(hash)}`;
  }

  async function verifyPassword(password, storedValue) {
    if (!storedValue || !storedValue.startsWith("pbkdf2-sha256$")) return false;
    const [, storedIterations, saltValue, expectedValue] = storedValue.split("$");
    if (Number(storedIterations) !== iterations) return false;
    const actual = new Uint8Array(await derive(password, fromBase64(saltValue)));
    const expected = fromBase64(expectedValue);
    if (actual.length !== expected.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index++) {
      difference |= actual[index] ^ expected[index];
    }
    return difference === 0;
  }

  window.passwordSecurity = { hashPassword, verifyPassword };
})();

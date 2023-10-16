/**
 * The following code will be injected directly into the head of our document
 * so that we can determine the user's system theme before the page renders.
 *
 * For example, if a user has their operating system set to dark mode, this code prevents
 * them from seeing a flash of our default light theme before the rest of the
 * client-side JavaScript hydrates.
 *
 * This file is a JavaScript file instead of a TypeScript file because it gets stringified
 * before being injected into the head of the document and therefore will not get a chance to
 * be run through the TypeScript compiler.
 *
 * To learn more, check out the Github issue that inspired this solution:
 * https://github.com/vercel/next.js/discussions/53063#discussioncomment-6996549
 */
const code = function () {
  function applyColorScheme(colorScheme) {
    document.documentElement.style.setProperty("color-scheme", colorScheme);
    document.documentElement.dataset.theme = colorScheme;
  }

  // Apply initial color scheme
  let storedScheme;
  try {
    storedScheme = window.localStorage.getItem("color-scheme");
  } catch (err) {}
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const colorScheme = storedScheme ?? (mql.matches ? "dark" : "light");
  applyColorScheme(colorScheme);

  // Listen for color scheme changes from media query
  mql.addEventListener("change", (e) => {
    const newColorScheme = e.matches ? "dark" : "light";
    try {
      window.localStorage.removeItem("color-scheme");
    } catch (err) {}
    applyColorScheme(newColorScheme);
  });

  // Listen for color scheme changes from session storage
  window.addEventListener("storage", (e) => {
    if (e.key === "color-scheme") {
      applyColorScheme(e.newValue);
    }
  });
};

export const getTheme = `(${code.toString()})();`;

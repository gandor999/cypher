/**
 * Fetches DOM elements based on a configuration dictionary.
 * @param {Object} config - Keys are the returned variable names. Values are path strings.
 * @returns {Object} Dictionary of HTML elements.
 */
export function getUIElements(config) {
    const elements = {};
    for (const [key, path] of Object.entries(config)) {
        const parts = path.split('/');
        let currentEl = document;

        if (parts.length > 1) {
            currentEl = elements[parts[0]] || document;
            for (let i = 1; i < parts.length; i++) {
                if (currentEl) {
                    currentEl = currentEl.querySelector(parts[i]);
                }
            }
        } else {
            currentEl = document.querySelector(path);
        }

        elements[key] = currentEl;
    }
    return elements;
}

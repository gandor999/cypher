# Automation Steps Configuration

The Puppeteer Automation Engine uses a declarative JSON syntax to define what elements to interact with and in what sequence. The engine parses this file and uses an `ElementFactory` to map JSON types directly into TypeScript objects that execute interactions within the browser.

## Supported Types

- **`ButtonElement`**: Specifically targets buttons, anchors (`<a>`), and inputs of type `button` or `submit`. It intelligently prefixes `.class` selectors with `button` to ensure it only interacts with clickable UI elements.
- **`GenericElement`** (Default): A generic fallback used when the provided type is unknown. It attempts to search broadly across interactive tags (`a, button, span, div, input`).

## Available Metadata Fields

Provide these fields within the `metadata` object to help the engine uniquely identify elements on the page:

- **`id`**: (Highest priority) The exact HTML `id` of the element (e.g., `login-btn` maps to `#login-btn`).
- **`class`**: The CSS classes attached to the element. You can provide multiple classes separated by spaces (e.g., `btn primary` maps to `.btn.primary`).
- **`text`**: The precise inner text (or value/placeholder) visible on the element. The engine executes code natively inside the browser to scrape and compare element text.

## Example Configuration (`steps/steps.json`)

```json
[
  {
    "element": {
      "type": "ButtonElement",
      "metadata": {
        "text": "Log In",
        "id": "login-btn",
        "class": "btn-primary"
      }
    },
    "index": 0
  }
]
```

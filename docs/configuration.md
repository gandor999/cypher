# Automation Steps Configuration

The Puppeteer Automation Engine uses a declarative JSON syntax to define what elements to interact with and in what sequence. The engine parses this file and uses an `ElementFactory` to map JSON types directly into TypeScript objects that execute interactions within the browser.

## Supported Types

- **`ButtonElement`**: Specifically targets buttons, anchors (`<a>`), and inputs of type `button` or `submit`. It intelligently prefixes `.class` selectors with `button` to ensure it only interacts with clickable UI elements.
- **`InputElement`**: Targets `input` and `textarea` elements. Accepts an additional `value` metadata field that is typed into the field after it is clicked/focused.
- **`GenericElement`** (Default): A generic fallback used when the provided type is unknown or unrecognised. It attempts to search broadly across interactive tags (`a, button, span, div, input`).

## Available Metadata Fields

Provide these fields within the `metadata` object to help the engine uniquely identify elements on the page:

- **`id`**: (Highest priority) The exact HTML `id` of the element (e.g., `login-btn` maps to `#login-btn`).
- **`class`**: The CSS classes attached to the element. You can provide multiple classes separated by spaces (e.g., `btn primary` maps to `.btn.primary`).
- **`text`**: The precise inner text (or value/placeholder) visible on the element. The engine executes code natively inside the browser to scrape and compare element text.
- **`value`**: *(InputElement only)* The string to type into the input or textarea after it is focused.

## Selecting from Multiple Matches

- **`index`**: When the `metadata` criteria (like `class` or `text`) matches multiple elements on the page, the `index` property (0-indexed) dictates which specific element from the matched array to interact with. For example, if there are 3 "Submit" buttons, `"index": 1` will click the second one.

## Example Configuration (`steps/steps.json`)

```json
[
  {
    "element": {
      "type": "ButtonElement",
      "metadata": {
        "text": "Log In"
      }
    },
    "index": 0
  },
  {
    "element": {
      "type": "GenericElement",
      "metadata": {
        "class": "nsm7Bb-HzV7m-LgbsSe"
      }
    },
    "index": 0
  },
  {
    "element": {
      "type": "InputElement",
      "metadata": {
        "id": "identifierId",
        "value": "user@example.com"
      }
    },
    "index": 0
  }
]
```

## Selector Priority & Resolution

The engine resolves selectors in the following priority order:

1. **`id`** — generates `#<id>` (most specific; preferred when available)
2. **`class`** — generates `.class1.class2` (or `button.class1.class2` for `ButtonElement`)
3. **Fallback selector** — used when neither `id` nor `class` is provided:
   - `ButtonElement`: `button, a, input[type="button"], input[type="submit"]`
   - `InputElement`: `input, textarea`
   - `GenericElement`: `a, button, span, div, input`

When a `text` field is also specified, it is applied as a **post-query filter** on top of the selector results — the engine inspects each matched element's `innerText`, `value`, `placeholder`, or `aria-label` and keeps only those that contain the provided text.

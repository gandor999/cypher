# Puppeteer Automation Engine

A highly flexible, JSON-driven Node.js automation framework built with [Puppeteer](https://pptr.dev/), TypeScript, and Express.

This engine is capable of automating interactions on **any** website. It reads an ordered list of tasks from a JSON configuration file and dynamically parses, locates, and interacts with elements on the page using a rich Object-Oriented class factory.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- Google Chrome installed on your machine (optional; the script will fall back to Puppeteer's bundled Chromium if Chrome is not found in standard paths)

## Installation

Install the project dependencies:

```bash
npm install
```

## Configuration

Configure your environment variables in a `.env` file at the root of the project:

```env
TARGET_URL=https://example.com
STEPS_FILE_PATH=steps/steps.json
```

### Automation Steps (`steps/steps.json`)

Define exactly what elements to click and in what order using the `steps.json` file. The engine uses an `ElementFactory` to map JSON types directly into TypeScript objects.

For a full breakdown of the supported Element types, metadata fields, selector resolution logic, and configuration examples, please see the [Configuration Documentation](./docs/configuration.md).

## Running the Application

This application comes with a built-in Express server that provides a clean HTTP API and a modern web GUI to control the automation.

```bash
npm start
```

1. Open your browser to the URL displayed in your console (e.g. `http://localhost:3000`).
2. Click **Start Automation** to launch Chrome and execute the configured steps.
3. Click **Cancel Automation** to gracefully shut down the active browser instance.

## API Endpoints

The Express server exposes the following routes under `/api`:

| Method | Endpoint             | Description                                                                 |
|--------|----------------------|-----------------------------------------------------------------------------|
| `POST` | `/api/start-automation` | Starts the automation sequence asynchronously against `TARGET_URL`.      |
| `POST` | `/api/cancel-automation`| Gracefully closes the active browser instance.                           |
| `GET`  | `/api/inspect`          | Extracts a JSON AST of the live page's DOM and writes it to `logs/inspect.json`. |

## How It Works

1. **Locates Chrome**: The script searches standard Windows installation paths for Google Chrome.
2. **Launches Chrome**: It launches Google Chrome in headful mode (non-headless) so you can see and interact with the page alongside the automation.
3. **JSON Parsing**: The engine parses the configured `steps.json` file into typed `IClickStep` objects.
4. **Dynamic Execution**: Through an object-oriented factory (`ElementFactory`), the engine:
   - Builds the appropriate CSS selector from the step's `metadata`.
   - Searches all open tabs and frames for the matching element (with up to 15 seconds of retries).
   - Clicks the element and, for `InputElement` steps, types the configured `value` into the field.

## Project Structure

```
src/
├── browser/
│   ├── launcher.ts     # Browser lifecycle: launch, navigate, cancel, signal handling
│   ├── steps.ts        # Step loading (getSteps) and execution (executeSteps)
│   └── util.ts         # DOM AST extraction utility (getLivePageJsonAST)
├── classes/
│   ├── elements/
│   │   ├── BaseElement.ts      # Abstract base with shared selector logic
│   │   ├── ButtonElement.ts    # Targets buttons, anchors, and submit inputs
│   │   ├── InputElement.ts     # Targets inputs/textareas; types a value after click
│   │   ├── GenericElement.ts   # Broad fallback for any interactive element
│   │   ├── WaitElement.ts      # Pauses automation to allow for manual user intervention
│   │   ├── FlutterElement.ts   # Specialized element for interacting with Flutter Web canvas
│   │   └── ElementFactory.ts   # Factory: maps JSON type strings to class instances
│   └── exceptions/
│       ├── BaseException.ts        # Base error class with structured context
│       └── NavigationException.ts  # Thrown on browser navigation/execution failure
├── gui/
│   └── routes.ts       # Express router: /start-automation, /cancel-automation, /inspect
├── interfaces/
│   └── elements/
│       └── index.ts    # IElementConfig and IClickStep TypeScript interfaces
├── constants.ts        # Environment config, Chrome paths, and log message templates
├── logger.ts           # Winston logger configuration
└── index.ts            # Application entry point
```

## Testing

The project is thoroughly tested using Jest with **100% test coverage**.

```bash
npm run test
```

## Code Formatting

The project uses [Prettier](https://prettier.io/) for consistent code style, enforced automatically on commit via Husky.

```bash
# Check formatting
npm run lint

# Auto-fix formatting
npm run format
```

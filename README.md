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

For a full breakdown of the supported Element types, metadata fields, and configuration examples, please see the [Configuration Documentation](./docs/configuration.md).

## Running the Application

This application comes with a built-in Express server that provides a clean HTTP API and a modern web GUI to control the automation.

```bash
npm start
```

1. Open your browser to the URL displayed in your console (e.g. `http://localhost:3000`).
2. Click **Start Automation** to launch Chrome and execute the configured steps.
3. Click **Cancel Automation** to gracefully shut down the active browser instance.

## How It Works

1. **Locates Chrome**: The script searches standard installation paths for Google Chrome.
2. **Launches Chrome**: It launches Google Chrome in headful mode (non-headless) so you can see and interact with the page alongside the automation.
3. **JSON Parsing**: The engine parses the configured steps.json file.
4. **Dynamic Execution**: Through an object-oriented factory, the engine locates and safely evaluates elements directly inside the browser's DOM based on your configuration parameters.

## Testing

The project is thoroughly tested using Jest with **100% test coverage**.

```bash
npm run test
```

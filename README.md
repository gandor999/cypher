# GoTrade Puppeteer App

A Node.js application that uses [Puppeteer](https://pptr.dev/) to open Google Chrome (or its bundled Chromium) and navigate directly to GoTrade.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- Google Chrome installed on your machine (optional, the script will fall back to Puppeteer's bundled browser if not found)

## Installation

Install the project dependencies:

```bash
npm install
```

## Running the Application

To run the application and open GoTrade:

```bash
node index.js
```

## How It Works

1. **Locates Chrome**: The script searches standard installation paths on Windows for Google Chrome.
2. **Launches Chrome**: It launches Google Chrome (or bundled browser) in headful mode (non-headless) so you can see and interact with the page.
3. **Navigates to GoTrade**: It opens a new tab and navigates directly to the official [GoTrade website](https://www.heygotrade.com/).
4. **Interactive**: The browser remains open for you to log in, trade, or inspect the application.

## Customization

You can change the target URL or configure the launch options in `index.js`:

- **Change URL**: Update the `targetUrl` constant in `index.js`.
- **Change Headless mode**: Change `headless: false` to `headless: true` if you want the script to run invisibly in the background.

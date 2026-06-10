import path from "node:path";

import type { Page } from "@playwright/test";

export async function decodeLeaderQr(page: Page): Promise<string> {
  await page.getByTestId("leader-qr").waitFor({ state: "visible" });
  await page.addScriptTag({
    path: path.resolve("node_modules/@zxing/browser/umd/zxing-browser.min.js"),
  });
  return page.evaluate(async () => {
    const reader = new window.ZXingBrowser.BrowserQRCodeReader();
    const image = document.querySelector<HTMLImageElement>(
      '[data-testid="leader-qr"]',
    );
    if (!image) throw new Error("QR image not found");
    await image.decode();
    try {
      return (await reader.decodeFromImageUrl(image.src)).getText();
    } catch {
      // Retry from a larger raster when the browser decodes the SVG at its display size.
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas context unavailable");
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return reader.decodeFromCanvas(canvas).getText();
  });
}

declare global {
  interface Window {
    ZXingBrowser: {
      BrowserQRCodeReader: new () => {
        decodeFromImageUrl(url: string): Promise<{ getText(): string }>;
        decodeFromCanvas(canvas: HTMLCanvasElement): { getText(): string };
      };
    };
  }
}

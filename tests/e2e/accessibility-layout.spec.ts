import { expect, test } from "@playwright/test";

import { decodeLeaderQr } from "./helpers/qr";

async function createGame(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: /start game/i }).click();
  await expect(page.getByTestId("board-card")).toHaveCount(25);
}

for (const viewport of [
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
]) {
  test(`public board fits ${viewport.width}x${viewport.height}`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The layout matrix runs once in Chromium.",
    );
    await page.setViewportSize(viewport);
    await createGame(page);
    await expect(page.getByTestId("board-card")).toHaveCount(25);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(viewport.width);
    const clipped = await page
      .getByTestId("board-card")
      .evaluateAll((cards) =>
        cards.some(
          (card) =>
            card.scrollWidth > card.clientWidth ||
            card.scrollHeight > card.clientHeight,
        ),
      );
    expect(clipped).toBe(false);
  });
}

for (const width of [320, 375, 430]) {
  test(`leader key fits a ${width}px phone with enlarged text`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The layout matrix runs once in Chromium.",
    );
    await page.setViewportSize({ width, height: 844 });
    await createGame(page);
    const qrPath = await page.getByTestId("leader-qr").getAttribute("src");
    const svg = await (await page.request.get(qrPath!)).text();
    const response = await page.request.get(qrPath!);
    expect(response.ok()).toBe(true);
    expect(svg).toContain("<svg");

    // The complete leader navigation is covered in local-game-session; use its decoded URL via ZXing.
    const leaderUrl = await decodeLeaderQr(page);
    await page.goto(leaderUrl);
    await page.addStyleTag({ content: "html { font-size: 125%; }" });
    await expect(page.getByTestId("leader-card")).toHaveCount(25);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const publicBoardLink = page.getByRole("link", { name: /public board/i });
    await publicBoardLink.focus();
    await expect(publicBoardLink).toBeFocused();
  });
}

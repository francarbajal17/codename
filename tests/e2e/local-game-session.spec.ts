import { expect, test } from "@playwright/test";

import { decodeLeaderQr } from "./helpers/qr";

async function createGame(
  page: import("@playwright/test").Page,
  language: "English" | "Spanish",
) {
  await page.goto("/");
  await page.getByText(language, { exact: true }).click();
  await page.getByRole("button", { name: /start game/i }).click();
  await expect(page).toHaveURL(/\/games\/[0-9a-f-]{36}$/);
  await expect(page.getByTestId("board-card")).toHaveCount(25);
}

test("a host creates a secret-free public board and decodes its leader QR", async ({
  page,
  browserName,
}) => {
  await createGame(page, "English");

  await expect(page).toHaveURL(/\/games\/[0-9a-f-]{36}$/);
  await expect(page.getByTestId("board-card")).toHaveCount(25);
  await expect(page.getByText(/starts/i)).toBeVisible();

  const html = await page.content();
  expect(html).not.toContain("leaderToken");
  expect(html).not.toContain('"assignment"');

  const qr = page.getByTestId("leader-qr");
  await expect(qr).toBeVisible();
  const qrPath = await qr.getAttribute("src");
  expect(qrPath).toBeTruthy();
  const qrResponse = await page.request.get(qrPath!);
  expect(qrResponse.status(), await qrResponse.text()).toBe(200);
  expect(qrResponse.headers()["content-type"]).toContain("image/svg+xml");
  const decoded = await decodeLeaderQr(page);

  const gameId = page.url().split("/").at(-1);
  expect(decoded).toMatch(
    new RegExp(`/games/${gameId}/leader/[A-Za-z0-9_-]{43}$`),
  );

  const publicWords = await page.getByTestId("board-card").allTextContents();
  await page.reload();
  expect(await page.getByTestId("board-card").allTextContents()).toEqual(
    publicWords,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(decoded);
  await expect(
    page.getByRole("heading", { name: /leader key/i }),
  ).toBeVisible();
  await expect(page.getByTestId("leader-card")).toHaveCount(25);
  expect(
    await page
      .getByTestId("leader-card")
      .evaluateAll((cards) =>
        cards.map((card) => card.getAttribute("data-word")),
      ),
  ).toEqual(publicWords);
  const teamCounts = await Promise.all([
    page.locator('[data-assignment="red"]').count(),
    page.locator('[data-assignment="blue"]').count(),
  ]);
  expect(teamCounts.sort()).toEqual([8, 9]);
  await expect(page.locator('[data-assignment="neutral"]')).toHaveCount(7);
  await expect(page.locator('[data-assignment="bomb"]')).toHaveCount(1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);

  if (browserName === "chromium") {
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: /public board/i }),
    ).toBeFocused();
  }

  const altered = decoded.replace(/.$/, (character) =>
    character === "a" ? "b" : "a",
  );
  await page.goto(altered);
  await expect(
    page.getByRole("heading", { name: /game unavailable/i }),
  ).toBeVisible();
  await expect(page.getByTestId("leader-card")).toHaveCount(0);

  await page.goto("/games/00000000-0000-4000-8000-000000000099");
  await expect(
    page.getByRole("heading", { name: /game unavailable/i }),
  ).toBeVisible();
  await page.getByRole("link", { name: /start a new game/i }).click();
  await expect(page).toHaveURL("/");

  await page.goto(`/games/${gameId}/leader`);
  await expect(
    page.getByRole("heading", { name: /game unavailable/i }),
  ).toBeVisible();
});

test("two browser groups remain independent", async ({
  browser,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Cross-context isolation is covered once in Chromium.",
  );
  const firstContext = await browser.newContext();
  const secondContext = await browser.newContext();
  const firstPage = await firstContext.newPage();
  const secondPage = await secondContext.newPage();

  await Promise.all([
    createGame(firstPage, "English"),
    createGame(secondPage, "Spanish"),
  ]);
  const [firstUrl, secondUrl] = [firstPage.url(), secondPage.url()];
  expect(firstUrl).not.toBe(secondUrl);

  const [firstWords, secondWords] = await Promise.all([
    firstPage.getByTestId("board-card").allTextContents(),
    secondPage.getByTestId("board-card").allTextContents(),
  ]);
  const firstLeader = await decodeLeaderQr(firstPage);
  const secondLeader = await decodeLeaderQr(secondPage);
  expect(firstWords).not.toEqual(secondWords);
  expect(firstLeader).not.toBe(secondLeader);

  const secondToken = secondLeader.split("/").at(-1);
  await firstPage.goto(`${firstUrl}/leader/${secondToken}`);
  await expect(
    firstPage.getByRole("heading", { name: /game unavailable/i }),
  ).toBeVisible();

  await Promise.all([firstContext.close(), secondContext.close()]);
});

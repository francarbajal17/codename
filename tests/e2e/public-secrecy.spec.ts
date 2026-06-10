import { expect, test } from "@playwright/test";

test("public responses and bundles contain no leader token or assignments", async ({
  page,
}) => {
  const responses: Array<{ url: string; body: string }> = [];
  page.on("response", async (response) => {
    const contentType = response.headers()["content-type"] ?? "";
    if (
      contentType.includes("text/") ||
      contentType.includes("javascript") ||
      contentType.includes("json")
    ) {
      responses.push({
        url: response.url(),
        body: await response.text().catch(() => ""),
      });
    }
  });

  await page.goto("/");
  await page.getByText("English", { exact: true }).click();
  await page.getByRole("button", { name: /start game/i }).click();
  await expect(page.getByTestId("board-card")).toHaveCount(25);

  const publicText = [
    await page.content(),
    ...responses.map((response) => response.body),
  ].join("\n");
  expect(publicText).not.toContain("leaderToken");
  expect(publicText).not.toContain('"assignment"');
  expect(publicText).not.toMatch(/\/leader\/[A-Za-z0-9_-]{43}/);

  const qrPath = await page.getByTestId("leader-qr").getAttribute("src");
  expect(qrPath).toMatch(/^\/games\/[0-9a-f-]{36}\/leader-qr$/);
  const qrResponse = await page.request.get(qrPath!);
  const svg = await qrResponse.text();
  expect(qrResponse.headers()["cache-control"]).toContain("no-store");
  expect(svg).not.toContain("/leader/");
  expect(svg).not.toContain("leaderToken");
});

import QRCode from "qrcode";

import { getServerEnv } from "@/lib/config/env";
import { loadGameForQr } from "@/lib/persistence/games";

const NO_STORE = "private, no-store, max-age=0";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await params;
  const access = await loadGameForQr(gameId);
  if (!access) {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": NO_STORE },
    });
  }

  const destination = `${getServerEnv().appOrigin}/games/${access.gameId}/leader/${access.leaderToken}`;
  const svg = (
    await QRCode.toString(destination, {
      type: "svg",
      width: 512,
      margin: 4,
      errorCorrectionLevel: "M",
    })
  ).replace(">", "><title>Scan to open the private leader key</title>");

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": NO_STORE,
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

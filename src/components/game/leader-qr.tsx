import Image from "next/image";

export function LeaderQr({ src }: { src: string }) {
  return (
    <section className="flex flex-col items-center gap-3 text-center">
      <Image
        data-testid="leader-qr"
        src={src}
        width={176}
        height={176}
        unoptimized
        loading="eager"
        alt="QR code for the private leader key"
        className="rounded-xl border border-slate-200 bg-white p-2"
      />
      <div>
        <h2 className="font-bold text-slate-900">Team leaders</h2>
        <p className="max-w-sm text-sm text-slate-600">
          Scan this code on a phone to view the private key.
        </p>
      </div>
    </section>
  );
}

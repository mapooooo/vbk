import { MOBILEPAY_NUMBER, usesManualMobilePay } from "@/lib/payments";

export function MobilePayNotice({
  compact = false,
  holdTitle,
}: {
  compact?: boolean;
  holdTitle?: string;
}) {
  if (!usesManualMobilePay()) return null;

  if (compact) {
    return (
      <p className="text-sm text-muted-foreground">
        Betal via MobilePay:{" "}
        <span className="font-medium text-foreground">{MOBILEPAY_NUMBER}</span>
        {holdTitle && (
          <>
            {" "}
            — skriv <span className="font-medium">{holdTitle}</span> i beskeden
          </>
        )}
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[#5B9BD5]/30 bg-[#5B9BD5]/5 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Betaling via MobilePay</p>
      <p className="mt-1">
        Indtil online betaling er klar: send til{" "}
        <span className="font-semibold text-foreground">{MOBILEPAY_NUMBER}</span>
        {holdTitle ? (
          <>
            {" "}
            og skriv <span className="font-medium">{holdTitle}</span> som
            besked.
          </>
        ) : (
          " og angiv holdnavn i beskeden."
        )}
      </p>
    </div>
  );
}

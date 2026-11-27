import type { IBankTransferDetails } from "@/app/utils/bank-transfer";

import { SampleCopyButton } from "./SampleCopyButton";
import { SampleTransferReportButton } from "./SampleTransferReportButton";
import { formatRupiah, SAMPLE_COPY } from "./utils/sample-copy";

const { status, transfer } = SAMPLE_COPY;

const LABEL_CLASS = "m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted";

interface SampleTransferPayProps {
  token: string;
  code: string;
  /** This deployment's account, read from env on the server. */
  bank: IBankTransferDetails;
  /** The courier fee in rupiah. */
  amount: number;
  /** "Your samples are held for 23 h 40 min." */
  holdLeft: string;
}

/** Step 1 of a bank transfer: the amount, the account, the code for Berita Transfer, then "I've transferred". */
export function SampleTransferPay({ token, code, bank, amount, holdLeft }: SampleTransferPayProps) {
  const rows = [
    { label: transfer.bank, value: bank.bankName, copyAs: null },
    { label: transfer.holder, value: bank.accountHolder, copyAs: null },
    { label: transfer.number, value: bank.accountNumber, copyAs: transfer.numberWhat },
  ];

  return (
    <section className="mb-10 flex flex-col gap-7 border-t-[6px] border-brand-ink pt-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px]">{status.payLabel}</span>
          <span className="flex items-center">
            <span className="text-[15px] font-semibold tabular-nums">{formatRupiah(amount)}</span>
            {/* Bank apps take the amount as plain digits. */}
            <SampleCopyButton value={String(amount)} what={transfer.amountWhat} />
          </span>
        </div>
        <p className="m-0 text-[15px] leading-[22px] text-brand-muted">{holdLeft}</p>
      </div>

      <div className="flex flex-col gap-2">
        <p className={LABEL_CLASS}>{transfer.transferTo}</p>
        <dl className="m-0 flex flex-col">
          {rows.map((row) => (
            <div key={row.label} className="flex min-h-11 items-center justify-between gap-3 border-b border-brand-mist">
              <dt className="text-[15px] text-brand-muted">{row.label}</dt>
              <dd className="m-0 flex items-center text-right text-[15px] font-semibold tabular-nums">
                <span className="select-all">{row.value}</span>
                {row.copyAs !== null && <SampleCopyButton value={row.value} what={row.copyAs} />}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-2 bg-brand-mist p-5">
        <p className={LABEL_CLASS}>{transfer.codeLabel}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[28px] leading-9 font-semibold tracking-[0.12em] tabular-nums select-all">{code}</span>
          <SampleCopyButton value={code} what={transfer.codeWhat} />
        </div>
        <p className="m-0 text-[15px] leading-[22px] text-pretty">{transfer.codeNote}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="m-0 text-[13px] leading-[18px] text-brand-muted">{transfer.screenshotNote}</p>
        <SampleTransferReportButton token={token} />
      </div>
    </section>
  );
}

"use client";

import { type FormEvent, useId, useState, useTransition } from "react";

import { subscribeAction } from "@/app/actions/subscribe.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import { GENERIC_ERROR_MESSAGE, SubscribeStatus } from "@/app/utils/subscribe-state";
import { type ISubscriberInput, parseSubscriberInput } from "@/app/utils/subscriber-input";

import { WaitlistField } from "./WaitlistField";
import { WaitlistArrowGlyph } from "./svg/WaitlistGlyphs";
import { trackWaitlistEvent, WaitlistEvent } from "./utils/waitlist-analytics";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

/** The one error on show: its message, and the field it belongs to (null for a server failure). */
interface IWaitlistFormError {
  message: string;
  field: keyof ISubscriberInput | null;
}

interface WaitlistFormProps {
  /** Field values, owned by the sheet so they survive closing it and "Edit my details". */
  values: ISubscriberInput;
  onValuesChange: (values: ISubscriberInput) => void;
  /** Called with the normalized email once Shopify has the signup. */
  onJoined: (email: string) => void;
}

/** Name, email and Instagram, checked in that order with one error shown at a time. */
export function WaitlistForm({ values, onValuesChange, onJoined }: WaitlistFormProps) {
  const [error, setError] = useState<IWaitlistFormError | null>(null);
  const [isPending, startTransition] = useTransition();
  // The form only mounts when the sheet opens, so this is the moment the visitor first saw it.
  const [renderedAt] = useState(() => String(Date.now()));
  const formId = useId();
  const errorId = `${formId}-error`;
  const idFor: Record<keyof ISubscriberInput, string> = {
    fullName: `${formId}-name`,
    email: `${formId}-email`,
    instagramHandle: `${formId}-instagram`,
  };
  const { sheet } = WAITLIST_COPY;

  /** Updates one field and clears the error. A typed "@" is dropped: the handle field prints its own. */
  function setField(field: keyof ISubscriberInput) {
    return (value: string) => {
      const nextValue = field === "instagramHandle" ? value.replace(/^@+/, "") : value;
      onValuesChange({ ...values, [field]: nextValue });
      setError(null);
    };
  }

  /** Points at the error line only from the field that caused it. */
  function errorIdFor(field: keyof ISubscriberInput) {
    return error?.field === field ? errorId : undefined;
  }

  /** Shows a failure, moves focus to its field, and reports it. */
  function fail(nextError: IWaitlistFormError) {
    setError(nextError);
    if (nextError.field !== null) {
      document.getElementById(idFor[nextError.field])?.focus();
    }
    trackWaitlistEvent(WaitlistEvent.SubmitFailed, { reason: nextError.field ?? "server" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = parseSubscriberInput(values);
    if (!parsed.ok) {
      fail({ message: parsed.message, field: parsed.field });
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await subscribeAction(formData);
        if (result.status === SubscribeStatus.Error) {
          fail({ message: result.message, field: result.field });
          return;
        }

        trackWaitlistEvent(WaitlistEvent.SubmitSucceeded);
        onJoined(parsed.email);
      } catch {
        fail({ message: GENERIC_ERROR_MESSAGE, field: null });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
      <WaitlistField
        id={idFor.fullName}
        name="fullName"
        label={sheet.nameLabel}
        value={values.fullName}
        onValueChange={setField("fullName")}
        errorId={errorIdFor("fullName")}
        inputProps={{ type: "text", autoComplete: "name", placeholder: sheet.namePlaceholder }}
      />
      <WaitlistField
        id={idFor.email}
        name="email"
        label={sheet.emailLabel}
        value={values.email}
        onValueChange={setField("email")}
        errorId={errorIdFor("email")}
        inputProps={{
          type: "email",
          inputMode: "email",
          autoComplete: "email",
          placeholder: sheet.emailPlaceholder,
        }}
      />
      <WaitlistField
        id={idFor.instagramHandle}
        name="instagramHandle"
        label={sheet.instagramLabel}
        value={values.instagramHandle}
        onValueChange={setField("instagramHandle")}
        prefix="@"
        errorId={errorIdFor("instagramHandle")}
        inputProps={{
          type: "text",
          autoComplete: "off",
          autoCapitalize: "none",
          placeholder: sheet.instagramPlaceholder,
        }}
      />

      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />

      {error !== null && (
        <p
          id={errorId}
          role="alert"
          className="mt-2.5 mb-0 text-[13px] leading-[18px] font-semibold text-brand-ink"
        >
          {error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 flex h-[52px] cursor-pointer items-center justify-between bg-flavor-orange px-5 text-base font-semibold text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink disabled:cursor-default disabled:opacity-60 desk:mt-6 desk:h-14 desk:px-6"
      >
        <span>{isPending ? sheet.submitting : sheet.submit}</span>
        <WaitlistArrowGlyph />
      </button>
      <p className="mt-2.5 mb-0 text-xs leading-4 text-brand-muted desk:mt-3 desk:text-[13px] desk:leading-[18px]">
        {sheet.finePrint}
      </p>
    </form>
  );
}

"use client";

import { type FormEvent, type KeyboardEvent, type RefObject, useId, useState, useTransition } from "react";

import { subscribeAction } from "@/app/actions/subscribe.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import { GENERIC_ERROR_MESSAGE, SubscribeStatus } from "@/app/utils/subscribe-state";
import {
  type ISubscriberInput,
  parseSubscriberInput,
  SUBSCRIBER_FIELD_ORDER,
  validateField,
} from "@/app/utils/subscriber-input";

import { WaitlistField } from "./WaitlistField";
import { WaitlistArrowGlyph } from "./svg/WaitlistGlyphs";
import { trackWaitlistEvent, WaitlistEvent } from "./utils/waitlist-analytics";
import { WAITLIST_COPY } from "./utils/waitlist-copy";
import { WAITLIST_FIELD_INPUT_PROPS, WAITLIST_FIELD_LABEL } from "./utils/waitlist-fields";

type FieldName = keyof ISubscriberInput;
type FieldErrors = Partial<Record<FieldName, string>>;

const { sheet } = WAITLIST_COPY;

interface WaitlistFormProps {
  /** Field values, owned by the sheet so they survive closing it and "Edit my details". */
  values: ISubscriberInput;
  onValuesChange: (values: ISubscriberInput) => void;
  /** Called with the normalized email once Shopify has the signup. */
  onJoined: (email: string) => void;
  /** Points at the first input, so the sheet can start the cursor there on desktop. */
  firstInputRef: RefObject<HTMLInputElement | null>;
}

/** Email, name and an optional Instagram handle, each reporting its own error under itself. */
export function WaitlistForm({ values, onValuesChange, onJoined, firstInputRef }: WaitlistFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // The form only mounts when the sheet opens, so this is the moment the visitor first saw it.
  const [renderedAt] = useState(() => String(Date.now()));
  const formId = useId();
  const inputId = (field: FieldName) => `${formId}-${field}`;

  /** Re-checks one field and updates only its error. */
  function revalidate(field: FieldName, value: string) {
    const message = validateField(field, value);
    setFieldErrors((previous) => {
      const next = { ...previous };
      if (message === null) {
        delete next[field];
      } else {
        next[field] = message;
      }
      return next;
    });
  }

  /** A typed "@" is dropped: the handle field prints its own. An error clears as soon as it is fixed. */
  function changeField(field: FieldName, value: string) {
    const nextValue = field === "instagramHandle" ? value.replace(/^@+/, "") : value;
    onValuesChange({ ...values, [field]: nextValue });
    setServerError(null);
    if (fieldErrors[field] !== undefined) {
      revalidate(field, nextValue);
    }
  }

  /** Checks a field on the way out, but never nags about one the visitor left empty. */
  function blurField(field: FieldName, value: string) {
    if (value.trim() !== "") {
      revalidate(field, value);
    }
  }

  /** Enter on an earlier field moves to the next one, matching its "next" key, instead of submitting. */
  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    const targetId = event.target instanceof HTMLElement ? event.target.id : "";
    const index = SUBSCRIBER_FIELD_ORDER.findIndex((field) => inputId(field) === targetId);
    const nextField = index === -1 ? undefined : SUBSCRIBER_FIELD_ORDER[index + 1];
    if (nextField !== undefined) {
      event.preventDefault();
      document.getElementById(inputId(nextField))?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FieldErrors = {};
    for (const field of SUBSCRIBER_FIELD_ORDER) {
      const message = validateField(field, values[field]);
      if (message !== null) {
        nextErrors[field] = message;
      }
    }
    setFieldErrors(nextErrors);

    const parsed = parseSubscriberInput(values);
    if (!parsed.ok) {
      document.getElementById(inputId(parsed.field))?.focus();
      trackWaitlistEvent(WaitlistEvent.SubmitFailed, { reason: parsed.field });
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const result = await subscribeAction(formData);
        if (result.status === SubscribeStatus.Success) {
          trackWaitlistEvent(WaitlistEvent.SubmitSucceeded);
          onJoined(parsed.email);
          return;
        }

        if (result.field === null) {
          setServerError(result.message);
        } else {
          setFieldErrors({ [result.field]: result.message });
        }
        trackWaitlistEvent(WaitlistEvent.SubmitFailed, { reason: result.field ?? "server" });
      } catch {
        setServerError(GENERIC_ERROR_MESSAGE);
        trackWaitlistEvent(WaitlistEvent.SubmitFailed, { reason: "server" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate className="flex flex-col">
      {SUBSCRIBER_FIELD_ORDER.map((field, index) => (
        <WaitlistField
          key={field}
          id={inputId(field)}
          name={field}
          label={WAITLIST_FIELD_LABEL[field]}
          value={values[field]}
          onValueChange={(value) => changeField(field, value)}
          onValueBlur={(value) => blurField(field, value)}
          prefix={field === "instagramHandle" ? "@" : undefined}
          error={fieldErrors[field]}
          inputRef={index === 0 ? firstInputRef : undefined}
          inputProps={WAITLIST_FIELD_INPUT_PROPS[field]}
        />
      ))}

      <div aria-hidden className="absolute top-0 -left-[9999px] size-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" value={renderedAt} readOnly />

      {serverError !== null && (
        <p role="alert" className="mt-2.5 mb-0 text-[13px] leading-[18px] font-semibold text-brand-ink">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-5 flex h-[52px] cursor-pointer items-center justify-between bg-flavor-orange px-5 text-base font-semibold text-brand-ink transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none desk:mt-6 desk:h-14 desk:px-6"
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

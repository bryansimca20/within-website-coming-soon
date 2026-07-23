"use client";

import { type FormEvent, useActionState, useEffect, useId, useRef, useState } from "react";

import { subscribeAction } from "@/app/actions/subscribe.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import { INITIAL_SUBSCRIBE_STATE, SubscribeStatus } from "@/app/utils/subscribe-state";
import { validateField } from "@/app/utils/subscriber-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** The visible fields validated on the client before the server ever runs. */
type FieldName = "fullName" | "email" | "instagramHandle";
const FIELD_ORDER: FieldName[] = ["fullName", "email", "instagramHandle"];

/** Pre-launch signup form. Renders on both paper and black surfaces. */
interface SignupFormProps {
  /** `inverse` for black panels (the hero, full-bleed sections). */
  tone?: "default" | "inverse";
  className?: string;
}

/** Captures a full name, email, and optional Instagram handle into the Shopify pre-launch list. */
export function SignupForm({ tone = "default", className }: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeAction, INITIAL_SUBSCRIBE_STATE);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const timestampRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  // Written straight to the DOM after mount, never during render: the page is statically
  // prerendered, so a build-time value would be hours old and the elapsed-time check would
  // never catch a bot. Going through state here would only add a cascading render.
  useEffect(() => {
    if (timestampRef.current !== null) {
      timestampRef.current.value = String(Date.now());
    }
  }, []);

  const isDark = tone === "inverse";
  const idFor: Record<FieldName, string> = {
    fullName: `${fieldId}-fullname`,
    email: `${fieldId}-email`,
    instagramHandle: `${fieldId}-instagram`,
  };
  const statusId = `${fieldId}-status`;

  /** Re-checks one field and updates only its error, leaving the others untouched. */
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

  /** Validates every field on submit; blocks the server action and focuses the first error if any. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const nextErrors: Partial<Record<FieldName, string>> = {};

    for (const field of FIELD_ORDER) {
      const message = validateField(field, String(formData.get(field) ?? ""));
      if (message !== null) {
        nextErrors[field] = message;
      }
    }

    setFieldErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field] !== undefined);
    if (firstInvalid !== undefined) {
      // Stop the server action; the invalid submission never leaves the browser.
      event.preventDefault();
      document.getElementById(idFor[firstInvalid])?.focus();
    }
  }

  if (state.status === SubscribeStatus.Success) {
    return (
      <p
        className={cn(
          "m-0 text-[15px] leading-[1.55]",
          isDark ? "text-wi-on-dark-1" : "text-wi-black",
          className
        )}
        role="status"
      >
        You are on the list. We will email you when WITHIN launches.
      </p>
    );
  }

  /** Live validation props shared by every field: invalid state, error link, blur/change checks. */
  function fieldProps(field: FieldName) {
    const message = fieldErrors[field];
    return {
      "aria-invalid": message !== undefined,
      "aria-describedby": message !== undefined ? `${idFor[field]}-error` : undefined,
      onBlur: (event: FormEvent<HTMLInputElement>) =>
        revalidate(field, event.currentTarget.value),
      onChange: (event: FormEvent<HTMLInputElement>) => {
        if (fieldErrors[field] !== undefined) {
          revalidate(field, event.currentTarget.value);
        }
      },
    };
  }

  /** One field's error paragraph, or null when the field is valid. */
  function fieldMessage(field: FieldName) {
    const message = fieldErrors[field];
    if (message === undefined) {
      return null;
    }
    return (
      <p
        id={`${idFor[field]}-error`}
        className={cn(
          "mt-1 mb-0 text-[13px] font-medium leading-[1.4]",
          isDark ? "text-wi-on-dark-1" : "text-wi-black"
        )}
      >
        {message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className={cn("max-w-[520px]", className)}
      noValidate
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={idFor.fullName} tone={isDark ? "inverse" : "default"}>
            Full name
          </Label>
          <Input
            id={idFor.fullName}
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            tone={isDark ? "inverse" : "default"}
            {...fieldProps("fullName")}
          />
          {fieldMessage("fullName")}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={idFor.email} tone={isDark ? "inverse" : "default"}>
            Email
          </Label>
          <Input
            id={idFor.email}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            tone={isDark ? "inverse" : "default"}
            {...fieldProps("email")}
          />
          {fieldMessage("email")}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={idFor.instagramHandle} tone={isDark ? "inverse" : "default"}>
            Instagram (optional)
          </Label>
          <Input
            id={idFor.instagramHandle}
            name="instagramHandle"
            type="text"
            autoComplete="off"
            placeholder="@yourhandle"
            tone={isDark ? "inverse" : "default"}
            {...fieldProps("instagramHandle")}
          />
          {fieldMessage("instagramHandle")}
        </div>
      </div>

      <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <input name={HONEYPOT_TRAP_FIELD} type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <input ref={timestampRef} name={HONEYPOT_TIMESTAMP_FIELD} type="hidden" defaultValue="" />

      <Button
        type="submit"
        size="default"
        variant={isDark ? "inverse" : "default"}
        disabled={isPending}
        className="mt-4 w-auto"
      >
        {isPending ? "Joining" : "Join the list"}
      </Button>

      <p
        id={statusId}
        role="alert"
        aria-live="polite"
        className={cn(
          "mt-2 mb-0 min-h-[18px] text-[13px] leading-[1.4]",
          isDark ? "text-wi-on-dark-1" : "text-wi-black"
        )}
      >
        {state.status === SubscribeStatus.Error ? state.message : ""}
      </p>
    </form>
  );
}

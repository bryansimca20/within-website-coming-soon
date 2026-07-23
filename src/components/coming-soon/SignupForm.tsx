"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { subscribeAction } from "@/app/actions/subscribe.action";
import { HONEYPOT_TIMESTAMP_FIELD, HONEYPOT_TRAP_FIELD } from "@/app/utils/honeypot";
import { INITIAL_SUBSCRIBE_STATE, SubscribeStatus } from "@/app/utils/subscribe-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Pre-launch signup form. Renders on both paper and black surfaces. */
interface SignupFormProps {
  /** `inverse` for black panels (the hero, full-bleed sections). */
  tone?: "default" | "inverse";
  className?: string;
}

/** Captures an email and an optional Instagram handle into the Shopify pre-launch list. */
export function SignupForm({ tone = "default", className }: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeAction, INITIAL_SUBSCRIBE_STATE);
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
  const nameId = `${fieldId}-fullname`;
  const emailId = `${fieldId}-email`;
  const handleId = `${fieldId}-instagram`;
  const statusId = `${fieldId}-status`;

  const hasError = state.status === SubscribeStatus.Error;
  const errorField = hasError ? state.field : null;

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

  return (
    <form action={formAction} className={cn("max-w-[520px]", className)} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor={nameId} tone={isDark ? "inverse" : "default"}>
            Full name
          </Label>
          <Input
            id={nameId}
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            tone={isDark ? "inverse" : "default"}
            aria-invalid={errorField === "fullName"}
            aria-describedby={hasError ? statusId : undefined}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={emailId} tone={isDark ? "inverse" : "default"}>
            Email
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            tone={isDark ? "inverse" : "default"}
            aria-invalid={errorField === "email"}
            aria-describedby={hasError ? statusId : undefined}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={handleId} tone={isDark ? "inverse" : "default"}>
            Instagram (optional)
          </Label>
          <Input
            id={handleId}
            name="instagramHandle"
            type="text"
            autoComplete="off"
            placeholder="@yourhandle"
            tone={isDark ? "inverse" : "default"}
            aria-invalid={errorField === "instagramHandle"}
            aria-describedby={hasError ? statusId : undefined}
          />
        </div>
      </div>

      <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <input
          name={HONEYPOT_TRAP_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <input
        ref={timestampRef}
        name={HONEYPOT_TIMESTAMP_FIELD}
        type="hidden"
        defaultValue=""
      />

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
        className={cn(
          "mt-3 mb-0 text-2xs leading-[1.5]",
          isDark ? "text-wi-on-dark-3" : "text-wi-ink-500"
        )}
      >
        One email when we launch. Unsubscribe anytime.
      </p>

      <p
        id={statusId}
        role="alert"
        aria-live="polite"
        className={cn(
          "mt-2 mb-0 min-h-[18px] text-[13px] leading-[1.4]",
          isDark ? "text-wi-on-dark-1" : "text-wi-black"
        )}
      >
        {hasError ? state.message : ""}
      </p>
    </form>
  );
}

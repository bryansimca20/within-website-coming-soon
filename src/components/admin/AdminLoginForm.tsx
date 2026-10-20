"use client";

import { useActionState } from "react";

import { adminLoginAction } from "@/app/actions/admin-auth.action";
import { Button } from "@/components/ui/button";

const MESSAGE = { wrong: "Wrong passcode.", rate: "Too many tries. Wait ten minutes." } as const;

/** The shared founder passcode. */
export function AdminLoginForm() {
  const [state, action, isPending] = useActionState(adminLoginAction, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="passcode" className="text-2xs font-bold tracking-[0.14em] text-wi-ink-500 uppercase">Passcode</label>
      <input id="passcode" name="passcode" type="password" autoComplete="current-password" required
        className="h-11 rounded-[var(--wi-radius-control)] border border-wi-line-strong bg-wi-paper px-3 text-base text-wi-black outline-none focus-visible:border-wi-black" />
      {state !== null && <p role="alert" className="m-0 text-sm text-wi-black">{MESSAGE[state.error]}</p>}
      <Button type="submit" disabled={isPending}>{isPending ? "Checking" : "Sign in"}</Button>
    </form>
  );
}

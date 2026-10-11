import type { InputHTMLAttributes } from "react";

import type { ISubscriberInput } from "@/app/utils/subscriber-input";

import { WAITLIST_COPY } from "./waitlist-copy";

type FieldName = keyof ISubscriberInput;

const { sheet } = WAITLIST_COPY;

/** Label per field. */
export const WAITLIST_FIELD_LABEL: Record<FieldName, string> = {
  email: sheet.emailLabel,
  fullName: sheet.nameLabel,
  instagramHandle: sheet.instagramLabel,
};

/** Keyboard and autofill hints per field. The last field's action key submits; the others advance. */
export const WAITLIST_FIELD_INPUT_PROPS: Record<FieldName, InputHTMLAttributes<HTMLInputElement>> = {
  email: {
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
    enterKeyHint: "next",
    placeholder: sheet.emailPlaceholder,
  },
  fullName: {
    type: "text",
    autoComplete: "name",
    autoCapitalize: "words",
    enterKeyHint: "next",
    placeholder: sheet.namePlaceholder,
  },
  instagramHandle: {
    type: "text",
    autoComplete: "off",
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: false,
    enterKeyHint: "go",
    placeholder: sheet.instagramPlaceholder,
  },
};

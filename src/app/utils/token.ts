import { randomBytes } from "node:crypto";

const TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const SUFFIX_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const ACCESS_TOKEN_LENGTH = 24;
const ORDER_SUFFIX_LENGTH = 6;

/** Unbiased random string over an alphabet: bytes past the largest clean multiple are rethrown. */
function randomString(alphabet: string, length: number): string {
  const limit = 256 - (256 % alphabet.length);
  let output = "";

  while (output.length < length) {
    const bytes = randomBytes(length * 2);
    for (const byte of bytes) {
      if (byte < limit) {
        output += alphabet[byte % alphabet.length];
        if (output.length === length) {
          break;
        }
      }
    }
  }

  return output;
}

/** The secret in a status page URL and personal feedback link. 24 characters, 62-letter alphabet. */
export function generateAccessToken(): string {
  return randomString(TOKEN_ALPHABET, ACCESS_TOKEN_LENGTH);
}

/** Keeps a Midtrans order id unique across payment attempts for one box. */
export function generateOrderSuffix(): string {
  return randomString(SUFFIX_ALPHABET, ORDER_SUFFIX_LENGTH);
}

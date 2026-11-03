interface ISnapCallbacks {
  onSuccess?: () => void;
  onPending?: () => void;
  onError?: () => void;
  onClose?: () => void;
}

interface ISnapWindow {
  snap?: { pay: (token: string, callbacks: ISnapCallbacks) => void };
}

/**
 * Opens the Midtrans Snap sheet. Every way out of it (paid, pending, error, closed) calls `onDone`,
 * because the status page shows the truth either way. False when snap.js never loaded.
 */
export function openSnap(token: string, onDone: () => void): boolean {
  const snap = (window as unknown as ISnapWindow).snap;
  if (snap === undefined) {
    return false;
  }
  snap.pay(token, { onSuccess: onDone, onPending: onDone, onError: onDone, onClose: onDone });
  return true;
}

// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from "react";

import { isServer } from "./isServer";

export function createEventEmitter<TPayload>(eventName: string) {
  const emit = (payload: TPayload) => {
    if (isServer()) return;
    window.dispatchEvent(new CustomEvent<TPayload>(eventName, { detail: payload }));
  };

  const useListener = (callback: (payload: TPayload) => void) => {
    useEffect(() => {
      if (isServer()) return;
      const eventCallback = (e: Event) => {
        const event = e as CustomEvent<TPayload>;
        callback(event.detail);
      };
      window.addEventListener(eventName, eventCallback, false);

      return () => {
        window.removeEventListener(eventName, eventCallback);
      };
    }, [callback]);
  };

  return [emit, useListener] as const;
}

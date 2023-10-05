// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

export function isServer() {
  return typeof window === "undefined";
}

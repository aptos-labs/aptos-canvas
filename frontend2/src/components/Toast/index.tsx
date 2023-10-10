"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { stack } from "styled-system/patterns";

import { createEventEmitter } from "@/utils/eventEmitter";

import { Toast, ToastProps } from "./Toast";

export { removeToast, toast, ToastContainer };

const [toast, useToastListener] = createEventEmitter<ToastProps>("toast");
const [removeToast, useRemoveToastListener] = createEventEmitter<string>("removeToast");

function ToastContainer() {
  const [toastMap, setToastMap] = useState<Map<string, ToastProps>>(new Map());

  const addToast = useCallback((payload: ToastProps) => {
    setToastMap((prev) => {
      const next = new Map(prev);
      next.set(payload.id, payload);
      return next;
    });
    if (payload.duration !== null) {
      window.setTimeout(() => {
        setToastMap((prev) => {
          const next = new Map(prev);
          next.delete(payload.id);
          return next;
        });
      }, payload.duration ?? 5000);
    }
  }, []);

  const removeToast = useCallback((toastId: string) => {
    setToastMap((prev) => {
      const next = new Map(prev);
      next.delete(toastId);
      return next;
    });
  }, []);

  useToastListener(addToast);
  useRemoveToastListener(removeToast);

  return (
    <ToastPrimitive.Provider duration={Infinity}>
      <ToastPrimitive.Viewport asChild>
        <motion.div layout className={stack({ zIndex: "toast", w: "100%", gap: 16 })}>
          <AnimatePresence mode="popLayout">
            {Array.from(toastMap.values()).map((toast) => (
              <Toast key={toast.id} {...toast} />
            ))}
          </AnimatePresence>
        </motion.div>
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Provider>
  );
}

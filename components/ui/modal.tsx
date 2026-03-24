"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";

type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
  confirmVariant?: "primary" | "secondary";
}>;

export function Modal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  confirmVariant = "primary",
  children
}: ModalProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-lg rounded-[32px] p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-2">
              <h3 className="text-xl font-medium">{title}</h3>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {children ? <div className="mt-5">{children}</div> : null}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                {cancelLabel}
              </Button>
              {onConfirm ? (
                <Button type="button" variant={confirmVariant} onClick={onConfirm}>
                  {confirmLabel}
                </Button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

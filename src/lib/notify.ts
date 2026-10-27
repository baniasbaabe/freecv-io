import { toast } from "sonner";

// Undo replaces confirmation dialogs: actions happen immediately and can be reversed for a few seconds.
export const notify = (msg: string, undo?: () => void) => toast(msg, undo && { action: { label: "Undo", onClick: undo } });

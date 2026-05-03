// react
import { X } from "lucide-react";

// @shared - components
import { Portal } from "@shared/components/ui/Portal";

// @shared - utils
import { cn } from "@shared/lib/utils";

type ToastPortalProps = {
    message: string;
    variant: "success" | "error";
    onClose: () => void;
    showClose?: boolean;
};

/**
 * ToastPortal - React component
 * @returns React element
 */
export const ToastPortal = ({ message, variant, onClose, showClose = true }: ToastPortalProps) => {
    return (
        <Portal>
            <div
                className={cn(
                    "fixed left-1/2 top-[85px] z-[9999] flex w-auto min-w-[300px] -translate-x-1/2 items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
                    variant === "success" ? "border-[#4ADE80]" : "border-rose-200"
                )}
            >
                <span className="font-inter text-base font-medium text-slate-900">
                    {message}
                </span>
                {showClose && (
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>
        </Portal>
    );
};

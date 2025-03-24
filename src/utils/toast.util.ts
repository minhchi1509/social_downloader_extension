import { ExternalToast, toast } from "sonner";

type TToastType = "success" | "error" | "info" | "warning";

const showToast = (
  type: TToastType,
  message: string,
  options?: ExternalToast
) => {
  toast[type](message, {
    ...options,
    position: "top-center",
    richColors: true,
    closeButton: false,
  });
};

export const showSuccessToast = (message: string, options?: ExternalToast) => {
  showToast("success", message, options);
};

export const showErrorToast = (message: string, options?: ExternalToast) => {
  showToast("error", message, options);
};

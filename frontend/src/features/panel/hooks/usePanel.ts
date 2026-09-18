import { useMutation } from "@tanstack/react-query";
import { convenePanel } from "../api/panelApi.ts";

export function usePanel() {
  return useMutation({ mutationFn: convenePanel });
}

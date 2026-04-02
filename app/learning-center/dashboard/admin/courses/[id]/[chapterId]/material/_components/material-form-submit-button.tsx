"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon, SaveIcon } from "lucide-react";

type MaterialFormSubmitButtonProps = {
  mode: "create" | "update";
  formId: string;
};

export default function MaterialFormSubmitButton({
  mode,
  formId,
}: MaterialFormSubmitButtonProps) {
  return (
    <Button type="submit" form={formId}>
      {mode === "create" ? <PlusIcon /> : <SaveIcon />}
      {mode === "create" ? "Create Material" : "Save Changes"}
    </Button>
  );
}

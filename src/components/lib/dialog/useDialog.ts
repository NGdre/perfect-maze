import { useCallback, useState } from "react";

import { DialogConfig } from "./Dialog";

export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogConfig | null>(null);

  const showDialog = useCallback((config: DialogConfig) => {
    setDialog(config);
  }, []);

  const hideDialog = () => {
    setDialog(null);
  };

  return {
    dialog,
    showDialog,
    hideDialog,
  };
};

// AlertContext.tsx
import React, { createContext, useContext, useState } from "react";

type AlertContextType = {
  open: boolean;
  message: string;
  severity: "success" | "error";
  showAlert: (message: string, severity: "success" | "error") => void;
  handleClose: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("error");

  const showAlert = (message: string, severity: "success" | "error") => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AlertContext.Provider value={{ open, message, severity, showAlert, handleClose }}>
      {children}
    </AlertContext.Provider>
  );
};

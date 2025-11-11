import clsx from "clsx";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

import Button from "../button/Button";

export interface PopupProps {
  onClose: () => void;
  isOpen?: boolean;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Popup: React.FC<PopupProps> = ({
  onClose,
  isOpen = true,
  className,
  showCloseButton = false,
  children,
}) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  /* stopPropagation is needed so click event on overlay is not fired when 
  there is a click on dialog-content */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={clsx(
          "relative max-h-[90vh] max-w-lg overflow-auto rounded-lg bg-white px-10 py-5 shadow-xl",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="!absolute right-5 top-5 !rounded-full"
          >
            <FiX size={25} />
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

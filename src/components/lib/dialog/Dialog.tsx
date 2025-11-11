import Button, { ButtonType } from "../button/Button";
import { Heading } from "../typography/Heading";
import { Popup, PopupProps } from "./Popup";

export type DialogButton = ButtonType & { text: string };

export interface DialogConfig {
  title: string;
  message: string;
  buttons: Array<DialogButton>;
  onClose?: () => void;
}

interface DialogProps extends DialogConfig {
  onClose: () => void;
}

export const Dialog: React.FC<DialogProps & Omit<PopupProps, "children">> = ({
  title,
  message,
  buttons,
  onClose,
  ...popupProps
}) => {
  return (
    <Popup onClose={onClose} {...popupProps}>
      <div
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
        className="flex flex-col"
      >
        <Heading level={3} className="!text-xl font-semibold">
          {title}
        </Heading>

        <p id="dialog-message" className="mb-6 text-gray-600">
          {message}
        </p>

        <div className="mt-5 flex gap-3">
          {buttons.map((button) => (
            <Button
              key={button.text}
              onClick={() => {
                button.onClick?.();
                onClose();
              }}
              variant={button.variant}
            >
              {button.text}
            </Button>
          ))}
        </div>
      </div>
    </Popup>
  );
};

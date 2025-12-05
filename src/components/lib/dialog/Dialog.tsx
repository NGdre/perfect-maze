import Button, { ButtonType } from "../button/Button";
import { Heading } from "../typography/Heading";
import { Popup, PopupProps } from "./Popup";

export type DialogButton = ButtonType & { text: string };

export interface DialogConfig {
  isOpen?: boolean;
  title: string;
  message: string;
  buttons: Array<DialogButton>;
  onClose: () => void;
}

export const Dialog: React.FC<DialogConfig & Omit<PopupProps, "children">> = ({
  title,
  message,
  buttons,
  ...popupProps
}) => {
  return (
    <Popup {...popupProps}>
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

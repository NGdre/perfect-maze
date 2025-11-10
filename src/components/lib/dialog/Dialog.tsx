import { Popup } from "./Popup";
import "./dialog.css";

export interface DialogButton {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface DialogConfig {
  title: string;
  message: string;
  buttons: DialogButton[];
  onClose?: () => void;
}

interface DialogProps extends DialogConfig {
  onClose: () => void;
}

export const Dialog: React.FC<DialogProps> = ({
  title,
  message,
  buttons,
  onClose,
}) => {
  return (
    <Popup onClose={onClose}>
      <div
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <h2 className="dialog-title">{title}</h2>
        <p className="dialog-message">{message}</p>

        <div className="dialog-buttons">
          {buttons.map((button, index) => (
            <button
              key={index}
              className={`button button--${button.variant || "secondary"}`}
              onClick={() => {
                button.onClick();
                onClose();
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </Popup>
  );
};

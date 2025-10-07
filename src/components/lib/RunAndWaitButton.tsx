import Spinner from "./Spinner";
import Button from "./button/Button";

export default function RunAndWaitButton({
  onClick,
  isLoading,
  waitText,
  runText,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  isLoading: boolean;
  waitText: string;
  runText: string;
}) {
  return (
    <Button disabled={isLoading} onClick={onClick}>
      {isLoading && <Spinner />}
      {isLoading ? waitText : runText}
    </Button>
  );
}

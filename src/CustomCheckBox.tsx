import { FC } from "react";
import { EventCheckedEnum } from "./types";

interface CustomCheckBoxProps {
  id: string;
  checked: EventCheckedEnum;
  onClick: (args: unknown) => void;
  className: string;
}

const CustomCheckBox: FC<CustomCheckBoxProps> = ({
  onClick,
  checked = 0,
  className = ""
}) => {
  return (
    <div className={className} onClick={onClick}>
      <span>
        {checked === EventCheckedEnum.CHECKED && <span>✅</span>}
        {checked === EventCheckedEnum.UNCHECKED && <span>❌</span>}
        {checked === EventCheckedEnum.UNDETERMINATED && <span>👻</span>}
      </span>
    </div>
  );
};

export default CustomCheckBox;

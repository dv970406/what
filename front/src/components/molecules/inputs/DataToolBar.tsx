import {
  faCirclePlus,
  faSearch,
  faUsers,
  faWaffle,
} from "@fortawesome/pro-solid-svg-icons";
import React, { ChangeEventHandler, MouseEventHandler, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { useGetPositions } from "../../../client/position/GetPositions.client";
import { useGetTeams } from "../../../client/team/GetTeams.client";
import { useGetMyInfo } from "../../../client/user/GetMyInfo.client";
import { theme } from "../../../css/theme";
import { DB_TABLE } from "../../../utils/constants/share.constant";
import { openModal } from "../../../utils/modal/controlModal";
import { RowBox } from "../../atomics/boxes/Boxes";
import { ButtonIcon } from "../buttons/Buttons";
import { BoxIcon } from "../icons/Icons";
import Select from "./Select";
interface IDataToolBar {
  onChange: ChangeEventHandler<HTMLInputElement>;
  mutateName?: string;
  hasAddButton?: boolean;
}

const DataToolBar = ({ onChange, mutateName, hasAddButton }: IDataToolBar) => {
  const [isFocusingSearch, setIsFocusingSearch] = useState(false);

  const handleModal: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!mutateName) return;
    openModal(mutateName);
  };

  const { myInfo } = useGetMyInfo();

  return (
    <RowBox
      style={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
          borderBottom: isFocusingSearch
            ? `1px solid ${theme.colors.purple}`
            : `1px solid ${theme.colors.gray}`,

          transition: "border 0.2s",
          padding: theme.spacing.sm,
          width: 300,
        }}
        onFocus={() => setIsFocusingSearch(true)}
        onBlur={() => setIsFocusingSearch(false)}
      >
        <BoxIcon
          bgColor={isFocusingSearch ? theme.bgColors.purple : undefined}
          icon={faSearch}
        />
        <input
          // {...register}
          onChange={onChange}
          placeholder={"???????????? ??????????????????."}
          style={{ width: "100%" }}
        />
      </div>

      {(mutateName === "create-post" || myInfo?.isManager) && hasAddButton && (
        <ButtonIcon
          onClick={handleModal}
          color={theme.bgColors.green}
          icon={faCirclePlus}
          size="2xl"
        />
      )}
    </RowBox>
  );
};

export default DataToolBar;

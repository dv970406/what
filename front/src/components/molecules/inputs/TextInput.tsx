import { IconProp } from "@fortawesome/fontawesome-svg-core";
import React, { ChangeEventHandler, useState } from "react";
import { UseFormRegister, UseFormRegisterReturn } from "react-hook-form";
import { theme } from "../../../css/theme";
import { ErrorText, MainText } from "../../atomics/typographys/texts";
import { SubTitle } from "../../atomics/typographys/titles";
import { ColumnBox } from "../../atomics/boxes/Boxes";
import { BoxIcon } from "../icons/Icons";

interface ITextInput {
  label?: string;
  icon: IconProp;
  placeholder?: string;
  type?: string;
  noError?: boolean;
  step?: number;
  register?: UseFormRegisterReturn<string>;
  defaultValue?: string;
  errorMessage?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}
export const TextInput = ({
  label,
  icon,
  placeholder = "Placeholder",
  type = "text",
  noError = false,

  step,
  register,
  defaultValue,
  errorMessage,
  onChange,
}: ITextInput) => {
  const [isFocusing, setIsFocusing] = useState(false);
  return (
    <ColumnBox gap={theme.spacing.sm}>
      {label && (
        <label htmlFor={label} style={{ cursor: "pointer" }}>
          <SubTitle>{label}</SubTitle>
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
          border: isFocusing
            ? `1px solid ${theme.colors.purple}`
            : `1px solid ${theme.colors.gray}`,
          borderRadius: theme.borderRadius.md,
          transition: "all 0.2s",
          width: "100%",
        }}
        onFocus={() => setIsFocusing(true)}
        onBlur={() => setIsFocusing(false)}
      >
        {icon && (
          <div style={{ padding: theme.spacing.md, paddingRight: 0 }}>
            <BoxIcon
              bgColor={isFocusing ? theme.bgColors.purple : undefined}
              icon={icon}
            />
          </div>
        )}
        <input
          id={label}
          placeholder={placeholder}
          style={{ width: "100%", padding: theme.spacing.md }}
          type={type}
          {...(defaultValue && { defaultValue })}
          {...(type && {
            step,
            min: 0,
            max: 30,
          })}
          // ????????? register??? onChange??? ?????? ??????
          {...register}
          {...(onChange && { onChange })}
        />
      </div>
      {!noError && <ErrorText style={{ height: 15 }}>{errorMessage}</ErrorText>}
    </ColumnBox>
  );
};

import { faTag } from "@fortawesome/pro-solid-svg-icons";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useGetManagerPosition } from "../../../../client/manager/GetManagerPosition.client";
import { useDeletePosition } from "../../../../client/manager/DeletePosition.client";
import { useUpdatePosition } from "../../../../client/manager/UpdatePosition.client";
import { theme } from "../../../../css/theme";
import { SubmitButton } from "../../../atomics/buttons/buttons";
import { Form } from "../../../atomics/form/Form";
import FormTitle from "../../../molecules/form/FormTitle";
import { TextInput } from "../../../molecules/inputs/TextInput";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";

interface IMutatePositionFormValue {
  position: string;
}

interface IMutatePositionForm {
  clickedPositionId: string;
  setClickedPositionId: Dispatch<SetStateAction<string>>;
}
const MutatePositionForm = ({
  clickedPositionId,
  setClickedPositionId,
}: IMutatePositionForm) => {
  const { position } = useGetManagerPosition(clickedPositionId);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<IMutatePositionFormValue>({
    mode: "onChange",
  });

  useEffect(() => {
    if (position) {
      setValue("position", position?.position);
    } else {
      setClickedPositionId("");
      reset();
    }
  }, [position]);

  const { position: watchPosition } = watch();
  const isSubmitDisabled = !!errors.position || !watchPosition;

  const { updatePositionMutation, updatePositionLoading } = useUpdatePosition();
  const onSubmit: SubmitHandler<IMutatePositionFormValue> = ({ position }) => {
    if (updatePositionLoading) return;

    updatePositionMutation({
      id: clickedPositionId,
      position,
    });
  };
  const { deletePositionMutation, deletePositionLoading } = useDeletePosition();

  const handleDeletePosition = () => {
    if (deletePositionLoading) return;
    deletePositionMutation({ id: clickedPositionId });
  };
  return (
    <>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          ...(!clickedPositionId && {
            opacity: theme.disabled.opacity,
            pointerEvents: "none",
          }),
        }}
      >
        <FormTitle formTitle={`${position?.position || "??????"} ??????`} />
        <TextInput
          icon={faTag}
          label="??????"
          placeholder="??????"
          register={register("position", {
            required: {
              value: true,
              message: "????????? ????????? ???????????????.",
            },
            minLength: {
              value: 2,
              message: "???????????? 2?????? ???????????????.",
            },
            maxLength: {
              value: 8,
              message: "???????????? 8?????? ???????????????.",
            },
          })}
          errorMessage={errors?.position && errors?.position.message}
        />

        <div
          style={{ display: "flex", gap: theme.spacing.sm, marginTop: "auto" }}
        >
          <EndSubmitButton
            onClick={handleSubmit(onSubmit)}
            disabled={updatePositionLoading || isSubmitDisabled}
            text="??????"
          />

          <EndSubmitButton
            onClick={handleDeletePosition}
            disabled={deletePositionLoading || !clickedPositionId}
            text="??????"
          />
        </div>
      </Form>
    </>
  );
};

export default MutatePositionForm;

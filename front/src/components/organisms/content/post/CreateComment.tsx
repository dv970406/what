import { faI } from "@fortawesome/pro-solid-svg-icons";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useCreateComment } from "../../../../client/post/CreateComment.client";
import { Form } from "../../../atomics/form/Form";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";
import { TextInput } from "../../../molecules/inputs/TextInput";

interface ICreateCommentForm {
  content: string;
}

interface ICreateComment {
  postId: string;
}
const CreateComment = ({ postId }: ICreateComment) => {
  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<ICreateCommentForm>({ mode: "onChange" });

  const { createCommentMutation, createCommentLoading, createCommentSuccess } =
    useCreateComment();
  const onSubmit: SubmitHandler<ICreateCommentForm> = ({ content }) => {
    if (createCommentLoading) return;
    createCommentMutation({
      postId,
      content,
    });
  };

  const { content: watchContent } = watch();
  const isSubmitDisabled = !!errors.content || !watchContent;
  useEffect(() => {
    if (createCommentSuccess) setValue("content", "");
  }, [createCommentSuccess]);
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        label="댓글"
        register={register("content", {
          required: {
            value: true,
            message: "댓글은 필수입니다.",
          },
          minLength: {
            value: 2,
            message: "댓글은 2글자 이상입니다.",
          },
          maxLength: {
            value: 100,
            message: "댓글은 100자 이하입니다.",
          },
        })}
        errorMessage={errors.content && errors.content.message}
        placeholder="댓글을 입력하세요."
        icon={faI}
      />
      <EndSubmitButton
        onClick={handleSubmit(onSubmit)}
        disabled={createCommentLoading || isSubmitDisabled}
        text="댓글 추가"
      />
    </Form>
  );
};

export default CreateComment;

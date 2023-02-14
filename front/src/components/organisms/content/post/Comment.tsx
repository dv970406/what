import { faEraser } from "@fortawesome/pro-solid-svg-icons";
import { graphql } from "babel-plugin-relay/macro";
import React, { MouseEventHandler } from "react";
import { useFragment } from "react-relay";
import { useDeleteComment } from "../../../../client/post/DeleteComment.client";
import { getElaspedDay } from "../../../../utils/time/time";
import { SectionText } from "../../../atomics/typographys/texts";
import { SubTitle } from "../../../atomics/typographys/titles";
import { ButtonIcon } from "../../../molecules/buttons/Buttons";
import { Comment_comment$key } from "./__generated__/Comment_comment.graphql";

const commentFragment = graphql`
  fragment Comment_comment on Comment {
    id
    content
    user {
      id
      name
    }
    isMyComment
    createdAt
  }
`;

interface IComment {
  comment: Comment_comment$key;
}
const Comment = ({ comment }: IComment) => {
  const commentData = useFragment(commentFragment, comment);

  const { deleteCommentMutation, deleteCommentLoading } = useDeleteComment();
  const handleDeleteComment = (commentId: string) => {
    if (deleteCommentLoading) return;
    deleteCommentMutation({
      id: commentId,
    });
  };
  return (
    <div>
      <SubTitle>{commentData.user.name}</SubTitle>
      {commentData.isMyComment && (
        <ButtonIcon
          icon={faEraser}
          onClick={() => handleDeleteComment(commentData.id)}
        />
      )}
      <SectionText>{commentData.content}</SectionText>
      <div>
        <SectionText>{getElaspedDay(commentData.createdAt)}</SectionText>
      </div>
    </div>
  );
};

export default React.memo(Comment);
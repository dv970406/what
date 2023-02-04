import { graphql } from "babel-plugin-relay/macro";
import { useState } from "react";
import { commitMutation, useMutation } from "react-relay";
import { useNavigate } from "react-router-dom";
import { environment } from "../client";
import {
  UpdateUserMutation,
  UpdateUserMutation$variables,
} from "./__generated__/UpdateUserMutation.graphql";

const updateUserQuery = graphql`
  mutation UpdateUserMutation(
    $userId: ID!
    $email: String
    $isManager: Boolean
    $name: String
    $joinDate: DateTime
    $availableVacation: String
    $positionId: ID
    $teamId: ID
  ) {
    updateUser(
      input: {
        userId: $userId
        email: $email
        isManager: $isManager
        name: $name
        joinDate: $joinDate
        availableVacation: $availableVacation
        positionId: $positionId
        teamId: $teamId
      }
    ) {
      ok
      error
    }
  }
`;

export const useUpdateUser = () => {
  const [updateUserLoading, setIsLoading] = useState(false);
  const updateUserMutation = (variables: UpdateUserMutation$variables) => {
    setIsLoading(true);
    commitMutation<UpdateUserMutation>(environment, {
      mutation: updateUserQuery,
      variables,

      onCompleted: ({ updateUser: { ok, error } }) => {
        setIsLoading(false);
        if (!ok) {
          alert(error);
          return;
        }

        alert("저장되었습니다.");
      },
    });
  };

  return { updateUserMutation, updateUserLoading };
};
import { graphql } from "babel-plugin-relay/macro";
import { useEffect, useState } from "react";
import { commitMutation, useMutation } from "react-relay";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { environment } from "../client";
import {
  LoginMutation,
  LoginMutation$data,
  LoginMutation$variables,
} from "./__generated__/LoginMutation.graphql";

const loginQuery = graphql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      ok
      error
      token
    }
  }
`;

export const useLogin = () => {
  const [loginLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const loginMutation = (variables: LoginMutation$variables) => {
    setIsLoading(true);
    commitMutation<LoginMutation>(environment, {
      mutation: loginQuery,
      variables,

      onCompleted: ({ login: { ok, error, token } }) => {
        if (!ok || !token) {
          alert(error);
          return;
        }
        localStorage.setItem("TOKEN", token);
        // 홈으로 푸시
        navigate("/");
        setIsLoading(false);
      },
    });
  };

  return { loginMutation, loginLoading };
};

// export const saveToken = (
//   { login: { ok, token, error } }: LoginMutation$data,
//   navigate: NavigateFunction
// ) => {
//   if (!ok || !token) {
//     alert(error);
//     return;
//   }
//   localStorage.setItem("TOKEN", token);
//   // 홈으로 푸시
//   navigate("/");
// };

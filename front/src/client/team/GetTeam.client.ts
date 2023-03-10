import { graphql } from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { GetTeamQuery } from "./__generated__/GetTeamQuery.graphql";

const getTeamQuery = graphql`
  query GetTeamQuery($id: ID!) {
    getTeam(input: { id: $id }) {
      ok
      error
      team {
        id
        team
      }
    }
  }
`;

export const useGetTeam = (teamId: string) => {
  const {
    getTeam: { ok, error, team },
  } = useLazyLoadQuery<GetTeamQuery>(getTeamQuery, {
    id: teamId,
  });
  if (!ok) {
    alert(error);
  }
  return { team };
};

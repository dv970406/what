/**
 * @generated SignedSource<<b301eb53dbb0ead8f638a84572d440ff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ManagerUserTableContent_user$data = {
  readonly createdAt: any;
  readonly email: string;
  readonly id: string;
  readonly isManager: boolean;
  readonly joinDate: any;
  readonly name: string;
  readonly position: {
    readonly id: string;
    readonly position: string;
  };
  readonly team: {
    readonly id: string;
    readonly team: string;
  };
  readonly " $fragmentType": "ManagerUserTableContent_user";
};
export type ManagerUserTableContent_user$key = {
  readonly " $data"?: ManagerUserTableContent_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"ManagerUserTableContent_user">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ManagerUserTableContent_user",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "email",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isManager",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Position",
      "kind": "LinkedField",
      "name": "position",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "position",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Team",
      "kind": "LinkedField",
      "name": "team",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "team",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "joinDate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

(node as any).hash = "090c706c746a3335a329e1366924affc";

export default node;

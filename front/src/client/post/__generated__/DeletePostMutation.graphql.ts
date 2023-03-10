/**
 * @generated SignedSource<<c2dab6cdc6e49b12c1bb7044005b58f7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeletePostMutation$variables = {
  id: string;
};
export type DeletePostMutation$data = {
  readonly deletePost: {
    readonly deletedPostId: string | null;
    readonly error: string | null;
    readonly ok: boolean;
  };
};
export type DeletePostMutation = {
  response: DeletePostMutation$data;
  variables: DeletePostMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedPostId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "DeletePostMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeletePostOutput",
        "kind": "LinkedField",
        "name": "deletePost",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "DeletePostMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "DeletePostOutput",
        "kind": "LinkedField",
        "name": "deletePost",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          (v4/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteRecord",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedPostId"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "68665ed12bf8cfbe3a34fb7112a7cf8d",
    "id": null,
    "metadata": {},
    "name": "DeletePostMutation",
    "operationKind": "mutation",
    "text": "mutation DeletePostMutation(\n  $id: ID!\n) {\n  deletePost(input: {id: $id}) {\n    ok\n    error\n    deletedPostId\n  }\n}\n"
  }
};
})();

(node as any).hash = "37c6dbf6cb51d451cbc23f00352de5cf";

export default node;

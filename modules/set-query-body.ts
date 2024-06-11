import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function policy(
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {

  const query = {
    "structuredQuery": {
      "from": [
        {
          "collectionId": "todos"
        }
      ]
    }
  };

  const nr = new ZuploRequest(request, {
    body: JSON.stringify(query),
    method: "POST"
  })

  return nr;
}

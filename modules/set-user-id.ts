import {ZuploContext, ZuploRequest} from "@zuplo/runtime";

export default async function policy(
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {

  const data = await request.json();
  data.userId = request.user.sub;

  return new ZuploRequest(request, {
    body: JSON.stringify(data)
  });
}

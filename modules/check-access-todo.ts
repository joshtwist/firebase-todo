import {environment, HttpProblems, ZuploContext, ZuploRequest} from "@zuplo/runtime";


export default async function policy(
  request: ZuploRequest,
  context: ZuploContext,
  options: never,
  policyName: string
) {
  const url = `https://firestore.googleapis.com/v1/projects/${environment.PROJECT_ID}/databases/(default)/documents/todos/${request.params.todoId}`

  const req = new Request(url, {
    headers: request.headers
  });

  const response = await fetch(req);

  if (response.status !== 200) {
    return response;
  }

  const data = await response.json();

  context.log.info(data);

  const userId = data.fields?.userId?.stringValue;

  if (userId !== request.user.sub) {
    return HttpProblems.forbidden(request, context, { detail: "This item does not exist or you do not have permissions to access it"});
  }

  return request;
}

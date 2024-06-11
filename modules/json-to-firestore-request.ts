import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (request: ZuploRequest, context: ZuploContext) {
  const requestBody = await request.json();

  // Transform the incoming JSON body into Firestore format
  const firestoreDocument = {
    fields: {}
  };

  for (const [key, value] of Object.entries(requestBody)) {
    let firestoreValue;

    switch (typeof value) {
      case "string":
        firestoreValue = { stringValue: value };
        break;
      case "boolean":
        firestoreValue = { booleanValue: value };
        break;
      case "number":
        if (Number.isInteger(value)) {
          firestoreValue = { integerValue: value.toString() };
        } else {
          firestoreValue = { doubleValue: value };
        }
        break;
      default:
        throw new Error(`Unsupported data type for key ${key}`);
    }

    firestoreDocument.fields[key] = firestoreValue;
  }

  const nr = new ZuploRequest(request, {
    body: JSON.stringify(firestoreDocument)
  });

  nr.headers.set("content-type", "application/json")

  // Continue processing the request
  return nr;
}

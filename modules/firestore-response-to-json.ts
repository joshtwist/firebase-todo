import { ZuploContext, ZuploRequest } from "@zuplo/runtime";

type MyPolicyOptionsType = {
  documentId: string
};

export default async function policy(
  response: Response,
  request: ZuploRequest,
  context: ZuploContext,
  options: MyPolicyOptionsType,
  policyName: string
) {
  if (response.ok) {
    const data = await response.json();
    context.log.info(data);

    const documentId = options.documentId ?? "id";

    let transformed;

    if (!Array.isArray(data)) {
      transformed = transformDoc(data, documentId);
    }
    else {
      // Check if the data is an array and has documents or only contains readTime
      transformed = (Array.isArray(data) && data.some(item => item.document))
        ? transformFirestoreResults(data, documentId)
        : [];
    }

    return new Response(JSON.stringify(transformed), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  }

  return response;
}

function transformFirestoreResults(results: any[], documentId: string) {
  return results.map(result => {
    const { document } = result;
    return transformDoc(document, documentId);
  });
}

function transformDoc(document: any, documentId: string) {
  const fields = document.fields;

  let transformedDoc = {
    [documentId]: document.name.substring(document.name.lastIndexOf('/') + 1)
  };

  for (let field in fields) {
    const value = fields[field];
    const valueType = Object.keys(value)[0];
    transformedDoc[field] = parseValue(value[valueType], valueType, documentId);
  }

  return transformedDoc;
}

function parseValue(value: any, valueType: string, documentId: string) {
  switch (valueType) {
    case 'stringValue':
      return value;
    case 'booleanValue':
      return value;
    case 'integerValue':
      return parseInt(value, 10);
    case 'doubleValue':
      return parseFloat(value);
    case 'timestampValue':
      return new Date(value);
    case 'mapValue':
      return transformFirestoreResults([value], documentId);
    case 'arrayValue':
      return value.values.map(v => parseValue(v[Object.keys(v)[0]], Object.keys(v)[0], documentId));
    case 'nullValue':
      return null;
    default:
      return value;
  }
}
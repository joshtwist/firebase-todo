import { environment, ZuploContext, ZuploRequest } from "@zuplo/runtime";

export default async function (request: ZuploRequest, context: ZuploContext) {

  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${environment.PROJECT_ID}/databases/(default)/documents:runQuery`;

  const query = {
    "structuredQuery": {
      "from": [
        {
          "collectionId": "todos"
        }
      ],
      "where": {
        "fieldFilter": {
          "field": {
            "fieldPath": "userId"
          },
          "op": "EQUAL",
          "value": {
            "stringValue": request.user.sub
          }
        }
      }
    }
  };

  context.log.info(query, firestoreUrl);

  // Query Firestore
  const todosResponse = await fetch(firestoreUrl, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(query)
  });

  const todosJson = await todosResponse.json();

  context.log.info(todosJson);

  // Collate results
  const todos = todosJson.map(doc => doc.document.fields.description.stringValue);

  const prompt = {
    "contents": [{
      "parts": [{
        "text": `Here are some tasks: '${todos.join(', ')}'. Write a funny one-sentence summary. Make me laugh`
      }]
    }]
  }

  // Send request to Gemini
  const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${environment.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(prompt)
  });

  if (!geminiResponse.ok) {
    throw new Error(`Gemini request failed: ${geminiResponse.status} - ${geminiResponse.statusText}
    
${await geminiResponse.text()}`);
  }
  const geminiData = await geminiResponse.json();

  // Extract summary from Gemini's response
  const summary = geminiData.candidates[0].content.parts[0].text.trim();

  // Send response
  return { response: summary }
}
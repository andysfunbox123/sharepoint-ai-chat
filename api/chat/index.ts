import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest) {
  try {
    const { query, context: documentContext } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps users find information in their SharePoint documents. 
                   Use the following document context to answer the user's question: \n\n${documentContext}`
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    context.res = {
      status: 200,
      body: {
        message: completion.choices[0].message.content
      }
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: {
        error: "An error occurred while processing your request"
      }
    };
  }
};

export default httpTrigger;
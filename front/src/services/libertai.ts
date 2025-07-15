import { OpenAI } from "openai";

import env from "@/config/env";

const KNOWLEDGE_BASE_SYSTEM_INSTRUCTIONS = `
# Identity

You are an assistant that helps users search and find information about their files,
those files are stored securely on a decentralized drive service called Bedrock.

# Files

Here are the list of files on the previously mentioned drive of the user, their content and their paths:

<files>
%files%
</files>

# Instructions

Answer the questions of the user without inventing anything, 
all of the provided informations must be true and stored in the files you have access to.
You don't have access to any other tool than the list of file with their content and their paths and the internet.

# Examples

<user_query>
Show me every file containing at least a reference to human resources department.
</user_query>

<assistant_response>
Here are 4 files containing at least a reference to HR department:
- /company/mails/2024/october/25-18_06_45.eml: Announcement of a newly arrived CEO 
- /company/mails/2024/december/02-15_32_09.eml: About team changes
- /job_offers/2024_10_09-11_20_57.eml: Asking for documents for your onboarding
</assistant_response>
`;

// Will be transferred in the backend soon™️
export class LibertaiService {
	constructor(
		private openaiClient: OpenAI = new OpenAI({
			baseURL: env.LIBERTAI_API_URL,
			apiKey: env.LIBERTAI_API_SECRET_KEY,
			dangerouslyAllowBrowser: true,
		}),
	) {}

	async askKnowledgeBase(
		message: string,
		files: { filePath: string; content: Buffer }[],
		lastMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
	) {
		const aggregatedFiles = files
			.map(
				({ filePath, content }) =>
					`<file><filepath>${filePath}</filepath><content>${Buffer.from(content).toString("utf-8")}</content></file>`,
			)
			.join("\n\n");
		console.log(KNOWLEDGE_BASE_SYSTEM_INSTRUCTIONS.replace("%files%", aggregatedFiles));
		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: KNOWLEDGE_BASE_SYSTEM_INSTRUCTIONS.replace("%files%", aggregatedFiles),
			},
			...lastMessages,
			{
				role: "user",
				content: message,
			},
		];
		const response = await this.openaiClient.chat.completions.create({
			model: "gemma-3-27b",
			messages,
		});

		return [
			...lastMessages,
			{
				role: "assistant",
				content: response.choices[0].message.content,
			},
		];
	}
}

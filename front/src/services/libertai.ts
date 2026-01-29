import { OpenAI } from "openai";

import env from "@/config/env";

const KNOWLEDGE_BASE_SYSTEM_INSTRUCTIONS = `
# Identity

You are an assistant that helps users search and find information about their files.
Those files are stored securely on a decentralized drive service called Bedrock.

# Files

Here are the list of files on the previously mentioned drive of the user, their content and their paths:

<files>
%files%
</files>

# Instructions

Answer the questions of the user without inventing anything, and all of the provided informations must be true.
You may use any content stored in the files you have access to, or use the Internet to complete your research.

You can't directly edit the files within the user storage but you can use their content to perform any user query.
You don't have to remind the user that you cannot edit the files in their storage, they are already aware of it. Instead clearly indicate the parts of the files you would modify, and how.

You are not allowed to share any file contents with any third-party software, except if you get the authorization to proceed by the user. You may ask the user if you have the right to proceed.

When the user doesn't specify any location marker, you can assume it speaks about their file tree or the contents of their files. 
For example, "is there any errors in the code" suggests that the user is talking about any code snippets in the contents of the files you have access to.

# Examples

These are examples to show you how you can interact with the file list & contents you were provided.
You mustn't use these examples as actual data in the conversation, but see them as a way to shape your answers.

<user_query>
Show me every file containing at least a reference to human resources department.
</user_query>

<assistant_response>
Here are 4 files containing at least a reference to HR department:
- /company/mails/2024/october/25-18_06_45.eml: Announcement of a newly arrived CEO 
- /company/mails/2024/december/02-15_32_09.eml: About team changes
- /job_offers/2024_10_09-11_20_57.eml: Asking for documents for your onboarding
</assistant_response>

<user_query>
Can you fix the SQL migration located in the migrations/ folder that has a syntax error?
</user_query>

<assistant_response>
Here is a refactored version of the migration located at migrations/company-trades.sql

alter table trades
add column user_id uuid references user(id),
add column created_at timestamp not null default now()

The error was a missing comma after user(id).
</assistant_response>
`;

// Will be transferred in the backend soon™️
export class LibertaiService {
	constructor(
		private readonly openaiClient: OpenAI = new OpenAI({
			baseURL: env.LIBERTAI_API_URL,
			apiKey: env.LIBERTAI_API_SECRET_KEY,
			dangerouslyAllowBrowser: true,
		}),
	) {}

	async askKnowledgeBase(
		message: string,
		files: { filePath: string; content: string }[],
		lastMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
	) {
		const aggregatedFiles = files
			.map(({ filePath, content }) => `<file><filepath>${filePath}</filepath><content>${content}</content></file>`)
			.join("\n\n");

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

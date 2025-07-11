import { OpenAI } from "openai";

import env from "@/config/env";

const KNOWLEDGE_BASE_SYSTEM_INSTRUCTIONS = `
# Identity\\n\\nYou are an assistant that helps users search and find informations about their files,\\nthose files are stored securely on a decentralized drive service called Bedrock.\\n\\n# Files\\n\\n%files%\\n\\n# Instructions\\n\\nAnswer the questions of the user without inventing anything, \\nall of the provided informations must be true and stored in the files you have access to \\n\\n# Examples\\n\\n<user_query>\\nShow me every file containing at leat a reference to human resources department.\\n</user_query>\\n\\n<assistant_response>\\nHere are 4 files containing at least a reference to HR department:\\n- /company/mails/2024/october/25-18_06_45.eml: Announcement of a newly arrived CEO \\n- /company/mails/2024/december/02-15_32_09.eml: About team changes\\n- /job_offers/2024_10_09-11_20_57.eml: Asking for documents for your onboarding\\n</assistant_response>
`;

// Will be transferred in the backend soon™️
export class LibertaiService {
	constructor(
		private openaiClient: OpenAI = new OpenAI({ baseURL: env.LIBERTAI_API_URL, apiKey: env.LIBERTAI_API_SECRET_KEY }),
	) {}

	async askKnowledgeBase(
		message: string,
		files: { filePath: string; content: ArrayBuffer }[],
		lastMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [],
	) {
		const aggregatedFiles = files.map(({ filePath, content }) => `${filePath}:\n${content}`).join("\n\n\n");
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
			model: "hermes-3-8b-tee",
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

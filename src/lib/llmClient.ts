import OpenAI from "openai";
import { OPENROUTER_BASE_URL, LLM_TIMEOUT_MS } from "./config";

let appClient: OpenAI | null = null;

function buildClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey, baseURL: OPENROUTER_BASE_URL, timeout: LLM_TIMEOUT_MS, maxRetries: 0 });
}

function getAppClient(): OpenAI {
  appClient ??= buildClient(process.env.LLM_API_KEY ?? "");
  return appClient;
}

export function getClient(userApiKey?: string | null): OpenAI {
  return userApiKey ? buildClient(userApiKey) : getAppClient();
}

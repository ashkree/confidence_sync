from langchain_aws import BedrockEmbeddings, ChatBedrockConverse
from langchain_core.documents import Document as LcDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.repository.aws import AWSRepo

_ROLE_MAP = {"user": "human", "assistant": "ai"}

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)


class BedrockRepo(AWSRepo):
    def __init__(self):
        super().__init__(
            "bedrock-runtime",
            region_name=settings.aws_region,
            endpoint_url=settings.bedrock_endpoint_url,
        )

        self.converse = ChatBedrockConverse(
            client=self.client, model="anthropic.claude-3-haiku-20240307-v1:0"
        )

        self.embed = BedrockEmbeddings(client=self.client)

    def chat(self, messages: list[dict], system_prompt: str | None = None) -> str:
        formatted = self._format_messages(messages, system_prompt)
        try:
            response = self.converse.invoke(formatted)
        except Exception:
            import traceback

            traceback.print_exc()
            raise
        return self._extract_text(response.content)

    @staticmethod
    def _extract_text(content: str | list[str | dict]) -> str:
        """Normalize LangChain message content into a plain string.

        `AIMessage.content` can be a plain string, or a list of content
        blocks (e.g. {"type": "text", "text": "..."}) when the model
        returns multi-part output. Callers assigning to a
        `Mapped[str | None]` column expect a plain string.
        """
        if isinstance(content, str):
            return content

        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict):
                parts.append(block.get("text", ""))
        return "".join(parts)

    def embed_text(self, text: str) -> list[float]:
        return self.embed.embed_query(text)

    def embed_pdf(self, docs: list[LcDocument]):
        chunks = splitter.split_documents(docs)

        texts = [chunk.page_content for chunk in chunks]
        vectors = self.embed.embed_documents(
            texts
        )  # batch call instead of looping embed_query

        return chunks, vectors

    def _format_messages(
        self, messages: list[dict], system_prompt: str | None = None
    ) -> list[tuple]:
        formatted = []
        if system_prompt:
            formatted.append(("system", system_prompt))
        formatted.extend(
            (_ROLE_MAP.get(m["role"], m["role"]), m["content"]) for m in messages
        )
        return formatted


bedrockRepo = BedrockRepo()


if __name__ == "__main__":
    bedrockRepo = BedrockRepo()

    messages = [{"role": "user", "content": "What is the capital of the philippines"}]

    try:
        response = bedrockRepo.chat(messages=messages)

        __import__("pprint").pprint(response)
    except Exception as e:
        # botocore will raise on anything that doesn't look like a valid
        # response shape (missing fields, wrong types, bad JSON) — the
        # exception message is usually exactly what's mismatched.
        print(f"❌ boto3 rejected the response: {e}")
        raise

    try:
        response = bedrockRepo.embed_text(text="This is just a quick embedding test")
        __import__("pprint").pprint(response)
        print(len(response), response[:5])
    except Exception as e:
        # botocore will raise on anything that doesn't look like a valid
        # response shape (missing fields, wrong types, bad JSON) — the
        # exception message is usually exactly what's mismatched.
        print(f"❌ boto3 rejected the response: {e}")
        raise

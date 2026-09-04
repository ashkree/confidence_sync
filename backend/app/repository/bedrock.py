import asyncio
from functools import lru_cache

from botocore.discovery import BotoCoreError
from botocore.utils import ClientError
from langchain_aws import BedrockEmbeddings, ChatBedrockConverse
from langchain_core.documents import Document as LcDocument
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.exceptions.external import BedrockUnavailableError
from app.models.chat_message import MessageRole
from app.repository.aws import AWSRepo

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

    # Async wrapper functions
    async def chat(
        self, messages: list[tuple[MessageRole, str]], system_prompt: str | None = None
    ) -> str:
        return await asyncio.to_thread(self._chat, messages, system_prompt)

    async def embed_text(self, text: str) -> list[float]:
        return await asyncio.to_thread(self._embed_text, text)

    async def embed_pdf(self, docs: list[LcDocument]):
        return await asyncio.to_thread(self._embed_pdf, docs)

    # Sync callers
    def _chat(
        self, messages: list[tuple[MessageRole, str]], system_prompt: str | None = None
    ) -> str:
        formatted = (
            [("system", system_prompt)] + messages if system_prompt else messages
        )

        try:
            response = self.converse.invoke(formatted)
        except (ClientError, BotoCoreError) as e:
            raise BedrockUnavailableError(f"Bedrock chat request failed: {e}") from e

        return self._extract_text(response.content)

    def _embed_text(self, text: str) -> list[float]:

        try:
            return self.embed.embed_query(text)
        except (ClientError, BotoCoreError) as e:
            raise BedrockUnavailableError(
                f"Bedrock embedding request failed: {e}"
            ) from e

    def _embed_pdf(self, docs: list[LcDocument]):

        chunks = splitter.split_documents(docs)
        texts = [chunk.page_content for chunk in chunks]

        try:
            vectors = self.embed.embed_documents(
                texts
            )  # batch call instead of looping embed_query
        except (ClientError, BotoCoreError) as e:
            raise BedrockUnavailableError(
                f"Bedrock embedding request failed: {e}"
            ) from e

        return chunks, vectors

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


@lru_cache
def get_bedrock_client() -> BedrockRepo:
    return BedrockRepo()

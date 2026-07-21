from typing import List, Optional
from PIL import Image
from config.settings import settings


class MultimodalService:
    def __init__(self):
        # Model is loaded lazily on first use — do NOT load at startup
        # Florence-2 is ~1.5GB and will cause startup timeouts on Azure
        self._model = None
        self._processor = None
        self._device = None

    def _load_model(self):
        """Load Florence-2 model on first use."""
        if self._model is None:
            import torch
            from transformers import AutoProcessor, AutoModelForCausalLM
            self._device = "cuda" if torch.cuda.is_available() else "cpu"
            model_name = "microsoft/Florence-2-base"
            self._processor = AutoProcessor.from_pretrained(model_name, trust_remote_code=True)
            self._model = AutoModelForCausalLM.from_pretrained(
                model_name,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self._device == "cuda" else torch.float32
            ).to(self._device)

    def generate_response(
        self,
        query: str,
        context: str,
        images: Optional[List[Image.Image]] = None
    ) -> str:
        try:
            # Use OpenAI if available — much faster and no local model download needed
            if settings.OPENAI_API_KEY:
                return self._generate_with_openai(query, context)

            # Fall back to Florence-2 local model
            self._load_model()
            import torch
            prompt = (
                f"Answer the following question based on the context provided.\n\n"
                f"Question: {query}\n\nContext: {context}"
            )

            if images and len(images) > 0:
                image = images[0]
                inputs = self._processor(
                    text=prompt, images=image, return_tensors="pt"
                ).to(self._device, self._model.dtype)
                generated_ids = self._model.generate(
                    input_ids=inputs["input_ids"],
                    pixel_values=inputs["pixel_values"],
                    max_new_tokens=1024,
                    num_beams=3,
                    do_sample=False
                )
                generated_text = self._processor.batch_decode(
                    generated_ids, skip_special_tokens=False
                )[0]
                parsed = self._processor.post_process_generation(
                    generated_text,
                    task="<MORE_DETAILED_CAPTION>",
                    image_size=(image.width, image.height)
                )
                return parsed.get("<MORE_DETAILED_CAPTION>", generated_text)
            else:
                inputs = self._processor(text=prompt, return_tensors="pt").to(self._device)
                generated_ids = self._model.generate(
                    input_ids=inputs["input_ids"],
                    max_new_tokens=1024,
                    num_beams=3,
                    do_sample=False
                )
                return self._processor.batch_decode(generated_ids, skip_special_tokens=False)[0]

        except Exception as e:
            return f"Could not generate response: {str(e)}"

    def _generate_with_openai(self, query: str, context: str) -> str:
        """Use OpenAI API for response generation — preferred in production."""
        try:
            from langchain_openai import ChatOpenAI
            from langchain_core.messages import HumanMessage, SystemMessage

            llm = ChatOpenAI(
                model=settings.OPENAI_MODEL,
                api_key=settings.OPENAI_API_KEY,
                temperature=0.3
            )
            messages = [
                SystemMessage(content="You are a helpful enterprise knowledge assistant. Answer questions based on the provided context."),
                HumanMessage(content=f"Context:\n{context}\n\nQuestion: {query}")
            ]
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Could not generate response: {str(e)}"


multimodal_service = MultimodalService()

from typing import List, Optional
from PIL import Image
import torch
from transformers import AutoProcessor, AutoModelForCausalLM
from config.settings import settings


class MultimodalService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "microsoft/Florence-2-base"
        self.processor = AutoProcessor.from_pretrained(self.model_name, trust_remote_code=True)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name, 
            trust_remote_code=True, 
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
        ).to(self.device)

    def generate_response(
        self,
        query: str,
        context: str,
        images: Optional[List[Image.Image]] = None
    ) -> str:
        try:
            prompt = (
                f"Answer the following question based on the context provided. "
                f"If images are provided, also use them to inform your answer.\n\n"
                f"Question: {query}\n\n"
                f"Context: {context}"
            )

            if images and len(images) > 0:
                image = images[0]
                inputs = self.processor(text=prompt, images=image, return_tensors="pt").to(self.device, self.model.dtype)
                generated_ids = self.model.generate(
                    input_ids=inputs["input_ids"],
                    pixel_values=inputs["pixel_values"],
                    max_new_tokens=1024,
                    num_beams=3,
                    do_sample=False
                )
                generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
                parsed_answer = self.processor.post_process_generation(
                    generated_text, 
                    task="<MORE_DETAILED_CAPTION>", 
                    image_size=(image.width, image.height)
                )
                final_answer = parsed_answer.get("<MORE_DETAILED_CAPTION>", "")
            else:
                inputs = self.processor(text=prompt, return_tensors="pt").to(self.device)
                generated_ids = self.model.generate(
                    input_ids=inputs["input_ids"],
                    max_new_tokens=1024,
                    num_beams=3,
                    do_sample=False
                )
                generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
                final_answer = generated_text

            return final_answer
        except Exception as e:
            return f"Could not generate response: {str(e)}"


multimodal_service = MultimodalService()

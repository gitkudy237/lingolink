from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

app = FastAPI(title="NLLB Translation API for Chat")

# Load model and tokenizer globally once on startup
# Use "facebook/nllb-200-distilled-600M" for a lightweight, fast production version
MODEL_NAME = "facebook/nllb-200-distilled-600M"
device = "cuda" if torch.cuda.is_available() else "cpu"

print(cls_msg := f"Loading {MODEL_NAME} on {device}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME).to(device)
print("Model loaded successfully.")


class TranslationRequest(BaseModel):
    text: str = Field(..., example="Bonjour, comment ça va?")
    source_lang: str = Field(..., example="fra_Latn")
    target_lang: str = Field(..., example="wes_Latn")


class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str


@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    try:
        tokenizer.src_lang = request.source_lang

        inputs = tokenizer(request.text, return_tensors="pt").to(device)

        forced_bos_token_id = tokenizer.convert_tokens_to_ids(
            request.target_lang
        )

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                forced_bos_token_id=forced_bos_token_id,
                max_length=512,
            )

        translated_text = tokenizer.decode(
            outputs[0], skip_special_tokens=True
        )

        return TranslationResponse(
            translated_text=translated_text,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
        )

    except ValueError as ve:
        raise HTTPException(
            status_code=400, detail=f"Invalid language code: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

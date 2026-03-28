import os
import re
import tempfile
from datetime import date, timedelta
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.models.category import Category
from app.dependencies import get_current_user

router = APIRouter(prefix="/voice-expense", tags=["voice"])

def parse_transcript(transcript: str, categories: list):
    # Extract amount, category_id and date from a spoken transcript.
    transcript_lower = transcript.lower()

    #Amount
    amount_match = re.search(r'\b(\d+(?:\.\d{1,2})?)\b', transcript_lower)
    amount = float(amount_match.group(1)) if amount_match else None

    #Date
    today = date.today()
    if 'yesterday' in transcript_lower:
        expense_date = today - timedelta(days=1)
    elif 'last week' in transcript_lower:
        expense_date = today - timedelta(weeks=1)
    else:
        expense_date = today

    #Category (word-level keyword match)
    category_id = None
    transcript_words = set(re.findall(r'\b\w+\b', transcript_lower))
    for cat in categories:
        cat_words = set(re.findall(r'\b\w+\b', cat.name.lower()))
        if transcript_words & cat_words:   # any word in common → match
            category_id = cat.id
            break

    return {
        "transcript": transcript,
        "amount": amount,
        "category_id": category_id,
        "expense_date": str(expense_date),
    }


@router.post("/")
async def voice_expense(
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        import speech_recognition as sr
        from pydub import AudioSegment

        # Save uploaded file to a temp file
        suffix = os.path.splitext(audio.filename or "audio.m4a")[1] or ".m4a"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await audio.read())
            tmp_path = tmp.name

        # Convert to WAV (SpeechRecognition needs WAV)
        wav_path = tmp_path.replace(suffix, ".wav")
        audio_seg = AudioSegment.from_file(tmp_path)
        audio_seg.export(wav_path, format="wav")

        # Transcribe
        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
        transcript = recognizer.recognize_google(audio_data)

        # Cleanup temp files
        os.unlink(tmp_path)
        os.unlink(wav_path)

        # Parse transcript
        categories = db.query(Category).all()
        result = parse_transcript(transcript, categories)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")

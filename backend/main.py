from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS Middleware
# Allows the React frontend running on localhost:5173 to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LASTFM_API_KEY = os.getenv("LASTFM_API_KEY")
LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0/"

@app.get("/api/search")
def search_tracks(q: str):
    """
    Search for tracks using the iTunes API to get high-res album covers.
    Expects a query parameter 'q' containing the search text.
    """
    try:
        itunes_url = "https://itunes.apple.com/search"
        params = {
            "term": q,
            "entity": "song",
            "limit": 15
        }
        
        response = requests.get(itunes_url, params=params)
        response.raise_for_status()
        data = response.json()
        
        formatted_results = []
        for track in data.get("results", []):
            # Upgrading artwork resolution from 100x100 to 300x300 for premium UI
            image_url = track.get("artworkUrl100", "")
            if image_url:
                image_url = image_url.replace("100x100bb", "300x300bb")
                
            formatted_results.append({
                "name": track.get("trackName"),
                "artist": track.get("artistName"),
                "image": image_url
            })
            
        return {"results": formatted_results}
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data from iTunes API: {str(e)}")

from pydantic import BaseModel
from typing import List, Optional
from arrange import arrange_tracks

class TrackInput(BaseModel):
    id: str | int | None = None
    title: str
    artist: str
    bpm: float
    camelot_key: str

@app.post("/api/arrange")
def auto_arrange(tracks: List[TrackInput]):
    """
    Accepts a list of tracks and sorts them by Camelot Key and BPM.
    """
    track_dicts = [t.dict() for t in tracks]
    arranged_tracks = arrange_tracks(track_dicts)
    return {"optimized_setlist": arranged_tracks}

# To run the server locally:
# uvicorn main:app --reload

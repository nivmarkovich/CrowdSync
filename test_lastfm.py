import requests

# המפתח שהרגע קיבלת
API_KEY = "c73d92f571d57da88878bce576b0376c
# השיר שאנחנו רוצים לבדוק (אפשר לשנות לכל שיר שבא לך!)
ARTIST = "Avicii"
TRACK = "Wake Me Up"

print(f"🔍 Searching data for: {TRACK} by {ARTIST}...")

# פונים לשרתים של Last.fm
url = f"http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key={API_KEY}&artist={ARTIST}&track={TRACK}&format=json"

response = requests.get(url)
data = response.json()

# שולפים את התגיות של השיר
if "track" in data and "toptags" in data["track"]:
    tags = [tag["name"] for tag in data["track"]["toptags"]["tag"]]
    print(f"\n✅ Success! The crowd tags for this song are:")
    for i, tag in enumerate(tags[:5], 1): # מציג את 5 התגיות החזקות ביותר
        print(f"{i}. {tag}")
else:
    print("\n❌ Could not find track or tags. Check spelling or API Key.")
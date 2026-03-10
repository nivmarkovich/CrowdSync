export type MockTrack = {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    key: string;
    genre: string;
};

export type MockRequest = {
    id: string;
    title: string;
    artist: string;
    matchScore: number;
    status: "perfect" | "neutral" | "bad";
    statusBadge: string;
    statusMessage: string;
};

const artists = [
    "FISHER", "James Hype", "Dom Dolla", "John Summit", "Chris Lake",
    "Tiesto", "David Guetta", "Calvin Harris", "Fred again..", "Skrillex",
    "Peggy Gou", "Bicep", "CamelPhat", "Gorgon City", "Meduza",
    "Disclosure", "Rufa Du Sol", "Eric Prydz", "Diplo", "Vintage Culture"
];

const titles = [
    "Losing It", "Ferrari", "Rhyme Dust", "Where You Are", "Turn Off The Lights",
    "The Business", "Titanium", "One Kiss", "Rumble", "Bangarang",
    "(It Goes Like) Nanana", "Glue", "Cola", "Ready For Your Love", "Piece Of Your Heart",
    "Latch", "Innerbloom", "Opus", "On My Mind", "Drinkee"
];

const genres = ["Tech House", "Bass House", "Deep House", "Techno", "Melodic House", "UKG"];
const keys = ["1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "11A", "12A", "1B", "2B", "3B", "4B", "5B", "6B", "7B", "8B", "9B", "10B", "11B", "12B"];

export const generateMockLibrary = (): MockTrack[] => {
    const library: MockTrack[] = [];

    for (let i = 0; i < 50; i++) {
        const artist = artists[Math.floor(Math.random() * artists.length)];
        // Mix and match titles to create somewhat unique names
        const title = `${titles[Math.floor(Math.random() * titles.length)]} ${i % 3 === 0 ? "Remix" : ""}`.trim();
        const bpm = Math.floor(Math.random() * (132 - 120 + 1)) + 120; // 120-132 BPM range
        const key = keys[Math.floor(Math.random() * keys.length)];
        const genre = genres[Math.floor(Math.random() * genres.length)];

        library.push({
            id: `mock-track-${i + 1}`,
            title,
            artist,
            bpm,
            key,
            genre,
        });
    }

    return library;
};

export const generateMockRequests = (): MockRequest[] => {
    const requests: MockRequest[] = [];

    // Good Request
    requests.push({
        id: "req-1",
        title: "Satisfaction",
        artist: "Benny Benassi",
        matchScore: 95,
        status: "perfect",
        statusBadge: "95% Match (Perfect Key)",
        statusMessage: "Queue"
    });

    // Good Request 2
    requests.push({
        id: "req-2",
        title: "Miracle",
        artist: "Calvin Harris, Ellie Goulding",
        matchScore: 88,
        status: "perfect",
        statusBadge: "88% Match (Crowd Fav)",
        statusMessage: "Queue"
    });

    // Neutral Request
    requests.push({
        id: "req-3",
        title: "Bad Guy",
        artist: "Billie Eilish",
        matchScore: 61,
        status: "neutral",
        statusBadge: "61% Match (Tempo Jump)",
        statusMessage: "Queue"
    });

    // Bad Request 1
    requests.push({
        id: "req-4",
        title: "Wonderwall",
        artist: "Oasis",
        matchScore: 12,
        status: "bad",
        statusBadge: "12% Match (Vibe Killer)",
        statusMessage: "Decline"
    });

    // Bad Request 2
    requests.push({
        id: "req-5",
        title: "My Heart Will Go On",
        artist: "Celine Dion",
        matchScore: 2,
        status: "bad",
        statusBadge: "2% Match (Absolute Buzzkill)",
        statusMessage: "Decline"
    });

    // Shuffle array randomly
    return requests.sort(() => Math.random() - 0.5);
};

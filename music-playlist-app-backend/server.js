const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const shortid = require('shortid');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ✅ MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/musicapp')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.log(err));

// ✅ STORAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) =>
        cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// ✅ MODELS
const Song = mongoose.model('Song', new mongoose.Schema({
    title: String,
    fileUrl: String
}));

const Playlist = mongoose.model('Playlist', new mongoose.Schema({
    name: String,
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    playlistCode: {
        type: String,
        default: () => shortid.generate()
    }
}));

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});


// ✅ CREATE PLAYLIST WITH FILES
app.post('/api/playlists', upload.array('files'), async (req, res) => {
    try {
        const { name, songNames } = req.body;

        let songIds = [];

        if (songNames && req.files) {
            for (let i = 0; i < songNames.length; i++) {
                const file = req.files[i];

                const fileUrl = `http://localhost:5000/uploads/${file.filename}`;

                const song = await Song.create({
                    title: songNames[i],
                    fileUrl
                });

                songIds.push(song._id);
            }
        }

        const playlist = await Playlist.create({
            name,
            songs: songIds
        });

        res.json(playlist);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating playlist" });
    }
});

// ✅ GET PLAYLISTS
app.get('/api/playlists', async (req, res) => {
    const data = await Playlist.find().populate('songs');
    res.json(data);
});

// ✅ PLAY SONG
app.get('/api/songs/:id/play', async (req, res) => {
    const song = await Song.findById(req.params.id);
    res.redirect(song.fileUrl);
});

// ✅ DELETE PLAYLIST
app.delete('/api/playlists/:id', async (req, res) => {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ✅ UPDATE PLAYLIST
app.put('/api/playlists/:id', upload.array('files'), async (req, res) => {
    try {
        const { name, songNames } = req.body;

        let songIds = [];

        if (songNames && req.files) {
            for (let i = 0; i < songNames.length; i++) {
                const file = req.files[i];

                const fileUrl = `http://localhost:5000/uploads/${file.filename}`;

                const song = await Song.create({
                    title: songNames[i],
                    fileUrl
                });

                songIds.push(song._id);
            }
        }

        const updated = await Playlist.findByIdAndUpdate(
            req.params.id,
            { name, songs: songIds },
            { new: true }
        );

        res.json(updated);

    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// ✅ START
app.listen(5000, () => console.log("🚀 Server running on port 5000"));

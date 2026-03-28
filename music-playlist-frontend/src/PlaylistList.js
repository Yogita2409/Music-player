import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function PlaylistList() {

    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [songsInput, setSongsInput] = useState([{ name: '', file: null }]);

    const [audio, setAudio] = useState(null);
    const [currentSong, setCurrentSong] = useState(null);
    const [progress, setProgress] = useState(0);

    // FETCH DATA
    const fetchData = async () => {
        const res = await axios.get('http://localhost:5000/api/playlists');
        setPlaylists(res.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // ADD SONG FIELD
    const addSongField = () => {
        setSongsInput([...songsInput, { name: '', file: null }]);
    };

    const handleSongChange = (index, key, value) => {
        const updated = [...songsInput];
        updated[index][key] = value;
        setSongsInput(updated);
    };

    // CREATE PLAYLIST
    const createPlaylist = async () => {
        const formData = new FormData();
        formData.append('name', newPlaylistName);

        songsInput.forEach(song => {
            formData.append('songNames', song.name);
            formData.append('files', song.file);
        });

        await axios.post('http://localhost:5000/api/playlists', formData);

        setNewPlaylistName('');
        setSongsInput([{ name: '', file: null }]);

        fetchData();
    };

    // DELETE PLAYLIST
    const deletePlaylist = async (id) => {
        await axios.delete(`http://localhost:5000/api/playlists/${id}`);
        fetchData();
    };

    // PLAY SONG
    const playSong = (song) => {
        if (audio) audio.pause();

        const newAudio = new Audio(
            `http://localhost:5000/api/songs/${song._id}/play`
        );

        newAudio.play();
        setAudio(newAudio);
        setCurrentSong(song);

        newAudio.ontimeupdate = () => {
            setProgress(
                (newAudio.currentTime / newAudio.duration) * 100 || 0
            );
        };
    };

    // PAUSE
    const pauseSong = () => {
        if (audio) audio.pause();
    };

    return (
        <div className="app-container">

            <h1>🎧 Music Player</h1>

            {/* CREATE */}
            <div className="glass">
                <input
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                />

                {songsInput.map((song, index) => (
                    <div key={index}>
                        <input
                            placeholder="Song name"
                            value={song.name}
                            onChange={(e) =>
                                handleSongChange(index, 'name', e.target.value)
                            }
                        />
                        <input
                            type="file"
                            onChange={(e) =>
                                handleSongChange(index, 'file', e.target.files[0])
                            }
                        />
                    </div>
                ))}

                <button onClick={addSongField}>➕ Add Song</button>
                <button onClick={createPlaylist}>Create Playlist</button>
            </div>

            {/* PLAYLISTS */}
            <div className="grid">
                {playlists.map(p => (
                    <div className="glass" key={p._id}>
                        <h3>{p.name}</h3>

                        {p.songs.map(song => (
                            <div key={song._id} className="song-item">
                                <span>{song.title}</span>

                                <button onClick={() => playSong(song)}>
                                    ▶️
                                </button>
                            </div>
                        ))}

                        <button onClick={() => deletePlaylist(p._id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* 🎧 PLAYER */}
            {currentSong && (
                <div className="player">

                    {/* LEFT */}
                    <div className="player-left">
                        🎵 {currentSong.title}
                    </div>

                    {/* CENTER */}
                    <div className="player-center">
                        <input
                            type="range"
                            className="progress"
                            value={progress}
                            readOnly
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="player-right">
                        <button onClick={() => playSong(currentSong)}>▶️</button>
                        <button onClick={pauseSong}>⏸</button>
                    </div>

                </div>
            )}
        </div>
    );
}

export default PlaylistList;
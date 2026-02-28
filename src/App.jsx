import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Library, Plus, ArrowRight, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Mic2, ListMusic, MonitorSpeaker, Volume2, Maximize2 } from 'lucide-react';
import { playlists, recentMusic, artists } from './data';
import './index.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-box sidebar-nav">
        <ul>
          <li className={activeTab === 'home' ? "active" : ""} onClick={() => setActiveTab('home')}>
            <Home size={24} />
            <span>Home</span>
          </li>
          <li className={activeTab === 'search' ? "active" : ""} onClick={() => setActiveTab('search')}>
            <Search size={24} />
            <span>Search</span>
          </li>
        </ul>
      </div>

      <div className="sidebar-box sidebar-library">
        <div className="library-header">
          <div className="library-header-left">
            <Library size={24} />
            <span>Your Library</span>
          </div>
          <div className="library-header-right" style={{ display: 'flex', gap: '8px' }}>
            <Plus size={20} className="control-btn" />
            <ArrowRight size={20} className="control-btn" />
          </div>
        </div>

        <div className="library-content">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist-item">
              <img src={playlist.image} alt={playlist.title} className="playlist-img" />
              <div className="playlist-info">
                <span className="playlist-title">{playlist.title}</span>
                <span className="playlist-desc">{playlist.type} • You</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MainContent = ({ isScrolled, currentTrack, handlePlay, activeTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);

      const query = encodeURIComponent(searchQuery);
      Promise.all([
        fetch(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${query}`).then(res => res.json()),
        fetch(`https://jiosaavn-api-privatecvc2.vercel.app/search/albums?query=${query}`).then(res => res.json())
      ])
        .then(([songsData, albumsData]) => {
          let songs = [];
          let albums = [];

          // Parse Songs
          if (songsData.data && songsData.data.results) {
            songs = songsData.data.results.map(track => {
              const highestImage = track.image && track.image.length > 0
                ? track.image[track.image.length - 1].link
                : 'https://picsum.photos/300/300';

              const highestAudio = track.downloadUrl && track.downloadUrl.length > 0
                ? track.downloadUrl[track.downloadUrl.length - 1].link
                : null;

              return {
                id: track.id,
                title: track.name,
                artist: track.primaryArtists,
                album: track.album?.name,
                image: highestImage,
                audio: highestAudio,
                duration: parseInt(track.duration || 0),
                type: 'Song'
              };
            });
          }

          // Parse Albums
          if (albumsData.data && albumsData.data.results) {
            albums = albumsData.data.results.map(album => {
              const highestImage = album.image && album.image.length > 0
                ? album.image[album.image.length - 1].link
                : 'https://picsum.photos/300/300';

              const artistsString = Array.isArray(album.primaryArtists)
                ? album.primaryArtists.map(a => a.name).join(', ')
                : typeof album.primaryArtists === 'string' ? album.primaryArtists : 'Various Artists';

              return {
                id: album.id,
                title: album.name,
                artist: artistsString,
                image: highestImage,
                audio: null, // we don't have direct audio for albums yet
                type: 'Album'
              }
            });
          }

          setSearchResults([...songs.slice(0, 8), ...albums.slice(0, 4)]);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search error:", err);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="main-content-wrapper">
      <div className={`topbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center' }}>
          <button className="nav-btn"><SkipBack size={16} /></button>
          <button className="nav-btn" style={{ marginLeft: '12px' }}><SkipForward size={16} /></button>
          {activeTab === 'search' && (
            <div style={{ marginLeft: '16px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', color: 'var(--text-secondary)' }}>
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="What do you want to play?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '12px 12px 12px 40px', fontSize: '14px', borderRadius: '24px', border: '1px solid transparent', width: '300px', backgroundColor: '#242424', color: 'white', outline: 'none', transition: 'border 0.2s, background-color 0.2s' }}
                onFocus={(e) => { e.target.style.border = '1px solid white'; e.target.style.backgroundColor = '#2a2a2a'; }}
                onBlur={(e) => { e.target.style.border = '1px solid transparent'; e.target.style.backgroundColor = '#242424'; }}
              />
            </div>
          )}
        </div>
        <div className="user-controls">
          <button className="btn-primary" style={{ backgroundColor: 'white', color: 'black' }}>Explore Premium</button>
          <button className="btn-dark" style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white' }}><ArrowRight size={16} /> Install App</button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            U
          </div>
        </div>
      </div>

      <div className="section">
        {activeTab === 'home' ? (
          <>
            <h2>Good evening</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {recentMusic.slice(0, 6).map((item) => (
                <div key={`recent-${item.id}`} onClick={() => handlePlay(item)} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', transition: 'background-color 0.3s' }}>
                  <img src={item.image} alt={item.title} style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                  <span style={{ fontWeight: '700', padding: '0 16px', color: 'white' }}>{item.title}</span>
                  <div style={{ marginLeft: 'auto', marginRight: '16px', opacity: currentTrack?.id === item.id ? 1 : 0, transition: 'opacity 0.3s', backgroundColor: '#1db954', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="play-btn-recent">
                    <Play fill="black" size={20} color="black" />
                  </div>
                </div>
              ))}
            </div>

            <h2>Made For You</h2>
            <div className="cards-grid">
              {playlists.map((playlist) => (
                <div key={`mix-${playlist.id}`} className="card">
                  <div className="card-img-container">
                    <img src={playlist.image} alt={playlist.title} className="card-img" />
                    <button className="play-btn">
                      <Play fill="black" size={24} color="black" style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                  <div className="card-title">{playlist.title}</div>
                  <div className="card-subtitle">{playlist.description}</div>
                </div>
              ))}
            </div>

            <h2 style={{ marginTop: '32px' }}>Your Favorite Artists</h2>
            <div className="cards-grid">
              {artists.map((artist) => (
                <div key={`artist-${artist.id}`} className="card artist">
                  <div className="card-img-container">
                    <img src={artist.image} alt={artist.name} className="card-img" />
                    <button className="play-btn">
                      <Play fill="black" size={24} color="black" style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                  <div className="card-title">{artist.name}</div>
                  <div className="card-subtitle">{artist.type}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {searchQuery ? (
              <>
                <h2>Top Results</h2>
                {isSearching ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Searching for "{searchQuery}"...</p>
                ) : (
                  <div className="cards-grid">
                    {searchResults.map((item) => (
                      <div key={`search-${item.id}`} className="card" onClick={() => item.audio && handlePlay(item)}>
                        <div className="card-img-container">
                          <img src={item.image} alt={item.title} className="card-img" />
                          {item.audio && (
                            <button className="play-btn">
                              <Play fill="black" size={24} color="black" style={{ marginLeft: '4px' }} />
                            </button>
                          )}
                        </div>
                        <div className="card-title">{item.title}</div>
                        <div className="card-subtitle">{item.type === 'Song' ? `Song • ${item.artist}` : `Album • ${item.artist}`}</div>
                      </div>
                    ))}
                    {searchResults.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No results found for "{searchQuery}"</p>}
                  </div>
                )}
              </>
            ) : (
              <>
                <h2>Browse all</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
                  {[
                    { id: 'c1', title: 'Podcasts', color: '#e13300' },
                    { id: 'c2', title: 'Made For You', color: '#1e3264' },
                    { id: 'c3', title: 'New Releases', color: '#e8115b' },
                    { id: 'c4', title: 'Pop', color: '#148a08' },
                    { id: 'c5', title: 'Hip-Hop', color: '#bc5900' },
                    { id: 'c6', title: 'Workout', color: '#777777' },
                  ].map((cat) => (
                    <div key={cat.id} style={{ backgroundColor: cat.color, height: '180px', borderRadius: '8px', padding: '16px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{cat.title}</h3>
                      <div style={{ position: 'absolute', bottom: '-10px', right: '-15px', width: '100px', height: '100px', backgroundColor: 'rgba(0,0,0,0.2)', transform: 'rotate(25deg)', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const Player = ({ isPlaying, setIsPlaying, currentTrack, currentTime, onSeek }) => {
  return (
    <div className="player">
      <div className="player-left">
        <img src={currentTrack.image} alt="Now Playing" className="now-playing-img" />
        <div className="now-playing-info">
          <span className="now-playing-title">{currentTrack.title}</span>
          <span className="now-playing-artist">{currentTrack.artist}</span>
        </div>
        <Plus size={16} className="control-btn" style={{ marginLeft: '24px' }} />
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="control-btn"><Shuffle size={16} /></button>
          <button className="control-btn"><SkipBack size={20} fill="currentColor" /></button>
          <button className="play-pause-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause fill="black" size={16} /> : <Play fill="black" size={16} style={{ marginLeft: '2px' }} />}
          </button>
          <button className="control-btn"><SkipForward size={20} fill="currentColor" /></button>
          <button className="control-btn"><Repeat size={16} /></button>
        </div>
        <div className="playback-bar">
          <span>{formatTime(currentTime)}</span>
          <div className="progress-bar-container" onClick={(e) => {
            const bounds = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - bounds.left) / bounds.width;
            onSeek(percent * currentTrack.duration);
          }}>
            <div className="progress-bar-fill" style={{ width: `${(currentTime / currentTrack.duration) * 100 || 0}%` }}></div>
            <div className="progress-bar-thumb" style={{ left: `${(currentTime / currentTrack.duration) * 100 || 0}%` }}></div>
          </div>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <Mic2 size={16} className="control-btn" />
        <ListMusic size={16} className="control-btn" />
        <MonitorSpeaker size={16} className="control-btn" />
        <div className="volume-bar" style={{ gap: '8px', display: 'flex', alignItems: 'center' }}>
          <Volume2 size={16} className="control-btn" />
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: '70%', backgroundColor: 'white' }}></div>
            <div className="progress-bar-thumb" style={{ left: '70%' }}></div>
          </div>
        </div>
        <Maximize2 size={16} className="control-btn" />
      </div>
    </div>
  );
};

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(recentMusic[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log("Audio play error", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  const handlePlay = (track) => {
    if (currentTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleSeek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.audio}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
      <div className="app-container" onScroll={(e) => setIsScrolled(e.target.scrollTop > 0)}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainContent isScrolled={isScrolled} currentTrack={currentTrack} handlePlay={handlePlay} activeTab={activeTab} />
      </div>
      <Player isPlaying={isPlaying} setIsPlaying={setIsPlaying} currentTrack={currentTrack} currentTime={currentTime} onSeek={handleSeek} />
    </>
  );
};

export default App;

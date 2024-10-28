import React, { useState, useRef } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import PopularSongs from './PopularSongs';

function Player({ setPlaylist, playlist = [], language, resetToPopular, showPopular, hidePopular }) {
  const [searchResults, setSearchResults] = useState([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false)
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSongTitle, setCurrentSongTitle] = useState('');
  const searchInputRef = useRef(null);

  const handleSearch = async () => {
    const query = searchInputRef.current.value;
    if (!query) return;

    hidePopular();
    setLoading(true);
    try {
      const response = await fetch(`/search?query=${query}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async (url, title = '') => {
    setAudioLoading(true);
    try {
      const response = await fetch(`/stream_audio?query=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (response.ok) {
        setAudioUrl(data.audio_url);
        setCurrentSongTitle(title);
      } else {
        console.error('Error al obtener el audio:', data.error);
      }
    } catch (error) {
      console.error('Error fetching audio stream:', error);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleNextSong = () => {
    if (currentSongIndex < playlist.length - 1) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      const nextSong = playlist[nextIndex];
      setCurrentSongTitle(nextSong.title);
      handlePlay(nextSong.audioUrl, nextSong.title);
    }
  };

  const handlePreviousSong = () => {
    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      setCurrentSongIndex(prevIndex);
      const prevSong = playlist[prevIndex];
      setCurrentSongTitle(prevSong.title);
      handlePlay(prevSong.audioUrl, prevSong.title);
    }
  };

  return (
    <div className="player-container w-full ml-4 mr-4">
      <div className="flex mb-4 p-4">
        <input
          type="text"
          ref={searchInputRef}
          className="flex-grow p-2 border border-gray-300 rounded"
          placeholder={language === 'en' ? 'Search Your Music Here' : 'Busca Tu Musica Aqui'}
        />
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSearch}
        >
          {language === 'en' ? 'Search' : 'Buscar'}
        </button>
      </div>

      {/* Renderiza PopularSongs o Resultados de Búsqueda según showPopular */}
      {showPopular ? (
        <PopularSongs handlePlay={handlePlay} language={language} />
      ) : loading ? (
        <ul className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <li
              key={index}
              className="p-4 border border-gray-200 rounded flex justify-between items-center animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-24 bg-green-300 rounded"></div>
            </li>
          ))}
        </ul>
      ) : searchResults.length > 0 ? (
        <ul className="space-y-4">
          {searchResults.map((video, index) => (
            <li
              key={index}
              className="p-4 border border-gray-200 rounded flex justify-between items-center"
            >
              <div>
                <strong>{video.title}</strong>
                <span className="text-sm text-gray-500">({video.duration})</span>
              </div>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded"
                onClick={() => handlePlay(video.webpage_url, video.title)}
                disabled={audioLoading}
              >
                {language === 'en' ? 'Play Audio' : 'Reproducir Audio'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ marginLeft: '50px' }}>
          {language === 'en' ? 'No results found.' : 'No se encontraron resultados.'}
        </p>
      )}

      <div className="sticky bottom-0 left-0 right-0 z-50">
        <AudioPlayer
          src={audioUrl}
          autoPlay
          onEnded={handleNextSong}
          showSkipControls
          showJumpControls={false}
          customAdditionalControls={[]}
          showFilledVolume
          onClickPrevious={handlePreviousSong}
          onClickNext={handleNextSong}
          header={`Now playing: ${
            currentSongTitle || (language === 'en' ? 'Unknown Title' : 'Título desconocido')
          }`}
        />
      </div>
    </div>
  );
}

export default Player;

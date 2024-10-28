import React, { useEffect, useState } from 'react';

const PopularSongs = ({ handlePlay, language }) => {
  const [popularSongs, setPopularSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPopularSongs = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&regionCode=US&videoCategoryId=10&maxResults=12&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
        );
        const data = await response.json();
        const formattedSongs = data.items.map((item) => ({
          id: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
          audioUrl: `https://www.youtube.com/watch?v=${item.id}`
        }));
        setPopularSongs(formattedSongs);
      } catch (error) {
        console.error('Error fetching popular songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularSongs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className="p-4 border border-gray-200 rounded flex flex-col items-center text-center animate-pulse"
          >
            <div className="w-32 h-32 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 w-24 bg-green-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (popularSongs.length === 0) {
    return <p>No hay canciones populares disponibles.</p>;
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center mb-6">
        {language === 'en' ? 'Popular Songs' : 'Canciones Populares'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {popularSongs.map((song) => (
          <div key={song.id} className="p-4 border border-gray-200 rounded flex flex-col items-center text-center">
            <img src={song.thumbnail} alt={song.title} className="mb-2" />
            <h3 className="text-lg font-bold">{song.title}</h3>
            <p>{song.duration}</p>
            <button
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => handlePlay(song.audioUrl, song.title)}
            >
              {language === 'en' ? 'Play Audio' : 'Reproducir Audio'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularSongs;

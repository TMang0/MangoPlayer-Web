import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import Player from "./Components/Player";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [language, setLanguage] = useState("en");
  const [showPopular, setShowPopular] = useState(true); // Cambiar a true por defecto
  const [popularSongs, setPopularSongs] = useState([]); // Agregar estado para canciones populares


  // Función para cargar canciones populares
  const fetchPopularSongs = async () => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&regionCode=US&videoCategoryId=10&maxResults=10&key=AIzaSyARZBa1ZmnAZLFBjgx698AyNmZpvtLMSlk'
      );
      const data = await response.json();
      const formattedSongs = data.items.map((item) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.default.url,
        duration: item.contentDetails.duration,
        audioUrl: `https://www.youtube.com/watch?v=${item.id}` // Añadimos la URL directamente aquí.
      }));
      setPopularSongs(formattedSongs);
    } catch (error) {
      console.error('Error fetching popular songs:', error);
    }
  };

  useEffect(() => {
    fetchPopularSongs(); // Llama a la función al montar el componente
  }, []);

  // Verificar si hay un token válido en sessionStorage al cargar la aplicación
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          setIsLoggedIn(true);
          setUserInfo(decodedToken);
        } else {
          sessionStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  const handleLoginSuccess = (response) => {
    const token = response.credential;
    const decodedToken = jwtDecode(token);
    setIsLoggedIn(true);
    setUserInfo(decodedToken);
    sessionStorage.setItem("token", token);
  };

  const handleLoginFailure = (error) => {
    console.error("Login Failed", error);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
    sessionStorage.removeItem("token");
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "es" : "en"));
  };

  // Función para restablecer la vista a las canciones populares
  const resetToPopular = () => {
    console.log("Resetting to popular songs...");
    setShowPopular(true);
  };

  const hidePopular = () => {
    setShowPopular(false);
  };

  return (
    <GoogleOAuthProvider clientId="234744935841-joinoeqgmg5o8l9stub9kbduspfkig6d.apps.googleusercontent.com">
 <div className="w-full h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        handleLoginToggle={handleLogout}
        playlist={playlist}
        toggleLanguage={toggleLanguage}
        language={language}
        toggleShowPopular={resetToPopular}
      />
      <div className="flex-grow flex justify-center items-center">
        {!isLoggedIn ? (
          <div className="relative flex justify-center items-center min-h-screen bg-gray-200 w-full">
            <video
              className="absolute inset-0 object-cover w-full h-full"
              src="/Resources/background-video.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative z-10 text-center text-white">
              <h1 className="text-4xl font-bold mb-4">
                {language === "en" ? "Welcome to MangoPlayer" : "Bienvenido a MangoPlayer"}
              </h1>
              <p className="mb-8 text-lg">
                {language === "en"
                  ? "Log in to enjoy your favorite music"
                  : "Accede para disfrutar de tu música favorita"}
              </p>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onFailure={handleLoginFailure}
                  buttonText={language === "en" ? "Login with Google" : "Login con Google"}
                  cookiePolicy={"single_host_origin"}
                  useOneTap
                />
              </div>
            </div>
          </div>
        ) : (
          <Player
            setPlaylist={setPlaylist}
            playlist={playlist}
            language={language}
            showPopular={showPopular}
            popularSongs={popularSongs}
            hidePopular={hidePopular}
          />
        )}
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;

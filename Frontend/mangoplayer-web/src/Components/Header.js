import React, { useState } from "react";

function Header({ 
  isLoggedIn, 
  handleLoginToggle, 
  playlist, 
  toggleLanguage, 
  language, 
  toggleShowPopular, 
  onGoBack, // Agrega la prop para la función de volver
  resetToPopular
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const togglePlaylistModal = () => setIsPlaylistModalOpen(!isPlaylistModalOpen);

  return (
    <header className="flex justify-between items-center bg-gray-800 text-white p-4">
      {/* Logo y Título */}
      <div className="flex items-center cursor-pointer" onClick={toggleShowPopular}>
        <img src="/Resources/logo.png" alt="Logo" className="h-8 w-8 mr-2" />
        <span className="text-lg font-bold">MangoPlayer</span>
      </div>

      {/* Botones del Header */}
      <div className="flex space-x-4">
        {isLoggedIn && (
          <>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
              onClick={togglePlaylistModal}
            >
              {language === "en" ? "Playlist" : "Lista de Reproducción"}
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              onClick={handleLoginToggle}
            >
              {language === "en" ? "Logout" : "Cerrar Sesión"}
            </button>
          </>
        )}
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          onClick={toggleModal}
        >
          {language === "en" ? "Settings" : "Configuración"}
        </button>
      </div>

      {/* Modal de Configuración */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-black">
              {language === "en" ? "Settings" : "Configuración"}
            </h2>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded mb-4 mr-4"
              onClick={toggleLanguage}
            >
              {language === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
              onClick={toggleModal}
            >
              {language === "en" ? "Close" : "Cerrar"}
            </button>
          </div>
        </div>
      )}

      {/* Modal de Playlist */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">
              {language === "en" ? "Under Development" : "En Desarrollo"}
            </h2>
            <p className="text-gray-500">
              {language === "en"
                ? "The playlist functionality is under development."
                : "La funcionalidad de la playlist está en desarrollo."}
            </p>
            <button
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
              onClick={togglePlaylistModal}
            >
              {language === "en" ? "Close" : "Cerrar"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

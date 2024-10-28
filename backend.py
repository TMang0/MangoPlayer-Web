from flask import Flask, request, jsonify
from flask_cors import CORS
from googleapiclient.discovery import build
import yt_dlp
import os
import html
from dotenv import load_dotenv

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

# Cargar la clave API desde la variable de entorno
API_KEY = os.getenv('YOUTUBE_API_KEY')

# Inicializar la app Flask y configurar CORS
app = Flask(__name__)
CORS(app)

# Inicializar el cliente de la API de YouTube
youtube = build('youtube', 'v3', developerKey=API_KEY)

# Función que convierte la duración ISO 8601 a un formato legible (ej. "5:33")
def parse_duration(duration):
    import isodate  # Esta librería convierte la duración en un objeto de tiempo
    parsed_duration = isodate.parse_duration(duration)
    minutes, seconds = divmod(parsed_duration.total_seconds(), 60)
    return f"{int(minutes)}:{int(seconds):02}"

# Función que obtiene los detalles de los videos por ID
def get_video_details(video_ids):
    try:
        response = youtube.videos().list(
            id=','.join(video_ids),
            part='contentDetails'
        ).execute()

        # Extraemos las duraciones en un diccionario {id: duración}
        durations = {
            item['id']: parse_duration(item['contentDetails']['duration'])
            for item in response['items']
        }
        return durations
    except Exception as e:
        raise Exception(f"Error al obtener detalles del video: {str(e)}")

# Función que busca videos usando la API de YouTube
def search_videos(query):
    try:
        response = youtube.search().list(
            q=query,
            part='snippet',
            maxResults=8,
            type='video'
        ).execute()

        # Obtener los IDs de los videos encontrados
        video_ids = [item['id']['videoId'] for item in response['items']]
        
        # Obtener las duraciones de los videos por ID
        durations = get_video_details(video_ids)

        # Procesar los resultados incluyendo la duración
        results = [
            {
                'title': html.unescape(item['snippet']['title']),
                'webpage_url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                'duration': durations.get(item['id']['videoId'], 'N/A')
            }
            for item in response['items']
        ]
        return results
    except Exception as e:
        raise Exception(f"Error al buscar videos: {str(e)}")

# Ruta para realizar la búsqueda de videos
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    if query:
        try:
            results = search_videos(query)
            return jsonify(results), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Invalid Query"}), 400

# Ruta para transmitir solo el audio del video
@app.route('/stream_audio', methods=['GET'])
def stream_audio():
    video_url = request.args.get('query')
    if video_url:
        try:
            ydl_opts = {
                'format': 'bestaudio',
                'noplaylist': True,
                'quiet': True
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                audio_url = info['url']
                video_title = info.get('title', 'Unknown Title')  # Obtener el título del video

            # Retornar tanto la URL del audio como el título del video
            return jsonify({'audio_url': audio_url, 'title': video_title}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'No video URL provided'}), 400


if __name__ == '__main__':
    app.run(debug=True)

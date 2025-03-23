import threading
from session.auth import login
from WebSocketClient.client import iniciar_websocket

if login():
    iniciar_websocket()
 
import sqlite3
import json
import urllib.parse
from http.server import SimpleHTTPRequestHandler, HTTPServer
import os

DB_NAME = 'database.db'

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS user_state (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            cart TEXT,
            wishlist TEXT
        )
    ''')
    conn.commit()
    conn.close()

class CustomHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/sync':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                cart = json.dumps(data.get('cart', []))
                wishlist = json.dumps(data.get('wishlist', []))

                # Mock user_id for now as OAuth is not implemented
                user_id = 'mock_user_123'

                conn = sqlite3.connect(DB_NAME)
                c = conn.cursor()
                c.execute('''
                    INSERT INTO user_state (user_id, cart, wishlist)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_id) DO UPDATE SET
                    cart=excluded.cart,
                    wishlist=excluded.wishlist
                ''', (user_id, cart, wishlist))
                conn.commit()
                conn.close()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
        else:
            self.send_error(404, "File not found")

if __name__ == '__main__':
    init_db()
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, CustomHandler)
    print("Starting server on port 8000...")
    httpd.serve_forever()

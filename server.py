import sqlite3
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler

DB_FILE = 'database.sqlite'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_state (
            user_token TEXT PRIMARY KEY,
            cart TEXT,
            wishlist TEXT
        )
    ''')
    conn.commit()
    conn.close()

class RequestHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/sync':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.end_headers()
                return

            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode('utf-8'))
                cart = json.dumps(data.get('cart', []))
                wishlist = json.dumps(data.get('wishlist', []))

                # Use Authorization header for token or fallback
                auth_header = self.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    user_token = auth_header.split(' ')[1]
                else:
                    user_token = 'dummy-token' # Default fallback

                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO user_state (user_token, cart, wishlist)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_token) DO UPDATE SET
                    cart=excluded.cart,
                    wishlist=excluded.wishlist
                ''', (user_token, cart, wishlist))

                conn.commit()
                conn.close()

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
            except Exception as e:
                print(f"Server Error: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        # Fallback to SimpleHTTPRequestHandler for serving static files
        super().do_GET()

if __name__ == '__main__':
    init_db()
    port = 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"Server running on port {port}")
    httpd.serve_forever()
import os
import http.server
import socketserver
import sqlite3
import json

PORT = 8000
DB_FILE = 'database.db'

def init_db():
    conn = sqlite3.connect(DB_FILE)
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

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_HEAD(self):
        # Apply the same allowlist logic for HEAD requests
        translated_path = self.translate_path(self.path)
        base_dir = os.getcwd()

        if not translated_path.startswith(base_dir):
            self.send_error(403, "Forbidden")
            return

        rel_path = os.path.relpath(translated_path, base_dir)

        allowed_dirs = ['assets', 'css', 'js', 'webfonts']
        allowed_files = ['index.html', 'checkout.html']

        is_allowed = False
        if rel_path == '.' or rel_path == '':
            is_allowed = True
        elif rel_path in allowed_files:
            is_allowed = True
        else:
            for d in allowed_dirs:
                if rel_path == d or rel_path.startswith(d + os.sep):
                    is_allowed = True
                    break

        if not is_allowed:
            self.send_error(403, "Forbidden")
            return

        super().do_HEAD()

    def do_GET(self):
        # Prevent accessing sensitive files using an allowlist
        translated_path = self.translate_path(self.path)
        base_dir = os.getcwd()

        # Ensure the requested path is within the base directory to prevent path traversal
        if not translated_path.startswith(base_dir):
            self.send_error(403, "Forbidden")
            return

        rel_path = os.path.relpath(translated_path, base_dir)

        # Allowed directories and files
        allowed_dirs = ['assets', 'css', 'js', 'webfonts']
        allowed_files = ['index.html', 'checkout.html']

        is_allowed = False

        if rel_path == '.' or rel_path == '':
            is_allowed = True
        elif rel_path in allowed_files:
            is_allowed = True
        else:
            for d in allowed_dirs:
                if rel_path == d or rel_path.startswith(d + os.sep):
                    is_allowed = True
                    break

        if not is_allowed:
            self.send_error(403, "Forbidden")
            return

        super().do_GET()

    def do_POST(self):
        if self.path == '/api/sync':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                try:
                    data = json.loads(post_data.decode('utf-8'))
                    cart = json.dumps(data.get('cart', []))
                    wishlist = json.dumps(data.get('wishlist', []))

                    # Dummy user_id until OAuth is implemented
                    user_id = 'dummy_user'

                    conn = sqlite3.connect(DB_FILE)
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
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {'status': 'success'}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                except Exception as e:
                    self.send_response(500)
                    self.end_headers()
                    print(f"Error processing /api/sync: {e}")
            else:
                self.send_response(400)
                self.end_headers()
        else:
            self.send_error(404, "Endpoint not found")

if __name__ == "__main__":
    init_db()
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

import unittest
import sqlite3
import os
import tempfile
import sys

# Add root directory to sys.path to import app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import app

class TestAppDB(unittest.TestCase):
    def setUp(self):
        # Create a temporary file for the database
        self.fd, self.db_path = tempfile.mkstemp()
        self.original_db_file = app.DB_FILE
        app.DB_FILE = self.db_path

    def tearDown(self):
        app.DB_FILE = self.original_db_file
        os.close(self.fd)
        os.unlink(self.db_path)

    def test_init_db(self):
        # Run init_db
        app.init_db()

        # Verify that the table was created correctly
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_state'")
        table_exists = c.fetchone()

        self.assertIsNotNone(table_exists, "Table user_state should be created")

        # Verify the columns
        c.execute("PRAGMA table_info(user_state)")
        columns = {row[1]: row[2] for row in c.fetchall()}

        self.assertIn('id', columns)
        self.assertEqual(columns['id'], 'INTEGER')
        self.assertIn('user_id', columns)
        self.assertEqual(columns['user_id'], 'TEXT')
        self.assertIn('cart', columns)
        self.assertEqual(columns['cart'], 'TEXT')
        self.assertIn('wishlist', columns)
        self.assertEqual(columns['wishlist'], 'TEXT')

        conn.close()

if __name__ == '__main__':
    unittest.main()

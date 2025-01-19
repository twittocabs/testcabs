from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import sqlite3
import os
import logging
import secrets
import hashlib  # Added for password hashing

app = Flask(__name__, static_folder=r'C:\twitto_cabs\static', template_folder='templates')
CORS(app)
DATABASE = r"C:\twitto_cabs\users.db"

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
app.logger.setLevel(logging.INFO)

# Configuration Variable to enable/disable payments.
ENABLE_PAYMENTS = os.getenv('ENABLE_PAYMENTS', 'False').lower() == 'true'


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(app):
    """Initialize the database with users and their respective salts if no salt exists."""
    with app.app_context():
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the users table exists and has a salt column. If not this was already done, and thus you can just comment this out
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]

        if 'salt' not in columns:
            print("table users has no column named salt. creating...")
            cursor.execute("ALTER TABLE users ADD COLUMN salt TEXT;")
            conn.commit()

        # Check for users with no salts (NULL salt)
        cursor.execute("SELECT id FROM users WHERE salt IS NULL")
        users_without_salt = cursor.fetchall()

        # Generate and update salt for each user without one
        for user_id in users_without_salt:
            salt = secrets.token_hex(16)  # Generates 16 random bytes
            cursor.execute("UPDATE users SET salt = ? WHERE id = ?", (salt, user_id[0]))
            conn.commit()  # Commit changes for each user

        print("Database initialized successfully.")
        conn.close()


def setup_database():
    conn = get_db_connection()
    try:
        if not os.path.exists(DATABASE):
            open(DATABASE, 'a').close()  # create the db file if it doesnt exist.
        with open('schema.sql') as f:
            conn.executescript(f.read())
        print("Database schema setup successfully.")
    except sqlite3.Error as e:
        print(f"Error setting up schema: {e}")
        app.logger.error(f"Database error during schema setup: {e}")
    except Exception as e:
        print(f"An error occurred during database schema setup: {e}")
        app.logger.error(f"Unexpected error during schema setup: {e}")
    finally:
        conn.close()


@app.route('/')
def index():
    return render_template('index.html')


# --- USER ENDPOINTS ---
def hash_password(password, salt):
    """Hashes the password using sha256 and a random salt for security."""
    salted_password = salt + password
    hashed_password = hashlib.sha256(salted_password.encode()).hexdigest()
    return hashed_password


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')

    if not name or not email or not password or not gender:
        return jsonify({'error': 'All fields are required'}), 400

    app.logger.info(f"Received signup data: name={name}, email={email}, gender={gender}")

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = ?", (email,))
        existing_user = cur.fetchone()
        if existing_user:
            conn.close()
            app.logger.info(f"Signup failed: Email address '{email}' already exists")
            return jsonify({'error': 'Email address already exists'}), 409

        salt = secrets.token_hex(16)  # generate a random salt.
        hashed_password = hash_password(password, salt)  # password hashing

        app.logger.info(f"Inserting user: name={name}, email={email}, gender={gender}")
        cur.execute(
            "INSERT INTO users (name, email, password, gender, salt) VALUES (?, ?, ?, ?, ?)",
            (name, email, hashed_password, gender, salt))
        conn.commit()
        user_id = cur.lastrowid
        app.logger.info(f"User created successfully with id: {user_id}")
        return jsonify({'id': user_id, 'message': 'User created successfully'}), 201
    except sqlite3.Error as e:
        conn.rollback()
        app.logger.error(f"Database error during signup: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


def verify_password(db_password, salt, input_password):
    """Verifies the password against the stored hash."""
    hashed_input_password = hash_password(input_password, salt)
    return hashed_input_password == db_password


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    conn = get_db_connection()
    try:
        cur = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cur.fetchone()
        if row:
            salt = row['salt']
            db_password = row['password']
            if verify_password(db_password, salt, password):  # verify password
                user = {
                    'id': row['id'],
                    'name': row['name'],
                    'email': row['email'],
                    'gender': row['gender'],
                }
                return jsonify(user)
            else:
                return jsonify({'message': 'Invalid credentials'}), 401
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    try:
        cur = conn.execute(
            "SELECT id, name, email, gender FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if row:
            user = {
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'gender': row['gender'],
            }
            return jsonify(user), 200
        else:
            return jsonify({'message': 'User not found'}), 404
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# --- RIDE ENDPOINTS ---
@app.route('/rides', methods=['GET'])
def get_rides():
    conn = get_db_connection()
    try:
        cur = conn.execute('SELECT * FROM rides')
        rides = [dict(row) for row in cur.fetchall()]
        return jsonify(rides)
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/rides', methods=['POST'])
def create_ride():
    data = request.get_json()
    ride_type = data.get('type')
    pick_up = data.get('pickUp')
    drop_off = data.get('dropOff')
    user_name = data.get('userName')
    gender = data.get('gender')
    seats = data.get('seats')
    car_type = data.get('carType')
    persons = data.get('persons')
    contact = data.get('contact')
    bags = data.get('bags')
    price = data.get('price')
    bags_allowed = data.get('bagsAllowed')
    pets_allowed = data.get('petsAllowed')
    user_id = data.get('user_id')

    if not ride_type or not pick_up or not drop_off or not user_name or not gender or not seats or not car_type or not persons or not contact:
        return jsonify({'error': 'All fields are required'}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO rides (type, pickUp, dropOff, userName, gender, seats, carType, persons, contact, bags, price, bagsAllowed, petsAllowed, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (ride_type, pick_up, drop_off, user_name, gender, seats, car_type, persons, contact, bags, price,
             bags_allowed, pets_allowed, user_id))
        conn.commit()
        ride_id = cur.lastrowid
        return jsonify({'id': ride_id, 'message': 'Ride created successfully'}), 201
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# --- SHOWN CONTACTS ENDPOINTS ---
@app.route('/shown-contacts', methods=['GET'])
def get_shown_contacts():
    conn = get_db_connection()
    try:
        cur = conn.execute('SELECT * FROM shown_contacts')
        contacts = [dict(row) for row in cur.fetchall()]
        return jsonify(contacts)
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


@app.route('/shown-contacts', methods=['POST'])
def create_shown_contact():
    data = request.get_json()
    ride_id = data.get('ride_id')
    show_contact = data.get('show_contact')
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO shown_contacts (ride_id, show_contact) VALUES (?, ?)", (ride_id, show_contact))
        conn.commit()
        contact_id = cur.lastrowid
        return jsonify({'id': contact_id, 'message': 'Contact updated successfully'}), 201
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()


# Mock implementation while API keys are unavailable
@app.route('/create-payment-link', methods=['POST'])
def create_payment_link_mock():
    if not ENABLE_PAYMENTS:  # Add this conditional check
        return jsonify({'paymentLink': 'payment_disabled', 'orderId': 'payment_disabled'})
    data = request.get_json()
    ride_type = data.get('rideType')
    user_id = data.get('user_id')
    if not ride_type or not user_id:
        return jsonify({'error': 'Ride Type and User ID required'}), 400
    # Mock payment data
    mock_payment_link = "https://mock-payment-link.com"
    mock_order_id = f"mock_order_{user_id}_{ride_type}"
    app.logger.info(f"Mock payment link generated for user: {user_id}, ride type: {ride_type}")
    return jsonify({'paymentLink': mock_payment_link, 'orderId': mock_order_id})


@app.route('/payment-callback', methods=['POST'])
def payment_callback_mock():
    if not ENABLE_PAYMENTS:  # Add this conditional check
        return jsonify({'status': 'payment_disabled'})
    data = request.get_json()  # razorpay sends a webhook with this as a body
    # Simulate successful payment for the time being. This can be modified to test failure
    app.logger.info(f"Mock Payment successful, data {data}")
    return jsonify({'status': 'success'})


if __name__ == '__main__':
    setup_database()  # setup the schema of the db
    with app.app_context():
        init_db(app)  # init the database for existing users
    app.run(debug=True, port=4000)
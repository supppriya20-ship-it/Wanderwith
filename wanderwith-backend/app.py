# app.py - Flask Backend Implementation
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json
import uuid

app = Flask(__name__)
app.secret_key = 'wanderwith-secret-key-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wanderwith.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# Payment APIs would be configured here in production
# stripe.api_key = "sk_test_your_stripe_secret_key"
# razorpay_client = razorpay.Client(auth=("your_key_id", "your_key_secret"))

# --------------------
# Database Models
# --------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    bookings = db.relationship('Booking', backref='user', lazy=True)

class Destination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # beach/mountain/cultural/nature/adventure
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Float, default=4.5)
    guide_name = db.Column(db.String(100), nullable=False)
    meeting_spot = db.Column(db.String(255), nullable=False)
    inclusions = db.Column(db.Text, nullable=False)  # JSON string
    exclusions = db.Column(db.Text, nullable=False)  # JSON string

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('destination.id'), nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    travel_date = db.Column(db.DateTime, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), default='pending')
    payment_id = db.Column(db.String(255))
    booking_reference = db.Column(db.String(100), unique=True)
    destination = db.relationship('Destination', backref='bookings')

# --------------------
# API Routes
# --------------------

@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    destination_type = request.args.get('type', 'all')
    search_query = request.args.get('search', '')

    query = Destination.query
    if destination_type != 'all':
        query = query.filter_by(type=destination_type)
    if search_query:
        query = query.filter(
            db.or_(
                Destination.name.ilike(f'%{search_query}%'),
                Destination.description.ilike(f'%{search_query}%')
            )
        )

    destinations = query.all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'type': d.type,
        'description': d.description,
        'price': d.price,
        'duration': d.duration,
        'image_url': d.image_url,
        'rating': d.rating,
        'guide_name': d.guide_name,
        'meeting_spot': d.meeting_spot,
        'inclusions': json.loads(d.inclusions),
        'exclusions': json.loads(d.exclusions)
    } for d in destinations])

@app.route('/api/destination/<int:destination_id>', methods=['GET'])
def get_destination_details(destination_id):
    destination = Destination.query.get_or_404(destination_id)

    # Mock reviews (would come from DB in production)
    reviews = [
        {'name': 'Priya S.', 'rating': 5, 'comment': 'Amazing experience! The beaches were beautiful.'},
        {'name': 'Amit K.', 'rating': 4, 'comment': 'Great trip, well organized.'},
        {'name': 'Sneha M.', 'rating': 5, 'comment': 'Breathtaking views and excellent guides!'}
    ]

    return jsonify({
        'id': destination.id,
        'name': destination.name,
        'type': destination.type,
        'description': destination.description,
        'price': destination.price,
        'duration': destination.duration,
        'image_url': destination.image_url,
        'rating': destination.rating,
        'guide_name': destination.guide_name,
        'meeting_spot': destination.meeting_spot,
        'inclusions': json.loads(destination.inclusions),
        'exclusions': json.loads(destination.exclusions),
        'reviews': reviews
    })

@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        data = request.get_json()
        amount = int(data['amount'])

        # Mock payment order creation
        order = {
            'order_id': f"order_{uuid.uuid4().hex[:12]}",
            'amount': amount,
            'currency': 'INR',
            'status': 'created'
        }

        return jsonify({
            'order_id': order['order_id'],
            'amount': order['amount'],
            'currency': order['currency']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/booking', methods=['POST'])
def create_booking():
    try:
        data = request.get_json()

        booking = Booking(
            user_id=1,  # Mock user ID (replace with real auth in production)
            destination_id=data['destination_id'],
            travel_date=datetime.strptime(data['travel_date'], '%Y-%m-%d'),
            amount=data['amount'],
            payment_status='confirmed',
            payment_id=data.get('payment_id'),
            booking_reference=f"WW{uuid.uuid4().hex[:8].upper()}"
        )

        db.session.add(booking)
        db.session.commit()

        return jsonify({
            'booking_id': booking.id,
            'booking_reference': booking.booking_reference,
            'status': 'confirmed',
            'travel_date': booking.travel_date.strftime('%Y-%m-%d'),
            'amount': booking.amount
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/user/bookings/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.booking_date.desc()).all()
    return jsonify([{
        'id': b.id,
        'destination_name': b.destination.name,
        'destination_type': b.destination.type,
        'travel_date': b.travel_date.strftime('%Y-%m-%d'),
        'amount': b.amount,
        'payment_status': b.payment_status,
        'booking_reference': b.booking_reference,
        'booking_date': b.booking_date.strftime('%Y-%m-%d')
    } for b in bookings])

@app.route('/api/user/profile/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    bookings_count = Booking.query.filter_by(user_id=user_id).count()
    
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
        'member_since': user.created_at.strftime('%Y'),
        'trips_completed': bookings_count
    })

@app.route('/api/chatbot', methods=['POST'])
def chatbot_response():
    user_message = request.get_json().get('message', '').lower()
    
    # Intelligent chatbot responses
    if any(word in user_message for word in ['hello', 'hi', 'hey']):
        response = "Hello! I'm your travel assistant. How can I help you plan your next adventure?"
    elif 'beach' in user_message:
        response = "We have amazing beach destinations like Goa and Andaman Islands! Would you like to know more about them?"
    elif any(word in user_message for word in ['mountain', 'trek', 'hiking']):
        response = "Our Manali Mountain Trek is perfect for adventure lovers! It's a 5-day expedition through the Himalayas."
    elif any(word in user_message for word in ['price', 'cost', 'budget']):
        response = "Our trips range from ₹12,000 to ₹35,000 depending on the destination and duration. What's your budget?"
    elif any(word in user_message for word in ['book', 'booking', 'reserve']):
        response = "To book a trip, browse our destinations, click 'View Details', and then 'Confirm Trip'. It's that simple!"
    elif 'cultural' in user_message:
        response = "Check out our Jaipur Heritage Tour! Experience the royal palaces and rich culture of Rajasthan."
    elif 'adventure' in user_message:
        response = "Try our Rishikesh Adventure package! It includes white water rafting, bungee jumping, and yoga."
    elif 'nature' in user_message:
        response = "The Kerala Backwaters tour is perfect for nature lovers. Sail through serene backwaters on a houseboat!"
    elif any(word in user_message for word in ['payment', 'pay']):
        response = "We accept Google Pay, Paytm, and Credit/Debit cards. All payments are secure!"
    elif any(word in user_message for word in ['cancel', 'refund']):
        response = "You can cancel your booking up to 48 hours before departure for a full refund."
    elif 'guide' in user_message:
        response = "All our trips include experienced local guides who speak English and Hindi."
    else:
        response = "I'd be happy to help! You can ask me about destinations, prices, booking process, or any travel-related questions."
    
    return jsonify({'response': response})

# --------------------
# Initialize Database
# --------------------
def init_db():
    with app.app_context():
        db.create_all()

        # Create default user if not exists
        if not User.query.first():
            user = User(
                name='Travel Enthusiast',
                email='user@example.com',
                phone='+91 98765 43210',
                password_hash=generate_password_hash('password123')
            )
            db.session.add(user)

        # Seed initial destinations if not exists
        if not Destination.query.first():
            destinations = [
                {
                    'name': 'Goa Beach Paradise',
                    'type': 'beach',
                    'description': 'Experience the golden beaches and vibrant nightlife of Goa. Perfect blend of relaxation and adventure.',
                    'price': 15000,
                    'duration': '3 Days, 2 Nights',
                    'image_url': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
                    'rating': 4.8,
                    'guide_name': 'Rajesh Kumar',
                    'meeting_spot': 'Panaji Bus Stand',
                    'inclusions': json.dumps(['Hotel Accommodation', 'Breakfast & Dinner', 'Airport Transfers', 'Sightseeing Tours']),
                    'exclusions': json.dumps(['Lunch', 'Personal Expenses', 'Water Sports', 'Travel Insurance'])
                },
                {
                    'name': 'Manali Mountain Trek',
                    'type': 'mountain',
                    'description': 'Explore the majestic Himalayas with guided treks through Manali\'s scenic landscapes.',
                    'price': 22000,
                    'duration': '5 Days, 4 Nights',
                    'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                    'rating': 4.9,
                    'guide_name': 'Vikram Singh',
                    'meeting_spot': 'Manali Mall Road',
                    'inclusions': json.dumps(['Mountain Lodge Stay', 'All Meals', 'Trekking Gear', 'Expert Guide']),
                    'exclusions': json.dumps(['Personal Medication', 'Extra Activities', 'Laundry'])
                },
                {
                    'name': 'Jaipur Heritage Tour',
                    'type': 'cultural',
                    'description': 'Discover the royal heritage of Rajasthan with visits to magnificent palaces and forts.',
                    'price': 12000,
                    'duration': '2 Days, 1 Night',
                    'image_url': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
                    'rating': 4.7,
                    'guide_name': 'Meera Sharma',
                    'meeting_spot': 'Jaipur Railway Station',
                    'inclusions': json.dumps(['Heritage Hotel Stay', 'All Meals', 'Entry Tickets', 'Cultural Shows']),
                    'exclusions': json.dumps(['Shopping', 'Extra Sightseeing', 'Tips'])
                },
                {
                    'name': 'Kerala Backwaters',
                    'type': 'nature',
                    'description': 'Sail through the serene backwaters of Kerala on a traditional houseboat.',
                    'price': 18000,
                    'duration': '4 Days, 3 Nights',
                    'image_url': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
                    'rating': 4.9,
                    'guide_name': 'Suresh Menon',
                    'meeting_spot': 'Alleppey Boat Jetty',
                    'inclusions': json.dumps(['Houseboat Stay', 'Kerala Cuisine', 'Sunset Cruise', 'Village Tours']),
                    'exclusions': json.dumps(['Alcohol', 'Ayurvedic Spa', 'Extra Excursions'])
                },
                {
                    'name': 'Rishikesh Adventure',
                    'type': 'adventure',
                    'description': 'White water rafting, bungee jumping, and yoga in the adventure capital of India.',
                    'price': 16000,
                    'duration': '3 Days, 2 Nights',
                    'image_url': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
                    'rating': 4.8,
                    'guide_name': 'Aditya Verma',
                    'meeting_spot': 'Rishikesh Bus Stand',
                    'inclusions': json.dumps(['Camp Stay', 'All Meals', 'Rafting Equipment', 'Safety Gear']),
                    'exclusions': json.dumps(['Bungee Jump Fee', 'Personal Insurance', 'Extra Activities'])
                },
                {
                    'name': 'Andaman Islands',
                    'type': 'beach',
                    'description': 'Crystal clear waters, pristine beaches, and amazing coral reefs await you.',
                    'price': 35000,
                    'duration': '6 Days, 5 Nights',
                    'image_url': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                    'rating': 5.0,
                    'guide_name': 'Joseph Peter',
                    'meeting_spot': 'Port Blair Airport',
                    'inclusions': json.dumps(['Beach Resort', 'Island Hopping', 'Scuba Diving', 'All Transfers']),
                    'exclusions': json.dumps(['Flights', 'Alcohol', 'Water Sports Extras'])
                },
                {
                    'name': 'Ladakh Expedition',
                    'type': 'mountain',
                    'description': 'Journey through the highest motorable passes and stunning mountain landscapes.',
                    'price': 28000,
                    'duration': '7 Days, 6 Nights',
                    'image_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                    'rating': 4.9,
                    'guide_name': 'Tashi Dorje',
                    'meeting_spot': 'Leh Airport',
                    'inclusions': json.dumps(['Hotel Stay', 'All Meals', '4x4 Vehicle', 'Permits']),
                    'exclusions': json.dumps(['Flights', 'Alcohol', 'Personal Gear'])
                },
                {
                    'name': 'Varanasi Spiritual Journey',
                    'type': 'cultural',
                    'description': 'Experience the spiritual heart of India with Ganga Aarti and temple visits.',
                    'price': 10000,
                    'duration': '2 Days, 1 Night',
                    'image_url': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
                    'rating': 4.6,
                    'guide_name': 'Pandit Sharma',
                    'meeting_spot': 'Varanasi Junction',
                    'inclusions': json.dumps(['Hotel Stay', 'Breakfast', 'Boat Ride', 'Temple Guide']),
                    'exclusions': json.dumps(['Lunch/Dinner', 'Donations', 'Shopping'])
                }
            ]

            for dest_data in destinations:
                destination = Destination(**dest_data)
                db.session.add(destination)

            db.session.commit()
            print("✅ Database initialized with destinations!")

# --------------------
# Run App
# --------------------
if __name__ == '__main__':
    init_db()
    print("🚀 WanderWith Backend is running on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
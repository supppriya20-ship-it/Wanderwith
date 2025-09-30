// User Management
let currentUser = null;
let userBookings = [];

// Destinations Database
const destinations = [
    {
        id: 1,
        name: "Goa Beach Paradise",
        type: "beach",
        price: 15000,
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
        description: "Experience the best of Goa's beaches with this 5-day package",
        duration: "5 Days / 4 Nights",
        groupSize: "2-15 people",
        inclusions: ["Hotel Accommodation", "Breakfast & Dinner", "Airport Transfers", "Sightseeing Tours", "Water Sports Activities"],
        exclusions: ["Lunch", "Personal Expenses", "Travel Insurance", "Monument Entry Fees"],
        reviews: [
            { name: "Rahul S.", rating: 5, comment: "Amazing experience! The beaches were beautiful." },
            { name: "Priya M.", rating: 4, comment: "Great package, well organized tours." }
        ]
    },
    {
        id: 2,
        name: "Manali Mountain Retreat",
        type: "mountain",
        price: 18000,
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400",
        description: "Explore the scenic beauty of Manali with adventure activities",
        duration: "6 Days / 5 Nights",
        groupSize: "2-12 people",
        inclusions: ["Hotel Stay", "All Meals", "Paragliding Session", "Solang Valley Trip", "Local Sightseeing"],
        exclusions: ["Additional Activities", "Shopping", "Travel Insurance"],
        reviews: [
            { name: "Amit K.", rating: 5, comment: "Perfect mountain getaway!" },
            { name: "Sneha P.", rating: 5, comment: "Loved the paragliding experience." }
        ]
    },
    {
        id: 3,
        name: "Jaipur Cultural Tour",
        type: "cultural",
        price: 12000,
        rating: 4.3,
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400",
        description: "Discover the rich heritage and culture of the Pink City",
        duration: "4 Days / 3 Nights",
        groupSize: "2-20 people",
        inclusions: ["Heritage Hotel Stay", "Breakfast", "City Palace Tour", "Amber Fort Visit", "Local Guide"],
        exclusions: ["Lunch & Dinner", "Shopping", "Camel Ride"],
        reviews: [
            { name: "Deepak R.", rating: 4, comment: "Rich cultural experience." }
        ]
    },
    {
        id: 4,
        name: "Kerala Backwaters",
        type: "nature",
        price: 20000,
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400",
        description: "Relax in the serene backwaters of Kerala",
        duration: "5 Days / 4 Nights",
        groupSize: "2-8 people",
        inclusions: ["Houseboat Stay", "All Meals", "Ayurvedic Massage", "Village Tours", "Kathakali Show"],
        exclusions: ["Personal Expenses", "Additional Treatments"],
        reviews: [
            { name: "Anjali T.", rating: 5, comment: "Most relaxing vacation ever!" }
        ]
    },
    {
        id: 5,
        name: "Ladakh Adventure",
        type: "adventure",
        price: 35000,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        description: "Epic adventure through the Himalayas",
        duration: "7 Days / 6 Nights",
        groupSize: "4-10 people",
        inclusions: ["Hotels & Camps", "All Meals", "Bike Rental", "Permits", "Experienced Guide"],
        exclusions: ["Fuel Costs", "Personal Gear", "Travel Insurance"],
        reviews: [
            { name: "Vikram S.", rating: 5, comment: "Trip of a lifetime!" }
        ]
    },
    {
        id: 6,
        name: "Andaman Islands",
        type: "beach",
        price: 28000,
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1589993668178-8f96ce9e9f08?w=400",
        description: "Pristine beaches and crystal clear waters",
        duration: "6 Days / 5 Nights",
        groupSize: "2-12 people",
        inclusions: ["Resort Stay", "Breakfast & Dinner", "Scuba Diving", "Island Hopping", "Ferry Tickets"],
        exclusions: ["Lunch", "Additional Water Sports"],
        reviews: [
            { name: "Neha G.", rating: 5, comment: "Paradise on earth!" }
        ]
    }
];

// Authentication Functions
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    clearAuthForms();
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
    
    clearAuthForms();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('wanderWithUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { name: user.name, email: user.email, phone: user.phone };
        localStorage.setItem('wanderWithCurrentUser', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        closeAuthModal();
        showNotification('Welcome back, ' + user.name + '!');
    } else {
        showError('loginError', 'Invalid email or password');
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        showError('signupError', 'Passwords do not match');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('wanderWithUsers') || '[]');
    if (users.find(u => u.email === email)) {
        showError('signupError', 'Email already registered. Please login.');
        return;
    }
    
    // Create new user
    const newUser = { name, email, phone, password };
    users.push(newUser);
    localStorage.setItem('wanderWithUsers', JSON.stringify(users));
    
    // Auto login
    currentUser = { name, email, phone };
    localStorage.setItem('wanderWithCurrentUser', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    closeAuthModal();
    showNotification('Account created successfully! Welcome, ' + name + '!');
}

function socialLogin(provider) {
    showNotification('Social login with ' + provider + ' coming soon!');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('wanderWithCurrentUser');
    updateUIForLoggedOutUser();
    closeProfileModal();
    showNotification('Logged out successfully');
}

function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('profileIcon').style.display = 'block';
    document.getElementById('profileLink').style.display = 'block';
}

function updateUIForLoggedOutUser() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('profileIcon').style.display = 'none';
    document.getElementById('profileLink').style.display = 'none';
}

function clearAuthForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showNotification(message) {
    // Simple notification (you can enhance this)
    alert(message);
}

// Initialize on page load
function initializePage() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('wanderWithCurrentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
    
    // Load bookings
    userBookings = JSON.parse(localStorage.getItem('wanderWithBookings') || '[]');
    
    // Display destinations
    displayDestinations(destinations);
}

// Destination Display Functions
function displayDestinations(destinationsToShow) {
    const grid = document.getElementById('destinationGrid');
    grid.innerHTML = '';
    
    destinationsToShow.forEach(dest => {
        const card = createDestinationCard(dest);
        grid.appendChild(card);
    });
}

function createDestinationCard(dest) {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
        <div class="destination-image" style="background-image: url('${dest.image}')">
            <span class="destination-type">${dest.type}</span>
        </div>
        <div class="destination-info">
            <h3>${dest.name}</h3>
            <p>${dest.description}</p>
            <div class="destination-price">₹${dest.price.toLocaleString()}</div>
            <div class="destination-rating">
                <span class="stars">${'⭐'.repeat(Math.floor(dest.rating))}</span>
                <span>(${dest.rating}/5)</span>
            </div>
            <button class="view-details-btn" onclick="showDestinationDetails(${dest.id})">
                View Details
            </button>
        </div>
    `;
    return card;
}

function showDestinations(type) {
    const filtered = destinations.filter(d => d.type === type);
    displayDestinations(filtered);
    updateFilterButtons(type);
}

function showAllDestinations() {
    displayDestinations(destinations);
    updateFilterButtons('all');
}

function updateFilterButtons(activeType) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if ((activeType === 'all' && btn.textContent === 'All') ||
            btn.textContent.toLowerCase() === activeType) {
            btn.classList.add('active');
        }
    });
}

function filterDestinations() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = destinations.filter(d => 
        d.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm) ||
        d.type.toLowerCase().includes(searchTerm)
    );
    displayDestinations(filtered);
}

// Modal Functions
function showDestinationDetails(id) {
    const dest = destinations.find(d => d.id === id);
    if (!dest) return;
    
    const modal = document.getElementById('destinationModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="destination-detail-content">
            <h2>${dest.name}</h2>
            <img src="${dest.image}" alt="${dest.name}" style="width:100%;border-radius:10px;margin:1rem 0;">
            
            <div class="trip-info">
                <h3>Trip Details</h3>
                <p><strong>Duration:</strong> ${dest.duration}</p>
                <p><strong>Group Size:</strong> ${dest.groupSize}</p>
                <p><strong>Price:</strong> ₹${dest.price.toLocaleString()} per person</p>
                <p><strong>Rating:</strong> ${'⭐'.repeat(Math.floor(dest.rating))} ${dest.rating}/5</p>
            </div>
            
            <div class="inclusions">
                <h3>Inclusions</h3>
                <ul>
                    ${dest.inclusions.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="exclusions">
                <h3>Exclusions</h3>
                <ul>
                    ${dest.exclusions.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="reviews">
                <h3>Reviews</h3>
                ${dest.reviews.map(review => `
                    <div class="review">
                        <strong>${review.name}</strong> - ${'⭐'.repeat(review.rating)}
                        <p>${review.comment}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="booking-actions">
                <button class="btn btn--primary btn--full-width" onclick="initiateBooking(${dest.id})">
                    Book Now - ₹${dest.price.toLocaleString()}
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('destinationModal').style.display = 'none';
}

function initiateBooking(destId) {
    if (!currentUser) {
        closeModal();
        openAuthModal();
        showNotification('Please login or sign up to book a trip');
        return;
    }
    
    const dest = destinations.find(d => d.id === destId);
    showPaymentModal(dest);
}

// Payment Functions
function showPaymentModal(dest) {
    const modal = document.getElementById('paymentModal');
    const paymentDetails = document.getElementById('paymentDetails');
    
    paymentDetails.innerHTML = `
        <div class="payment-summary">
            <h4>Booking Summary</h4>
            <p><strong>Destination:</strong> ${dest.name}</p>
            <p><strong>Duration:</strong> ${dest.duration}</p>
            <p><strong>Price per person:</strong> ₹${dest.price.toLocaleString()}</p>
            <div style="margin-top: 1rem;">
                <label><strong>Number of Travelers:</strong></label><br>
                <input type="number" id="numTravelers" value="1" min="1" max="15" 
                    style="margin-top: 0.5rem;" onchange="updatePaymentTotal(${dest.price})">
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #ddd;">
                <p style="font-size: 1.3rem;"><strong>Total Amount:</strong> 
                    <span style="color: #667eea;">₹<span id="totalAmount">${dest.price.toLocaleString()}</span></span>
                </p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    window.currentBookingDest = dest;
}

function updatePaymentTotal(pricePerPerson) {
    const numTravelers = parseInt(document.getElementById('numTravelers').value) || 1;
    const total = pricePerPerson * numTravelers;
    document.getElementById('totalAmount').textContent = total.toLocaleString();
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function processPayment(method) {
    const numTravelers = parseInt(document.getElementById('numTravelers').value) || 1;
    const total = window.currentBookingDest.price * numTravelers;
    
    // Create booking
    const booking = {
        id: Date.now(),
        destination: window.currentBookingDest.name,
        travelers: numTravelers,
        total: total,
        date: new Date().toLocaleDateString(),
        status: 'Confirmed',
        user: currentUser.email
    };
    
    userBookings.push(booking);
    localStorage.setItem('wanderWithBookings', JSON.stringify(userBookings));
    
    closePaymentModal();
    closeModal();
    showSuccessMessage();
}

// Profile Functions
function toggleProfile() {
    if (!currentUser) {
        openAuthModal();
        return;
    }
    
    const modal = document.getElementById('profileModal');
    const profileContent = document.getElementById('profileContent');
    
    profileContent.innerHTML = `
        <div class="profile-info">
            <div class="profile-avatar">👤</div>
            <div class="profile-details">
                <h4>${currentUser.name}</h4>
                <p>📧 ${currentUser.email}</p>
                <p>📱 ${currentUser.phone}</p>
            </div>
        </div>
        <button class="btn btn--secondary btn--full-width" onclick="logout()">Logout</button>
    `;
    
    // Display user bookings
    const userSpecificBookings = userBookings.filter(b => b.user === currentUser.email);
    const bookingsContainer = document.getElementById('userBookings');
    
    if (userSpecificBookings.length === 0) {
        bookingsContainer.innerHTML = '<p style="color: #999;">No bookings yet. Start exploring destinations!</p>';
    } else {
        bookingsContainer.innerHTML = userSpecificBookings.map(booking => `
            <div style="background: #f9f9f9; padding: 1rem; border-radius: 8px; margin: 0.5rem 0;">
                <h4 style="color: #667eea;">${booking.destination}</h4>
                <p><strong>Travelers:</strong> ${booking.travelers}</p>
                <p><strong>Total:</strong> ₹${booking.total.toLocaleString()}</p>
                <p><strong>Booking Date:</strong> ${booking.date}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50;">${booking.status}</span></p>
            </div>
        `).join('');
    }
    
    modal.style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Success Message
function showSuccessMessage() {
    document.getElementById('successMessage').style.display = 'block';
}

function hideSuccessMessage() {
    document.getElementById('successMessage').style.display = 'none';
}

// Chatbot Functions
function toggleChatbot() {
    const chatbotBody = document.getElementById('chatbotBody');
    chatbotBody.style.display = chatbotBody.style.display === 'flex' ? 'none' : 'flex';
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    input.value = '';
    
    // Generate bot response
    setTimeout(() => {
        const response = generateBotResponse(message);
        addChatMessage(response, 'bot');
    }, 500);
}

function addChatMessage(message, type) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'bot-message';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateBotResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        return 'Our packages range from ₹12,000 to ₹35,000 depending on the destination and duration. Would you like to know about a specific destination?';
    } else if (lowerMessage.includes('goa') || lowerMessage.includes('beach')) {
        return 'Our Goa Beach Paradise package is ₹15,000 for 5 days/4 nights. It includes hotel, meals, airport transfers, and water sports! Would you like to book?';
    } else if (lowerMessage.includes('manali') || lowerMessage.includes('mountain')) {
        return 'Manali Mountain Retreat is ₹18,000 for 6 days/5 nights with paragliding included! Perfect for adventure lovers.';
    } else if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
        if (!currentUser) {
            return 'To book a trip, please sign up or login first. Click the Sign In button in the navigation bar.';
        }
        return 'Great! Browse our destinations above and click "View Details" on any package to book.';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        return 'We accept Google Pay, Paytm, and Credit/Debit Cards. Payment is secure and instant!';
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
        return 'Cancellations are free up to 7 days before departure. After that, a 30% charge applies. Full refunds for cancellations 15+ days before departure.';
    } else if (lowerMessage.includes('group') || lowerMessage.includes('people')) {
        return 'Most of our packages accommodate 2-15 people. Perfect for families, friends, or solo travelers!';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return 'Hello! How can I help you plan your perfect trip today?';
    } else if (lowerMessage.includes('thank')) {
        return 'You\'re welcome! Have a great trip! 🌟';
    } else {
        return 'I can help you with destination info, pricing, bookings, and payments. What would you like to know?';
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const destModal = document.getElementById('destinationModal');
    const paymentModal = document.getElementById('paymentModal');
    const profileModal = document.getElementById('profileModal');
    const authModal = document.getElementById('authModal');
    
    if (event.target === destModal) {
        closeModal();
    } else if (event.target === paymentModal) {
        closePaymentModal();
    } else if (event.target === profileModal) {
        closeProfileModal();
    } else if (event.target === authModal) {
        closeAuthModal();
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
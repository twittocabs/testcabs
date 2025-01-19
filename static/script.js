document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loggedInUserDisplay = document.getElementById('loggedInUser');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const heroSignupBtn = document.getElementById('heroSignupBtn');
    const paymentModal = document.getElementById('paymentModal');
    const completePaymentBtn = document.getElementById('completePaymentBtn');
    const postRideBtn = document.getElementById('postRideBtn');
    const publishRideBtn = document.getElementById('publishRideBtn');
    const postRideModal = document.getElementById('postRideModal');
    const publishRideModal = document.getElementById('publishRideModal');
    const closeButtons = document.querySelectorAll('.close-button');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const postRideForm = document.getElementById('postRideForm');
    const publishRideForm = document.getElementById('publishRideForm');
    const paymentAmountDisplay = document.getElementById('paymentAmount');
    const ridesContainer = document.getElementById('ridesContainer');
    const indianLocationsList = document.getElementById('indianLocationsList');
    const filterType = document.getElementById('filterType');
    const filterGender = document.getElementById('filterGender');
    const searchLocation = document.getElementById('searchLocation');
    const postPickUpInput = document.getElementById('postPickUp');
    const postDropOffInput = document.getElementById('postDropOff');
    const publishPickUpInput = document.getElementById('publishPickUp');
    const publishDropOffInput = document.getElementById('publishDropOff');

    // --- Data ---
    const indianLocations = [
        { state: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kakinada", "Tirupati"] },
        { state: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang"] },
        { state: "Assam", cities: ["Guwahati", "Silchar", "Dibrugarh", "Nagaon", "Tezpur"] },
        { state: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnea"] },
        { state: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"] },
        { state: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"] },
        { state: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"] },
        { state: "Haryana", cities: ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar"] },
        { state: "Himachal Pradesh", cities: ["Shimla", "Mandi", "Solan", "Dharamshala", "Kullu"] },
        { state: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"] },
        { state: "Karnataka", cities: ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"] },
        { state: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"] },
        { state: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"] },
        { state: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur"] },
        { state: "Manipur", cities: ["Imphal", "Thoubal", "Bishnupur", "Ukhrul"] },
        { state: "Meghalaya", cities: ["Shillong", "Tura", "Jowai"] },
        { state: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai"] },
        { state: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung"] },
        { state: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur"] },
        { state: "Punjab", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"] },
        { state: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Kota", "Bikaner"] },
        { state: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan", "Gyalshing"] },
        { state: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
        { state: "Telangana", cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"] },
        { state: "Tripura", cities: ["Agartala", "Udaipur", "Dharmanagar"] },
        { state: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad", "Noida"] },
        { state: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"] },
        { state: "West Bengal", cities: ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Burdwan"] }
    ];
    let rides = [];
    let loggedInUser = null;
    let shownContacts = {};

    // --- Helper Functions ---
    // Update login state of UI
    async function updateLoginState() {
        if (loggedInUser) {
            try {
                const response = await fetch(`http://127.0.0.1:4000/user/${loggedInUser.id}`);
                if (!response.ok) {
                    alert(`Failed to fetch user details: HTTP error! status: ${response.status}`)
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const userDetails = await response.json();
                loggedInUser = { ...loggedInUser, ...userDetails };
                loggedInUserDisplay.textContent = `Welcome, ${loggedInUser.name}`;
                logoutBtn.style.display = 'inline-block';
                signupBtn.style.display = 'none';
                loginBtn.style.display = 'none';
                postRideBtn.disabled = false;
                publishRideBtn.disabled = false;
            } catch (error) {
                console.error("Failed to fetch user details:", error);
            }

        } else {
            loggedInUserDisplay.textContent = '';
            logoutBtn.style.display = 'none';
            signupBtn.style.display = 'inline-block';
            loginBtn.style.display = 'inline-block';
            postRideBtn.disabled = true;
            publishRideBtn.disabled = true;
        }
    }
    updateLoginState(); // Initial login state

    // Log actions
    function logAction(message) {
        console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
    }

    // Load rides from server
    async function loadRides() {
        try {
            const response = await fetch('http://127.0.0.1:4000/rides');
            if (!response.ok) {
                alert(`Failed to load rides: HTTP error! status: ${response.status}`)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            rides = await response.json();
            await loadShownContacts();
            renderRides();
            logAction("Loaded saved rides from database");
        } catch (error) {
            console.error("Failed to load rides:", error);
        }
    }
    loadRides();

    // Function to load shown contacts from the server
    async function loadShownContacts() {
        try {
            const response = await fetch('http://127.0.0.1:4000/shown-contacts');
            if (!response.ok) {
                alert(`Failed to load shown contacts: HTTP error! status: ${response.status}`)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contacts = await response.json();
            shownContacts = contacts.reduce((acc, curr) => {
                acc[curr.ride_id] = curr.show_contact;
                return acc;
            }, {});
        } catch (error) {
            console.error("Failed to load shown contacts:", error);
        }
    }

     // Function to populate datalist based on user input
    function populateLocations(inputElement) {
        const input = inputElement.value.toLowerCase();
        indianLocationsList.innerHTML = '';

        indianLocations.forEach(location => {
            const state = location.state.toLowerCase();
            location.cities.forEach(city => {
                const cityLower = city.toLowerCase();
                if (cityLower.startsWith(input) || state.startsWith(input)) {
                    const option = document.createElement('option');
                    option.value = `${location.state}, ${city}`;
                    indianLocationsList.appendChild(option);
                }
            });

        });
    }

    // Add event listener to pickup and dropoff
    postPickUpInput.addEventListener('input', function () {
        populateLocations(this);
    });
    postDropOffInput.addEventListener('input', function () {
        populateLocations(this);
    });
    publishPickUpInput.addEventListener('input', function () {
        populateLocations(this);
    });
    publishDropOffInput.addEventListener('input', function () {
        populateLocations(this);
    });


    // Validate location against Indian locations list
    function isValidIndianLocation(location) {
         // Bypass the validation.
         return true;
        // if (!location) return false;
        // const [state, city] = location.split(', ').map(part => part.trim().toLowerCase());
        // return indianLocations.some(loc =>
        //     loc.state.toLowerCase() === state && loc.cities.some(c => c.toLowerCase() === city)
        // );
    }

   // Complete payment and open relevant modal
    async function completePayment(rideType) {
        paymentModal.style.display = 'none';
        const paymentDisabled = 'payment_disabled';
           if(paymentDisabled === 'payment_disabled'){
                 if (rideType === 'post') {
                    postRideModal.style.display = 'block';
                     logAction('Opened Post Ride modal after payment disabled');
                } else if (rideType === 'publish') {
                   publishRideModal.style.display = 'block';
                      logAction('Opened Publish Ride modal after payment disabled');
               }
            }
             else{
            const paymentLink = "https://rzp.io/rzp/A4vRJIc"; // Use the provided payment link
            window.location.href = paymentLink + `?rideType=${rideType}`;
             logAction("Redirecting to payment page with hardcoded link");
             }
    }


    // Generate initials from name
    function generateInitials(name) {
        if (!name) return '';
        const names = name.split(' ');
        let initials = '';
        for (let i = 0; i < Math.min(2, names.length); i++) {
            initials += names[i][0].toUpperCase();
        }
        return initials;
    }
    // Function to filter rides based on multiple criteria
    function filterRides(ride) {
        const filterTypeValue = filterType.value;
        const filterGenderValue = filterGender.value;
        const searchLocationValue = searchLocation.value.toLowerCase();

        const locationMatch = (searchLocationValue === '' ||
            ride.pickUp.toLowerCase().includes(searchLocationValue) ||
            ride.dropOff.toLowerCase().includes(searchLocationValue)
        );
        const typeMatch = (filterTypeValue === 'all' || ride.type === filterTypeValue);
        const genderMatch = (filterGenderValue === 'all' || ride.gender === filterGenderValue);

        return locationMatch && typeMatch && genderMatch;
    }
    // Function to handle OTP verification and display contact
    async function verifyOTPAndShowContact(ride, index, contactButton) { // added ride and index parameters
        const otp = prompt("Please enter the OTP sent to your mobile number:");
        if (otp && otp === '1234') { // Replace '1234' with your OTP logic
            const rideId = `${ride.type}-${ride.id}`; // added rideId to body
            shownContacts[rideId] = 1;
            try {
                const response = await fetch('http://127.0.0.1:4000/shown-contacts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ride_id: rideId, // pass rideId to the function
                        show_contact: 1
                    }),
                });
                if (!response.ok) {
                    alert(`Failed to update contact: HTTP error! status: ${response.status}`)
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                contactButton.innerHTML = `<a href="tel:${ride.contact}" class="call-button-link"><i class="fas fa-phone icon"></i> ${ride.contact}</a>`;
            } catch (error) {
                console.error("Failed to update contact:", error);
                alert(`Failed to update contact: ${error.message}`)
            }
        } else {
            alert("Invalid OTP. Please try again.");
        }
    }

    // Render ride cards
    function renderRides() {
        ridesContainer.innerHTML = '';
        rides.filter(filterRides).forEach((ride, index) => {
            const card = document.createElement('div');
            card.classList.add('ride-card');
            const initials = generateInitials(ride.userName);
            card.innerHTML = `
                       <div class="profile-container">
                           <div class="profile-circle">${initials}</div>
                            <span>${ride.userName}</span>
                       </div>
                       <h3><i class="fas fa-car icon"></i>${ride.type === 'post' ? 'Posting' : 'Publishing'} Ride</h3>
                      <p><i class="fas fa-map-marker-alt icon"></i> <strong>Pick-up:</strong> ${ride.pickUp}</p>
                       <p><i class="fas fa-map-marker-alt icon"></i> <strong>Drop-off:</strong> ${ride.dropOff}</p>
                      <p><i class="fas fa-venus-mars icon"></i> <strong>Gender:</strong> ${ride.gender}</p>
                      <p><i class="fas fa-chair icon"></i> <strong>Seats:</strong> ${ride.seats}</p>
                      <p><i class="fas fa-users icon"></i> <strong>Persons:</strong> ${ride.persons}</p>
                     <p><i class="fas fa-car icon"></i> <strong>Car Type:</strong> ${ride.carType}</p>
                  `;
            const rideId = `${ride.type}-${ride.id}`;

            if (!shownContacts[rideId]) {
                const contactButton = document.createElement('button');
                contactButton.classList.add('call-button');
                contactButton.innerHTML = '<i class="fas fa-phone icon"></i> Show Contact';
                contactButton.addEventListener('click', () => {
                    verifyOTPAndShowContact(ride, index, contactButton); // added ride and index
                });
                card.appendChild(contactButton);
            } else {
                const contactButton = document.createElement('button');
                contactButton.classList.add('call-button');
                contactButton.innerHTML = `<a href="tel:${ride.contact}" class="call-button-link"><i class="fas fa-phone icon"></i> ${ride.contact}</a>`;
                card.appendChild(contactButton);
            }
            ridesContainer.appendChild(card);
        });
    }
    // --- Event Listeners ---
    // Filter Event Listeners
    filterType.addEventListener('change', renderRides);
    filterGender.addEventListener('change', renderRides);
    searchLocation.addEventListener('input', renderRides);

    // Login button click
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
        logAction('Opened login modal');
    });

    // Signup button click
    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'block';
        logAction('Opened signup modal');
    });
        // Hero signup button click
    heroSignupBtn.addEventListener('click', () => {
        signupModal.style.display = 'block';
        logAction('Opened signup modal from hero section');
    });

    // Logout button click
    logoutBtn.addEventListener('click', () => {
        loggedInUser = null;
        shownContacts = {};
        updateLoginState();
        logAction("Logged out");
    });
      // Post ride button click
        postRideBtn.addEventListener('click', () => {
            if (!loggedInUser) {
                alert('Please Login or Signup first')
                return;
            }
           const paymentDisabled = 'payment_disabled';
           if (paymentDisabled === 'payment_disabled') {
              postRideModal.style.display = 'block';
                logAction('Opened Post Ride modal after payment disabled');
             } else {
             paymentAmountDisplay.textContent = '25';
            paymentModal.style.display = 'block';
            paymentModal.dataset.rideType = 'post';
            logAction("Opened payment modal for post ride");
           }
        });

        // Publish ride button click
        publishRideBtn.addEventListener('click', () => {
            if (!loggedInUser) {
                alert('Please Login or Signup first')
                return;
            }
           const paymentDisabled = 'payment_disabled';
           if (paymentDisabled === 'payment_disabled') {
               publishRideModal.style.display = 'block';
            logAction('Opened Publish Ride modal after payment disabled');
           } else {
              paymentAmountDisplay.textContent = '50';
                paymentModal.style.display = 'block';
                paymentModal.dataset.rideType = 'publish';
                logAction('Opened payment modal for publish ride');
           }
        });

    // Complete payment button click
     completePaymentBtn.addEventListener('click', () => {
        const rideType = paymentModal.dataset.rideType;
        completePayment(rideType);
    });

    // Close modal buttons click
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginModal.style.display = 'none';
            paymentModal.style.display = 'none';
            signupModal.style.display = 'none';
            postRideModal.style.display = 'none';
            publishRideModal.style.display = 'none';
            logAction('Closed modal');
        });
    });
      // Close modals by clicking outside of them
      window.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
                logAction('Closed login modal by clicking outside');
            }
           if (event.target === paymentModal) {
                paymentModal.style.display = 'none';
                logAction('Closed payment modal by clicking outside');
            }
            if (event.target === signupModal) {
                signupModal.style.display = 'none';
                logAction('Closed signup modal by clicking outside');
            }
            if (event.target === postRideModal) {
                postRideModal.style.display = 'none';
                logAction('Closed post ride modal by clicking outside');
            }
            if (event.target === publishRideModal) {
                publishRideModal.style.display = 'none';
                logAction('Closed publish ride modal by clicking outside');
            }
        });

    // Handle signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const gender = document.getElementById('signupGender').value;
        console.log('Signup Data:', {name, email, password, gender});

        try {
            const response = await fetch('http://127.0.0.1:4000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    gender: gender,
                }),
            });
            console.log('Signup Response:', response);
            if (!response.ok) {
                if (response.status === 409) {
                    alert('Email address already exists. Please use a different email address.')
                }
                else {
                    alert(`Failed to signup user: HTTP error! status: ${response.status}`)
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('Signup Result:', result);
            loggedInUser = {
                id: result.id,
                name: name,
                email: email,
                gender: gender
            };
            signupForm.reset();
            await updateLoginState();
            signupModal.style.display = 'none';
            logAction(`Signed up user ${name}`);
            alert('Signup Successful, You are logged in');
        } catch (error) {
            console.error("Failed to signup user:", error);
            alert('Failed to signup. Please try again.');
        }
    });


    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const response = await fetch('http://127.0.0.1:4000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });
            if (!response.ok) {
                 if (response.status === 401) {
                     alert("Invalid Credentials");
                }
                else {
                   alert(`Failed to login user: HTTP error! status: ${response.status}`)
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            loggedInUser = await response.json();
            loginForm.reset();
            await updateLoginState();
            loginModal.style.display = 'none';
            logAction(`Logged in user ${email}`);
            alert('Login Successful');
        } catch (error) {
            console.error("Failed to login user:", error);
            alert('Failed to login. Please try again.');
        }
    });
        // Common function to handle ride form submission
        async function handleRideFormSubmit(form, type) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pickUpInput = form.querySelector(`#${type}PickUp`);
                const dropOffInput = form.querySelector(`#${type}DropOff`);
                const pickUp = pickUpInput.value;
                const dropOff = dropOffInput.value;
                const gender = form.querySelector(`#${type}Gender`).value;
                const userName = form.querySelector(`#${type}UserName`).value;
                const seats = form.querySelector(`#${type}Seats`).value;
                const carType = form.querySelector(`#${type}CarType`).value;
                const persons = form.querySelector(`#${type}Persons`).value;
                const contact = form.querySelector(`#${type}Contact`).value;
                const bags = form.querySelector(`#${type}Bags`)?.value;
                 const price = form.querySelector(`#${type}Price`)?.value;
                 const bagsAllowed = form.querySelector(`#${type}BagsAllowed`)?.value;
                  const petsAllowed = form.querySelector(`#${type}PetsAllowed`)?.value;

            //  if (!isValidIndianLocation(pickUp) || !isValidIndianLocation(dropOff)) {
             //       alert('Please enter valid Indian locations for pickup and drop-off locations.');
            //     return;
            // }
                try {
                    const response = await fetch('http://127.0.0.1:4000/rides', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            type: type,
                            pickUp: pickUp,
                            dropOff: dropOff,
                            userName: userName,
                            gender: gender,
                            seats: seats,
                            carType: carType,
                            persons: persons,
                            contact: contact,
                            bags: bags,
                            price: price,
                           bagsAllowed: bagsAllowed,
                           petsAllowed: petsAllowed,
                            user_id: loggedInUser ? loggedInUser.id : null
                        }),
                    });
                     if (!response.ok) {
                        alert(`Failed to ${type} ride: HTTP error! status: ${response.status}`)
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    form.closest('.modal').style.display = 'none'; //Close modal
                    form.reset();
                    await loadRides();
                    if (loggedInUser) {
                       alert(`Ride ${type === 'post' ? 'Posted' : 'Published'}, Have a safe journey!`);
                    }
                    logAction(`${type === 'post' ? 'Posted' : 'Published'} a ride from ${pickUp} to ${dropOff} by ${userName}`);
                } catch (error) {
                    console.error(`Failed to ${type} ride:`, error);
                     alert(`Failed to ${type} ride. Please try again.`);
                }

            });
        }

    // Handle post ride form submission
    handleRideFormSubmit(postRideForm, 'post');

    // Handle publish ride form submission
    handleRideFormSubmit(publishRideForm, 'publish');

    // --- Check for success parameter on page load ---
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('success');
     const rideType = urlParams.get('rideType');

      if (paymentSuccess === 'true') {
        // Instead of redirecting here, check your database
        // to see if payment exists and if so, display the modals
        // this is how your server should handle the webhook, so display modal only if payment is there.
           if (rideType === 'post') {
             postRideModal.style.display = 'block';
               logAction('Opened Post Ride modal after payment');
            // Remove the success parameter from the URL to avoid issues on page refresh
            const newUrl = window.location.href.split("?")[0];
             window.history.replaceState({}, document.title, newUrl);
        } else if (rideType === 'publish') {
            publishRideModal.style.display = 'block';
             logAction('Opened Publish Ride modal after payment');
            // Remove the success parameter from the URL to avoid issues on page refresh
           const newUrl = window.location.href.split("?")[0];
             window.history.replaceState({}, document.title, newUrl);
        }


    }
});
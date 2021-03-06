let restaurant, reviewsRestaurant;
var map;

//Add reviews to the database
DBHelper.putValuesReviewsDatabase();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {

    fetchReviewsRestaurantFromURL((error, reviews) => {
        if (error) { // Got an error!
            console.log(error);
        }
        // fill Media Reviews
        const mediaReviews = document.getElementById('media-reviews');
        mediaReviews.innerHTML = "Media reviews: "+calcMediaReviews();
        mediaReviews.setAttribute("aria-label","Media reviews: "+calcMediaReviews());
    });

    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
              console.log(error);
        } else {
                const coords = restaurant.latlng.split(",");
                const Lat = coords[0].split(":");
                const Lng = coords[1].split(":");
                restaurant.latlng = { lat: Number(Lat[1].trim()), lng: Number(Lng[1].trim()) };
                
                self.map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 16,
                    center: restaurant.latlng,
                    scrollwheel: false
                });
                fillBreadcrumb();
                DBHelper.mapMarkerForRestaurantInfo(self.restaurant, self.map);
        }
    });

};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.log(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant);
        });
    }
};

/**
 * Get current reviews for the restaurant from page URL.
 */
fetchReviewsRestaurantFromURL  = (callback) => {
    if (self.reviewsRestaurant) { // reviews restaurant already fetched!
        callback(null, self.reviewsRestaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchReviewsRestaurant(id, (error, reviews) => {
            self.reviewsRestaurant = reviews;
            if (!reviews) { // Got an error
                console.log(error);
                return;
            }
            fillReviewsHTML();
            callback(null,reviews);
        });
    }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    //Modify the title tag of the page by adding the restaurant name
    const title = document.title;
    document.title = `${title} - ${restaurant.name}`;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;
    address.setAttribute("aria-label","Address: "+restaurant.address);

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.alt = `Image of ${restaurant.name}`;
    image.src = `${DBHelper.imageUrlForRestaurant()}${restaurant.photograph_maxw}`;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;
    cuisine.setAttribute("aria-label","Cuisine: "+restaurant.cuisine_type);

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }

    // fill Summary Opening Times
    fillRestaurantHoursSummaryHTML();

};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const op_hours = operatingHours.split(",");
    const dayHours = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    op_hours.forEach(function(v,i,a) {
        const hours = a[i].slice((a[i].indexOf(":")+1),a[i].length);
        dayHours[days[i]] = hours;
    });

    const hours = document.getElementById('restaurant-hours');
    let i = 0;
    for (let key in dayHours) {
        const row = document.createElement('tr');
        if(i % 2 !== 0) {
            row.className = "odd";
        } else {
            row.className = "even";
        }
        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = dayHours[key].trim();
        row.appendChild(time);

        hours.appendChild(row);
        i++;
    }
};

/**
 * Create restaurant summary opening times
 */
fillRestaurantHoursSummaryHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours_summary = document.getElementById('hours-summary');
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let string = "Opening time: ";
    let i = 0;
    for (let key in operatingHours) {
        if(i == 0) {
            string += days[i];
            if(operatingHours[days[i+1]] != operatingHours[days[i]]) {
                string += " "+operatingHours[days[i]]; 
            }
        } else {
            if(operatingHours[days[i]] == operatingHours[days[i-1]]) {
                string += ", "+days[i];
                if(operatingHours[days[i+1]] != operatingHours[days[i]]) {
                    string += " "+operatingHours[days[i]]; 
                }
            } else {
                string += "; "+days[i];
                if(operatingHours[days[i+1]] != operatingHours[days[i]]) {
                    string += " "+operatingHours[days[i]]; 
                }
            }
        }
        i++;
    }
    hours_summary.innerHTML = string;
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviewsRestaurant) => {

    const container = document.getElementById('reviews-container');

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    const article = document.createElement('article');
    article.className = "cont-review";
    li.appendChild(article);

    const header = document.createElement('header');
    article.appendChild(header);

    const name = document.createElement('h3');
    name.className = "name-review";
    name.innerHTML = review.name;
    header.appendChild(name);

    const date = document.createElement('p');
    date.className = "date-review";
    date.innerHTML = new Date(Number(review.updatedAt)).toDateString();
    header.appendChild(date);

    const div_cont = document.createElement('div');
    div_cont.className = "body-review";
    article.appendChild(div_cont);

    const rating = document.createElement('p');
    rating.className = "rating-review";
    rating.innerHTML = `Rating: ${review.rating}`;
    div_cont.appendChild(rating);

    const comments = document.createElement('p');
    comments.className = "comment-review";
    comments.innerHTML = review.comments;
    div_cont.appendChild(comments);

    return li;
};

/**
 * Average calculation reviews
 */
calcMediaReviews = (reviews = self.reviewsRestaurant) => {
    if(reviews) {
        let i;
        let sum = 0;
        let media = 0;
        let num_reviews = reviews.length;
        for(i = 0; i < num_reviews; i++) {
            sum = sum + Number(reviews[i].rating);
        }
        media = sum / num_reviews;
        media = media > 0 ? media.toFixed(2) : "No reviews available";
        return media;
    }
    return "No reviews available";
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * For those who use the keyboard to navigate, they can skip to the main content "Restaurant Info"
 */
const skip_link_restaurant_info = document.getElementById("skip-link-restaurant-info");
if(skip_link_restaurant_info !== null) {
    const restaurant_focus_restaurant_info = document.getElementById("restaurant-container");
    skip_link_restaurant_info.addEventListener("keydown",function(event){
        const key = event.charCode || event.keyCode;
        if(key === 32 || key === 13) {
            restaurant_focus.focus();
        }
    });
}

/**
 * Open modal for Add Review with Keyboard Trap
 */
// Will hold previously focused element
let focusedElementBeforeModal;

// Find the modal and its overlay
const modal = document.querySelector('.modal');
const modalOverlay = document.querySelector('.modal-overlay');

const modalToggle = document.querySelector('.modal-toggle');
modalToggle.addEventListener('click', openModal);

function openModal() {
    // Save current focus
    focusedElementBeforeModal = document.activeElement;

    // Listen for and trap the keyboard
    modal.addEventListener('keydown', trapTabKey);

    // Listen for indicators to close the modal
    modalOverlay.addEventListener('click', closeModal);

    //Close modal
    const closeModalButton = modal.querySelector('#close-modal');
    closeModalButton.addEventListener("click",closeModal);

    // Find all focusable children
    let focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    let focusableElements = modal.querySelectorAll(focusableElementsString);
    // Convert NodeList to Array
    focusableElements = Array.prototype.slice.call(focusableElements);

    let firstTabStop = focusableElements[0];
    let lastTabStop = focusableElements[focusableElements.length - 1];

    // Show the modal and overlay
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';

    // Focus first child
    firstTabStop.focus();

    function trapTabKey(e) {
        // Check for TAB key press
        if (e.keyCode === 9) {

            // SHIFT + TAB
            if (e.shiftKey) {
                if (document.activeElement === firstTabStop) {
                    e.preventDefault();
                    lastTabStop.focus();
                }

            // TAB
            } else {
                if (document.activeElement === lastTabStop) {
                    e.preventDefault();
                    firstTabStop.focus();
                }
            }
        }

        // ESCAPE
        if (e.keyCode === 27) {
          closeModal();
        }
    }
}

function closeModal() {
    // Hide the modal and overlay
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';

    // Set focus back to element that had it before the modal was opened
    focusedElementBeforeModal.focus();
}



/**
 * Send the review to the server
 */

const formSendReview = document.getElementById("form_send_review");
//Add hidden field restaurant_id to form
const restaurant_id = getParameterByName('id');
const field_hidden_restaurant_id = document.createElement('input');
field_hidden_restaurant_id.type = "hidden";
field_hidden_restaurant_id.name = "restaurant_id";
field_hidden_restaurant_id.value = restaurant_id;
formSendReview.appendChild(field_hidden_restaurant_id);

formSendReview.addEventListener("submit", function(event) {
    let error = [];
    event.preventDefault();
    const name = document.getElementById("name");
    const rating = document.getElementById("rating");
    const comments = document.getElementById("comments");
    const fieldsForm = [name,rating,comments];
    fieldsForm.forEach(function(field) {
        if(field.name == "name") {
            if(field.value.trim() == "") {
                error.push("It is mandatory to insert the NAME!");
                field.style.borderColor = "#f00";
            } else {
                field.style.borderColor = "#ccc";
            }
        }
        if(field.name == "rating") {
            if(field.value.trim() == "") {
                error.push("The EVALUATION is mandatory!");
                field.style.borderColor = "#f00";
            } else {
                field.style.borderColor = "#ccc";
            }
        }
        if(field.name == "comments") {
            if(field.value.trim() == "") {
                error.push("It is mandatory to insert the comment!");
                field.style.borderColor = "#f00";
            } else {
                field.style.borderColor = "#ccc";
            }
        }
    });
    if(error.length == 0) {
        const id = getParameterByName('id');
        const body_content = new FormData();

        body_content.append("name",name.value);
        body_content.append("rating",Number(rating.value));
        body_content.append("comments",comments.value);
        body_content.append("restaurant_id",Number(id));

        const DateReview = new Date();
        console.log(Date.parse(DateReview));

        const review_data = {
            "name" : name.value,
            "rating" : Number(rating.value),
            "comments" : comments.value,
            "restaurant_id" : Number(id),
            "createdAt" : Date.parse(DateReview),
            "updatedAt" : Date.parse(DateReview)
        };

        const review_offline_data = {
            "name" : name.value,
            "rating" : Number(rating.value),
            "comments" : comments.value,
            "restaurant_id" : Number(id)
        };

        fetch('http://localhost/server-php-mws-restaurant/server.php?add_review_restaurant_id=',
        {
            method: "POST",
            "Accept-Charset": "utf-8",
            "Content-Type": "application/x-www-form-urlencoded",
            body: body_content
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                const error = "Data not loaded";
                return error;
            }
        }).then(function(data) {
            console.log(data);
            const advise = "Review added thanks";
            DBHelper.openAdviseUser(advise,"reload");
        }).catch(function() {
            const error = "Network error";
            console.log(error);
            DBHelper.putOfflineValuesReviewDatabase(review_data,review_offline_data);
        });
    }
});

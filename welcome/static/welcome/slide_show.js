const slides_selector = ".welcome-img";
const slide_title_selector = ".slide-title";
const slide_text_selector = ".slide-text";
const next_btn_selector = "#next-slide-button";
const prev_btn_selector = "#previous-slide-button";

const inactive_class = "inactive";
const change_slide_interval = 4000;

// Timer object with reset functionality
function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }
}

// Switch image from 'counter' to 'next'
function next_image(counter, next) {
	let slides = document.querySelectorAll(slides_selector);
	slides[counter].classList.add(inactive_class);
	slides[next].classList.remove(inactive_class);
}

// Switch title from 'counter' to 'next'
function next_title(counter, next) {
	let title = document.querySelectorAll(slide_title_selector);
	title[counter].classList.add(inactive_class);
	title[next].classList.remove(inactive_class);
}

// Switch text from 'counter' to 'next'
function next_text(counter, next) {
	let text = document.querySelectorAll(slide_text_selector);
	text[counter].classList.add(inactive_class);
	text[next].classList.remove(inactive_class);
}

// Switch slide from 'counter' to 'next' out of 'total'
function change_slide(counter, next, total) {
	next_image(counter, next);
	next_title(counter, next);
	next_text(counter, next);
	counter = (next) % total;
	
	return counter;
}

// Swap to next slide out of 'total', reset timer
function next_slide(counter, total, timer) {
	let next = (counter + 1) % total;
	counter = change_slide(counter, next, total);
	timer.reset(change_slide_interval);
	
	return counter;
}

// Swap to previous slide out of 'total', reset timer
function prev_slide(counter, total, timer) {
	let next = (counter - 1) % total;
	if(next<0) next = total-1;
	counter = change_slide(counter, next, total);
	timer.reset(change_slide_interval);
	
	return counter;
}

let counter = 0;
let images = document.querySelectorAll(slides_selector);
let total = images.length;

let timer = new Timer(function() {  // A custom timer object w/ reset ability
		counter = next_slide(counter, total, timer);
	}, change_slide_interval)

let show_next_btn = document.querySelector(next_btn_selector);
let show_previous_btn = document.querySelector(prev_btn_selector);

show_next_btn.addEventListener("click", function(){
		counter = next_slide(counter, total, timer);
});
show_previous_btn.addEventListener("click", function(){
		counter = prev_slide(counter, total, timer);
});



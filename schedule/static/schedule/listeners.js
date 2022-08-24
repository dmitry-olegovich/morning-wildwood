
function rescale_main_lines() {
	// If view area is rescaled, we want to rescale horizontal time lines
	extend_hr_lines(content_area);
}

function show_details(working_elem){
	// On click show event details in a new overlapping centered div
	show_fade_away();
	let elem = document.querySelector('#details-area');
	elem.querySelector('.details-subject').innerHTML = working_elem.getAttribute("data-subject");
	elem.querySelector('.details-time').innerHTML = working_elem.querySelector('.schedule-column-item-time').innerHTML;
	elem.querySelector('.details-room').innerHTML = working_elem.getAttribute("data-room");
	elem.querySelector('.details-level').innerHTML = working_elem.getAttribute("data-level");
	elem.querySelector('.details-duration').innerHTML = working_elem.getAttribute("data-duration");
	elem.querySelector('.details-teacher').innerHTML = working_elem.getAttribute("data-teacher");
	
	elem.style.display = 'block';
	elem.style.position = 'fixed';
}

function hide_details() {
	// Once details are displayed, clicks outside of box (or on 'x') hides details
	let elem = document.querySelector('#details-area');
	elem.style.display = 'none';
	hide_fade_away();
}

function show_fade_away(){
	// Display overlay semi-transperent background
	let elem = document.querySelector('#fade-away');
	
	elem.style.display = 'block';
	elem.style.position = 'fixed';
}

function hide_fade_away() {
	// Hide overlay semi-transperent background
	let elem = document.querySelector('#fade-away');
	elem.style.display = 'none';
}


function run_click(event) {
	let target = event.target;
	if ((target.classList.contains("details-close-button")) || (target.id == "fade-away")) {
		hide_details();
		return;
	}
	
	let parent = target.closest(schedule_item_selector);
	if (!parent) return;
	
	show_details(parent);
}

window.addEventListener("resize", rescale_main_lines);
document.addEventListener("click", run_click);

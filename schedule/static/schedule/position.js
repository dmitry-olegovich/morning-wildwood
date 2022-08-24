/*
	JS to correctly position all shedule classes div elements in columns.
	Expects schedule classes div elements to be outputed by server ordered by starting 
	time and (reverse) duration for some specific cases of inetersecting classes.
	Expects attributes and css selectors under const declarations to be present in div elements.
	
	Examples:
		Scheduled class element:
			<div class="col schedule-column">  // parent element - column
				<div class="schedule-column-item bg_color_2 col" data-time="1600" data-duration="60">
					. . . internal structure . . .
				</div>
			</div>
		
		Hour element in timetable column:
			<div class="schedule-timetable-item" data-time="1200" data-duration="60">12:00</div>
*/

const time_attrib = "data-time";  // Classes divs have starting time 'data-time' attribute.
const duration_attrib = "data-duration";   // Classes divs have starting time 'data-duration' attribute.
const timetable_item_selector = '.schedule-timetable-item';  // This is the css selector for hour divs in timetable column.
const schedule_item_selector = '.schedule-column-item';  // This is the css selector for classes divs
const column_header_selector = ".schedule-column-header";  // This is the css selector for column headers divs
const content_area = "#main-area";  // this is the main area, where scheduled classes divs get outputed
const timetable_header_area = "#header-area";  // this is the selector of the timetable header row. We'll use it to calculate actual vertical offset
const hour_line_selector = '.hr-timetable';  // this selector is used for horizontal lines that mark hour bounderies on the time table

const teacher_attrib = "data-teacher";		// used to make elem id	
const room_attrib = "data-room";          	// used to make elem id	
const column_day_selector = ".schedule-column";  // used to select columns for separate days
	
function scale_verticaly(elem, hour_height) {
/*	
	This is used to correclty verticaly scale hour divs in timetable column.
*/ 
	height = ((elem.getAttribute(duration_attrib)) / 60) * hour_height;
	elem.style.height = height + 'px';
}

function position_verticaly(elem, hour_height, start_hour, margin) {
/*	
	Classes divs have starting time 'data-time' and 'data-duration' attributes.
	This is used to correclty vertically position and scale class div element.
	As a side effect of absolute positioning, setting horizontal positioning ('left')
	is also required.
*/ 
	let time = elem.getAttribute(time_attrib);
	let hour = time.substring(0, 2);
	let minutes = time.substring(2);
	let total = (60 * (parseInt(hour) - start_hour) + parseInt(minutes)) / 60;  // page is supposed to be cut from start hour 
	let v_pos = total * hour_height + margin;
	elem.style.position = 'absolute';
	elem.style.top = v_pos + 'px';
	
	scale_verticaly(elem, hour_height);
	elem.style.left = '0%';
	elem.style.width = '100%';
	
	return;
}

function get_start_time_in_min(elem) {
/*	
	Classes divs have starting time 'data-time' attributes.
	This is used to return starting time in minutes passed from 00:00 AM for a
	specific class div element.
*/ 

	let start_time = parseInt(elem.getAttribute(time_attrib).substring(0, 2)) * 60 + parseInt(elem.getAttribute(time_attrib).substring(2));
	
	return start_time;
}

function get_finish_time_in_min(elem) {
/*	
	Classes divs have starting time 'data-time' and 'data-duration' attributes.
	This is used to return finishing time in minutes passed from 00:00 AM for a
	specific class div element.
*/ 
	return get_start_time_in_min(elem) + parseInt(elem.getAttribute(duration_attrib));
}

function cut_excess_empty(min_time_elem, max_time_elem) {
/*	
	Removes timetable items, for hours, that are not needed on currently displayed 
	week, as there are no classes during those hours.
	Returns the starting hour, which is used to correctly position classes' divs.
*/ 	
	min_time = get_start_time_in_min(min_time_elem) - 60;
	max_time = get_finish_time_in_min(max_time_elem);
	
	let times = document.querySelectorAll(timetable_item_selector);
	for (let i = times.length - 1; i >= 0 ; i--){
		if (get_start_time_in_min(times[i]) < min_time){
			times[i].remove();			
		}		
		if (get_start_time_in_min(times[i]) > max_time){
			times[i].remove();
		}	
	}
	
	times = document.querySelector(timetable_item_selector);
	result = parseInt(times.getAttribute(time_attrib).substring(0, 2));
	
	return result;
}

function is_min_time(current_min_elem, elem) {
/*	
	Check if this element's class event will start earlier than the 'current_min_elem'.
*/ 
	if (get_start_time_in_min(elem) < get_start_time_in_min(current_min_elem)) {
		return elem;
	}
	else {
		return current_min_elem;
	}
}

function is_max_time(current_max_elem, elem) {
/*	
	Check if this element's class event will finish later than the 'current_max_elem'.
*/ 
	current_max = get_start_time_in_min(current_max_elem) + parseInt(current_max_elem.getAttribute(duration_attrib));
	current = get_start_time_in_min(elem) + parseInt(elem.getAttribute(duration_attrib));
	
	if (current > current_max) {
		return elem;
	}
	else {
		return current_max_elem;
	}
}

function process_hours_column(min, max, height) {
	// remove unused hours from timetable column 
	let starting = cut_excess_empty(min, max);
	
	// scale vertically 
	let time_items = document.querySelectorAll(timetable_item_selector);
	for (i = 0; i < time_items.length; i++) {
		scale_verticaly(time_items[i], height);
	}
	
	return starting;
}

function position_horizontally(elems) {
/*
	Positions and scales horizontally schedule classes div elements in 'elems' array.
*/	
	// create a sorted list of number of overlaps, note that object keys are strings, and Array.sort works with strings by default
	let index = Object.keys(elems).map(Number).sort((a, b) => a - b); 
	
	let processed = [];
	
	for (let l = index.length; l > 0; l--) {
		let key = index[l-1];
		//if (!intersections.hasOwnProperty(key)) continue;  // forgot why this is needed
		
		for (let i = 0; i < elems[key].length; i++){
			// do not touch those, that were already processed
			let exclude = Array.from(elems[key][i]).filter(x => processed.includes(x));
			let total_width = 100;
			for (let k = 0; k < exclude.length; k++) {
				total_width -= parseInt(exclude[k].style.width);
			}
			let elements = Array.from(elems[key][i]).filter(x => !exclude.includes(x));
			N = elements.length;
			let width = total_width/N;
			let left_margin = 100 - total_width;
			
			
			for (let j = 0; j < N; j++){
				elements[j].style.width = width + '%';
				let position = left_margin + width * j;
				elements[j].style.left = position + '%';
				processed.push(elements[j]);
			}
		}
	}
	//console.log("column done");   // DEBUG just so I can place a convinient breakpoint here 
}

function extend_hr_lines(selector) {
/*
	Re-scales all hr's to 'selector' width
*/
	let extend_window = document.querySelector(selector);
	let width = extend_window.offsetWidth;
	let lines = extend_window.querySelectorAll(hour_line_selector);
	for (let k = 0; k < lines.length; k++){
		lines[k].style.width = width + 'px';
	}
}

function color_hr(elem) {
	let color = window.getComputedStyle(elem).getPropertyValue('border-bottom-color');
	let border = "1px solid ";
	//border += color;
	border += "lightgray";
	elem.querySelector(".schedule-column-item-subject").style.borderTop = border;
}

function color_hr_hover(elem){
	let border = "1px solid white";
	elem.querySelector(".schedule-column-item-subject").style.borderTop = border;
}

///////////////////////////////////////////////////////////////////////////////


let hour_height = document.querySelector(schedule_item_selector).offsetHeight;

schedule_items = document.querySelectorAll(schedule_item_selector);
min = schedule_items[0];
max = schedule_items[0];

// find first starting time and last finishing time for outputed scheduled classes
for (let i = 0; i < schedule_items.length; i++) {
	min = is_min_time(min, schedule_items[i]);
	max = is_max_time(max, schedule_items[i]);
}

// leave for output only the usefull hours in timetable column
starting_hour = process_hours_column(min, max, hour_height); 

// find offset of hour lines
let time_text_height = document.querySelector(hour_line_selector).offsetTop - document.querySelector(timetable_header_area).offsetTop - document.querySelector(timetable_header_area).offsetHeight;

// position classes div elems acording to starting hour and duration
for (let i = 0; i < schedule_items.length; i++) {
	position_verticaly(schedule_items[i], hour_height, starting_hour, time_text_height);  
}

// correct positioning requires intersections of classes by time in a single day (column)
let intersections = [];
let columns = document.querySelectorAll(column_day_selector);

for (const col of columns){
	let schedule_items = col.querySelectorAll(schedule_item_selector);
	intersections.push(find_overlaps(schedule_items))
}

// position and scale classes div elems horizontaly  for each day acording to intersections
for (let column of intersections){
		position_horizontally(column);
}

//draw horizontal 'hour' lines
extend_hr_lines(content_area);


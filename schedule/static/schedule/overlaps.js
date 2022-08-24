// на вход поступают elements -- неупорядоченный массив элементов для нахождения пересечений по времени
// функции из общего модуля, которые могут помочь
//	get_start_time_in_min
//	get_finish_time_in_min
//	is_intersection(x1, x2, y1, y2)

// TODO
// + 1) просто переведи Python скрипт на модельной структуре сегментов в JS
// + 2) переведи с модельных сегментов в термины DOM элементов, с которыми работает боевой скрипт position.js
// + 3) проверь, что надо скрипту postion.js -- в каком виде представить результат 
//			в виде объекта {<к-во пересекаемых елементов 1>: [<Set пересекаемых елементов к-вом, как в ключе>, ...], ...}
// + 4) переделай вид результата, или последующую логику обработки в position.js, чтобы можно было вставить функцию
//-> 5) привести к финальному виду (может от самодельного id перейти к DOM id?), подготовить к заливке на static хранилише для боевого сервера

// Helpers for dealing with actual data structure in use in public -- not part of algorithm
// *********************************************************************************************************************************************************************************
//const time_attrib = "data-time";  // Classes divs have starting time 'data-time' attribute.
//const duration_attrib = "data-duration";   // Classes divs have starting time 'data-duration' attribute.
//const timetable_item_selector = '.schedule-timetable-item';  // This is the css selector for hour divs in timetable column.
//const schedule_item_selector = '.schedule-column-item';  // This is the css selector for classes divs
//const column_header_selector = ".schedule-column-header";  // This is the css selector for column headers divs
//const content_area = "#main-area";  // this is the main area, where scheduled classes divs get outputed

//const teacher_attrib = "data-teacher";			//  ########### NOT IN ORIGINAL POSITION.JS #############
//const room_attrib = "data-room";          	//  ########### NOT IN ORIGINAL POSITION.JS #############
//const column_day_selector = ".schedule-column";          	//  ########### NOT IN ORIGINAL POSITION.JS #############


function array_contains_set(arr, set){
	let result = false;
	
	for(const elem of arr){
		if(elem.size != set.size){
			continue;
		}
		
		result = true;
		
		for(let item of elem){
			if(!set.has(item)){
				result = false;
				break;
			}
		}
	}
	
	return result;
}

function filter_non_longest(arr){
	let longest = new Set();
	for (const elem of arr){
		if (elem.size > longest.size){
			longest = new Set(elem);
		}
	}
	
	return longest;
}

function get_element_id(elem){             	//  ########### NOT IN ORIGINAL POSITION.JS #############
/*
	Classes divs don't have unique id's, but there is a need for them in the algorithm
	as objects can't act as object's keys in JS contrary to Python (if said object is hashable)
*/	
	let id = elem.getAttribute(teacher_attrib) + '/' + elem.getAttribute(time_attrib) + '/' + elem.getAttribute(room_attrib);
	
	return id;
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

// *********************************************************************************************************************************************************************************

function save_current_overlaps(snapshot_set, total_dict) {
	//console.log("Saving current");  // DEBUG
	
	for (let elem of snapshot_set){
		
		let id = get_element_id(elem);
		
		//console.log("Updating overlaps on id");  // DEBUG
		
		if (!(id in total_dict)){
			total_dict[id] = [];
		}
		if (!(total_dict[id].includes(snapshot_set))){
			total_dict[id].push(new Set(snapshot_set));
		}
	}
	
	//console.log("saveing_current_completed"); // DEBUG
}

function set_difference(set_a, set_b) {
	// update set by removing values in some_array
	for (let elem of set_b) {
		set_a.delete(elem);
	}
}

function set_addition(set_a, set_b) {
	// update set by adding values in some_array
	for (let elem of set_b) {
		set_a.add(elem);
	}
}

function find_overlaps(segments){
	
	let S = {};  // starts
	let E = {};  // ends
	
	// populating starts and ends dict with 
	// {start/end value: Set(elements which start/end on this start/end value)}
	for (const element of segments) {
		let start = get_start_time_in_min(element);
		let end = get_finish_time_in_min(element);
		
		if (!(start in S)) {
			S[start] = new Set();
		}
		if (!(end in E)) {
			E[end] = new Set();
		}
		S[start].add(element);
		E[end].add(element);
	}
	
	// sorted starts and ends
	let sorted_starts = Object.keys(S).map(Number);
	sorted_starts.sort((a, b) => a - b);
	let sorted_ends = Object.keys(E).map(Number);
	sorted_ends.sort((a, b) => a - b);
	
	let last_end = -1; // starts and ends are positive numbers
	let current_overlaps = new Set();
	let overlaps = {};  // this is meant to be dict of arrays
						// element's id as key: array of sets with overlapping segments
						
	////console.log("Use debugger here to check for input parsing!");  // DEBUG
	
	// check if there are ends before this x (and after previous end)
    // save current progress to overlaps and delete ended segments from current
	for (let i = 0; i < sorted_starts.length; i++) {
		let x = sorted_starts[i];
		for(let j = 0; j < sorted_ends.length; j++) {
			let y = sorted_ends[j]
			
			//console.log("x, y = " + x + ", " + y);  // DEBUG
			
			if (y > x) {
				break;  //no need to continue if we are over current 'start'
			}
			if (y > last_end) {
				save_current_overlaps(current_overlaps, overlaps);
				set_difference(current_overlaps, E[y]);  
				last_end = y;
			}
		}	
		// current will change on next start key, so we need to save current progress
        // if there was a step in 'x' from 'last_end'
		if (x > last_end && current_overlaps.size > 0 ) {
			save_current_overlaps(current_overlaps, overlaps);
		}
		
		set_addition(current_overlaps, S[x]);
	}
	
	// when all starts are over only need to account for left ends
	for (const y of sorted_ends) {
		if (y > last_end){
			save_current_overlaps(current_overlaps, overlaps);
			set_difference(current_overlaps, E[y]);
			last_end = y;
		}
	}
	
	// used to return all overlaps, but it seems we only need to know the longest set for each element for now
	// so let's filter out what we don't need
	let longests = [];
	
	for (const key in overlaps){
		longests.push(filter_non_longest(overlaps[key]));
	}
	
	let results = {};
	
	// prepering output as expected by position.js functions
	for (const set of longests){
		//console.log("Experimenting");
		if(set.size > 1){  // the older scaling/positioning algorithm used in position.js doesn't need to process non-overlapping elements
			if(results.hasOwnProperty(set.size)){
				if (!array_contains_set(results[set.size], set)){
					results[set.size].push(set);
				}
			}
			else{
				results[set.size] = [set];
			}
		}
	}
	
	return results;  
}

//////////////////////////////////
//         TEST CODE

/*let columns = document.querySelectorAll(column_day_selector);  // get all elements of actual data as used in production

for (const col of columns){
	let schedule_items = col.querySelectorAll(schedule_item_selector);
	result = find_overlaps(schedule_items);
	//console.log("column done!");
}
*/

/*
	Fills in the values for filters that can be applied to week's schedule.
*/

const op_selector = 'option';
const fil_selector = '#filter-details select';

function select_init(sel_elem) {
	let target = sel_elem.getAttribute("selected");
	if(target != '') {
		let options = sel_elem.querySelectorAll(op_selector);
		for(let i = 0; i < options.length; i++){
			if(options[i].innerHTML == target) {
				options[i].setAttribute("selected", '');
			}
		}
	}
	
	return;
}

let filters = document.querySelectorAll(fil_selector);
for(let j=0; j<filters.length; j++) {
	select_init(filters[j]);
}
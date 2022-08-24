const overlay_selector = '.overlay';
const target_selector = '.item-container';

function hide_overlay() {
	let elem = event.target.querySelector(overlay_selector);
	elem.style.opacity = 0;
}

function show_overlay() {
	let elem = event.target.querySelector(overlay_selector);
	elem.style.opacity = 0.42;
}


let targets = document.querySelectorAll(target_selector);
for(let i=0; i < targets.length; i++) {
	let target = targets[i];
	target.addEventListener('mouseenter', hide_overlay);
	target.addEventListener('mouseleave', show_overlay);
}


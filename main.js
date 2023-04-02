/* Conway's game of life */

/*
 * Author: Ernest Wambua
 * Date: 02/04/2023
 */

/*
 * RULES OF LIFE
 *  Any live cell with 0 or 1 live neighbors becomes dead, because of underpopulation
 *  Any live cell with 2 or 3 live neighbors stays alive, because its neighborhood is just right
 *  Any live cell with more than 3 live neighbors becomes dead, because of overpopulation
 *  Any dead cell with exactly 3 live neighbors becomes alive, by reproduction
 */

// a single node stores a single game state
class Node {
	constructor(data) {
		this.prev = null;
		this.next = null;
		this.data = data;
	}
}

// the linked list is used in debug mode
// use a doubly linked list to store the game state
class LinkedList {
	constructor() {
		this.head = null;
	}

	push(data) {
		if (!this.head) {
			const newNode = new Node(data);
			this.head = newNode;
		} else {
			const newNode = new Node(data);
			this.head.prev = newNode;
			newNode.next = this.head;
			this.head = newNode;
		}
	}

	show() {
		const data = [];
		let current = this.head;
		while (current) {
			data.push(current.data);
			current = current.next;
		}
		console.log(data);
	}
}

const board = document.getElementById('board');

const CELL_SIZE = 20; // pixels
const ROWS = 30; //30;
const COLS = 60; //60;
const RAND_THRESHOLD = 0.6;
let debug = false;
let paused = true;

const gameState = new LinkedList();
gameState.push([]);

let currentState = gameState.head;

// generate random cell state 1 = alive, 0 = dead
function setRandomCellState() {
	return Math.random() >= RAND_THRESHOLD ? 1 : 0;
}

function generateRandomState() {
	const randomState = [];
	for (let i = 0; i < ROWS; i++) {
		const rows = [];
		for (let j = 0; j < COLS; j++) {
			rows.push(setRandomCellState());
		}
		randomState.push(rows);
	}
	return randomState;
}

// generate random game state
function generateStartState(startState) {
	if (!startState) {
		gameState.head.data = generateRandomState();
	} else {
		gameState.head.data = startState;
	}
}

function life(initialState) {
	const prevState = initialState.data;
	const nextStateData = JSON.parse(JSON.stringify(prevState)); // deep copy the previous state

	// iterate over rows
	for (let i = 0; i < prevState.length; i++) {
		// iterate over columns
		for (let j = 0; j < prevState[i].length; j++) {
			let neighbors = 0;

			if (i !== 0 && j !== 0) neighbors += prevState[i - 1][j - 1]; // top-left
			if (i !== 0) neighbors += prevState[i - 1][j]; // top
			if (i !== 0 && j !== prevState[i] - 1)
				neighbors += prevState[i - 1][j + 1]; // top-right

			if (j !== 0) neighbors += prevState[i][j - 1]; // left
			if (j !== prevState[i] - 1) neighbors += prevState[i][j + 1]; // right

			if (i !== prevState.length - 1 && j !== 0)
				neighbors += prevState[i + 1][j - 1]; // bottom-left
			if (i !== prevState.length - 1) neighbors += prevState[i + 1][j]; // bottom
			if (i !== prevState.length - 1 && j !== prevState[i] - 1)
				neighbors += prevState[i + 1][j + 1]; // bottom-right

			// check conditions for life
			if (prevState[i][j] && neighbors <= 1) nextStateData[i][j] = 0; // underpopulation
			if (!prevState[i][j] && neighbors === 3) nextStateData[i][j] = 1; // reproduction
			if (prevState[i][j] && neighbors > 3) nextStateData[i][j] = 0; // overpopulation
		}
	}

	// only save the game state when in debug mode
	if (debug) {
		// check whether current state is at the head before pushing
		if (!currentState.prev) {
			gameState.push(nextStateData);
			currentState = gameState.head;
		} else {
			currentState = currentState.prev;
		}
	} else {
		currentState = new Node(nextStateData);
	}
}

function renderWorld(state) {
	board.innerHTML = null; // clear the board content
	const rows = state.data;
	for (let i = 0; i < rows.length; i++) {
		const cols = state.data[i];
		for (let j = 0; j < cols.length; j++) {
			const cell = document.createElement('div');
			const cellState = state.data[i][j];
			cell.setAttribute('class', `cell ${cellState ? 'alive' : 'dead'}`);
			cell.style.left = `${j * CELL_SIZE}px`;
			cell.style.top = `${i * CELL_SIZE}px`;
			cell.style.height = CELL_SIZE + 'px';
			cell.style.width = CELL_SIZE + 'px';
			board.appendChild(cell);
		}
	}
}

window.addEventListener('keydown', (e) => {
	switch (e.code) {
		case 'Space':
			if (!debug) paused = !paused;
			break;
		case 'D':
		case 'd':
			debug = !debug;
			break;
		case 'ArrowRight':
			if (debug) {
				life(currentState);
				renderWorld(currentState);
			}
			break;
		case 'ArrowLeft':
			if (debug && currentState.next) {
				currentState = currentState.next;
				renderWorld(currentState);
			} else {
				renderWorld(currentState);
			}
			break;
	}
});

if (debug) {
	fetch('./ggg.json')
		.then((res) => res.json())
		.then((data) => {
			generateStartState(data);
			renderWorld(currentState);
		});
} else {
	fetch('./ggg.json')
		.then((res) => res.json())
		.then((data) => {
			generateStartState(data);
			renderWorld(currentState);

			setInterval(() => {
				if (!paused) {
					life(currentState);
					renderWorld(currentState);
				}
			}, 100);
		});
}

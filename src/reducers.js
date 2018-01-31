import seedrandom from 'seedrandom';

const initialTile = {
    revealed: false,
    flagged: false,
    value: 0
}

const initialState = {
    mines: 15,
    minesLeft: 15,
    phase: 'init',
    timeSpent: 0,
    grid: Array(10).fill(Array(10).fill(initialTile)),
};

const tileStore = (state = initialTile, action) => {
    switch (action.type) {
        case 'TILE_CLICK':
            return { ...state, revealed: true };
        case 'TILE_FLAG':
            return { ...state, flagged: !state.flagged };
        case 'GENERATE_MINE':
            return { ...state, value: 'mine' };
        case 'WON':
            return {
                ...state,
                flagged: state.value === 'mine',
            };
        case 'LOSS':
        case 'LOSS-REASON':
            if (state.value === 'mine' || state.flagged) {
                return {
                    ...state,
                    revealed: true,
                    value: action.type === 'LOSS-REASON' ? 'mine-red' : state.value,
                };
            }
            else {
                return state;
            }
        default:
            return state;
    }
}

const rowStore = (state = [], action) => {
    switch (action.type) {
        case 'TILE_CLICK':
        case 'TILE_FLAG':
        case 'GENERATE_MINE':
        case 'LOSS-REASON':
            return state.map((tile, x) => tileStore(tile, x === action.x ? action : {}));
        default:
            return state.map(tile => tileStore(tile, action));
    }
}

const eachAdjacent = (grid, x, y, callback) => {
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx || dy) {
                if (y+dy >= 0 && y+dy < grid.length &&
                    x+dx >= 0 && x+dx < grid[y+dy].length) {
                        let tile = grid[y+dy][x+dx];
                        callback(tile, x+dx, y+dy);
                }
            }
        }
    }

    return grid;
};

const eachTile = (grid, callback) => {
    for (let y = 0; y < grid.length; ++y) {
        for (let x = 0; x < grid[y].length; x++) {
            let tile = grid[y][x];
            callback(tile, x, y);
        }
    }
};

const scoreTiles = (state = { }) => {
    let grid = state.grid;

    return {
        ...state,
        grid: grid.map((row, y) => row.map((tile, x) => {
            if (tile.value === 'mine') {
                return tile;
            }
            else {
                let value = 0;
                eachAdjacent(grid, x, y, tile => tile.value === 'mine' && value++);

                return {
                    ...tile,
                    value: value,
                };
            }
        })),
    };
}

const generateMines = (state = { }, action, minesLeft) => {
    let grid = state.grid;

    if (minesLeft === 0) {
        return scoreTiles(state);
    }

    let mine_y;
    let mine_x;

    var rng = seedrandom(action.time.getTime())

    while (1) {
        mine_y = Math.floor(rng() * grid.length);
        mine_x = Math.floor(rng() * grid[mine_y].length);

        let tile = rowStore(grid[mine_y], {})[mine_x];

        if (tile.value !== 'mine' && (mine_y !== action.y || mine_x !== action.x)) {
            break;
        }
    }

    let newGrid = grid.map((row, y) => rowStore(grid[y], y === mine_y ? { type: 'GENERATE_MINE', x: mine_x, y: mine_y } : {}));
    return generateMines({ ...state, grid: newGrid }, action, minesLeft - 1);
}

const rootStore = (state = initialState, action) => {
    switch (action.type) {
        case 'TICK':
            return {
                ...state,
                timeSpent: (state.timeSpent + (state.phase === 'play' ? 1 : 0)),
            };

        case 'TILE_FLAG': {
            if (state.phase !== 'init' && state.phase !== 'play') {
                return state;
            }

            let grid = state.grid;
            let tile = grid[action.y][action.x];
            if (tile.revealed) {
                return state;
            }

            grid = grid.map((row, y) => rowStore(row, y === action.y ? action : {}));
            let flags = 0;
            eachTile(grid, tile => tile.flagged && flags++);

            return {
                ...state,
                grid: grid,
                minesLeft: state.mines - flags,
            };
        }

        case 'TILE_CLICK': {
            let grid = state.grid;

            if (state.phase === 'init') {
                grid = generateMines(state, action, state.mines).grid;
            }
            else if (state.phase !== 'play') {
                return state;
            }

            let phase = 'play';
            let tile = grid[action.y][action.x];

            if (tile.revealed || tile.flagged) {
                // nothing to do
            }
            else if (tile.value === 'mine') {
                phase = 'loss';
                grid = grid.map(row => rowStore(row, { ...action, type: 'LOSS' }));
                grid = grid.map((row, y) => rowStore(row, y === action.y ? { ...action, type: 'LOSS-REASON' } : {}));
            }
            else {
                grid = grid.map((row, y) => rowStore(row, y === action.y ? action : {}));
                if (tile.value === 0) {
                    eachAdjacent(grid, action.x, action.y, (tile, x, y) => {
                        if (!tile.revealed) {
                            grid = rootStore({...state, grid, phase}, {...action, x, y}).grid
                        }
                    });
                }

                let unrevealed = 0;
                eachTile(grid, tile => !tile.revealed && unrevealed++);
                if (unrevealed === state.mines) {
                    phase = 'won';
                    grid = grid.map(row => rowStore(row, { type: 'WON' }));
                    return {
                        ...state,
                        grid: grid,
                        phase: phase,
                        minesLeft: 0
                    }
                }
            }

            return {
                ...state,
                grid: grid,
                phase: phase
            };
        }

        case 'RESTART':
            return initialState;

        default:
            return state;
    }
}

export default rootStore;

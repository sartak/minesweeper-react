import React, { Component } from 'react';
import './App.css';

class Tile extends Component {
    click = (e) => {
        if (e.type === 'click') {
            this.props.onClick(this.props.tile);
        }
        else {
            e.preventDefault();
            this.props.onRightClick(this.props.tile);
        }
    }

    render() {
        var tile = this.props.tile;
        var className = "tile-new";

        if (tile.flagged) {
            if (tile.revealed && tile.value !== 'mine') {
                className = "tile-mine-x";
            }
            else {
                className = "tile-flag";
            }
        }
        else if (tile.revealed) {
            className = "tile-" + tile.value;
        }

        return <span onClick={this.click} onContextMenu={this.click} className={"tile " + className} />;
    }
}

class Board extends Component {
    constructor(props) {
        super(props);

        var grid = [];
        for (var x = 0; x < this.props.cols; ++x) {
            var col = [];
            for (var y = 0; y < this.props.rows; ++y) {
                col.push({
                    x: x,
                    y: y,
                    value: 0,
                    revealed: false,
                    flagged: false
                });
            }
            grid.push(col);
        }

        this.state = { phase: props.phase, grid: grid, revealedAny: false };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            phase: nextProps.phase
        });
    }

    tileAt(state, x, y) {
        if (x < 0 || y < 0 || x >= this.props.cols || y >= this.props.rows) {
            return null;
        }
        return state.grid[x][y];
    }

    eachTile(state, callback) {
        for (var x = 0; x < this.props.cols; ++x) {
            for (var y = 0; y < this.props.rows; ++y) {
                callback(this.tileAt(state, x, y));
            }
        }
    }

    eachNeighbor(state, tile, callback) {
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx || dy) {
                    var neighbor = this.tileAt(state, dx + tile.x, dy + tile.y);
                    if (neighbor) {
                        callback(neighbor);
                    }
                }
            }
        }
    }

    generateBombs(state, exceptTile) {
        for (var i = 0; i < this.props.mines; ++i) {
            var x = Math.floor(Math.random() * this.props.cols);
            var y = Math.floor(Math.random() * this.props.rows);
            var tile = this.tileAt(state, x, y);
            if (tile.value || (x === exceptTile.x && y === exceptTile.y)) {
                i--;
                continue;
            }

            tile.value = 'mine';
        }

        this.eachTile(state, tile => {
            if (!tile.value) {
                var mines = 0;
                this.eachNeighbor(state, tile, neighbor => {
                    if (neighbor.value === 'mine') {
                        mines++;
                    }
                });

                tile.value = mines;
            }
        });

        return state;
    }

    revealTile(state, tile) {
        if (state.phase === 'won' || state.phase === 'loss') {
            return state;
        }

        if (tile.revealed || tile.flagged) {
            return state;
        }

        tile.revealed = true;

        if (!state.revealedAny) {
            state.revealedAny = true;
            state = this.generateBombs(state, tile);
            this.enterPhase('play');
        }

        if (tile.value === 0) {
            this.eachNeighbor(state, tile, neighbor => {
                state = this.revealTile(state, neighbor);
            });
        }

        if (tile.value === 'mine') {
            tile.value = 'mine-red';
            this.eachTile(state, tile => {
                if (tile.value === 'mine' || tile.flagged) {
                    tile.revealed = true;
                }
            });
            this.enterPhase('loss');
        }

        var unrevealed = 0;
        this.eachTile(state, tile => {
            if (!tile.revealed) {
                unrevealed++;
            }
        });
        if (unrevealed == this.props.mines) {
            this.enterPhase('won');
        }


        return { phase: this.props.phase, grid: state.grid, revealedAny: state.revealedAny };
    }

    flagTile(state, tile) {
        if (state.phase === 'won' || state.phase === 'loss') {
            return state;
        }

        if (tile.revealed) {
            return state;
        }

        tile.flagged = !tile.flagged;

        var minesLeft = this.props.mines;
        this.eachTile(state, tile => {
            if (tile.flagged) {
                minesLeft--;
            }
        });
        this.props.onFlag(minesLeft);

        return { grid: state.grid };
    }

    enterPhase(phase) {
        this.props.changedPhase(phase);
    }

    clickedTile = tile => {
        this.setState(prev => (this.revealTile(prev, tile)));
    }

    rightClickedTile = tile => {
        this.setState(prev => (this.flagTile(prev, tile)));
    }

    render () {
        return (
            <div className="board">
                {
                    this.state.grid.map(row => {
                        return (
                            <div key={row[0].x} className="row">
                                { row.map(tile => <Tile key={tile.y} tile={tile} onClick={this.clickedTile} onRightClick={this.rightClickedTile} /> ) }
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

class Digits extends Component {
    render() {
        var digits = "000" + (this.props.display || 0);
        digits = digits.substr(digits.length - 3);
        return (
            digits.split("").map(digit => <span className={"digit timer-" + digit} />)
        );
    }
}

class ModeButton extends Component {
    click = () => {
        this.props.onClick();
    }

    render() {
        return (
            <button onClick={this.click} className={"face-"+this.props.phase}></button>
        );
    }
}

class HUD extends Component {
    render() {
        return (
            <div className="HUD">
                <div className="mines-left"><Digits display={this.props.minesLeft} /></div>
                <ModeButton onClick={this.props.restart} phase={this.props.phase} />
                <div className="time-spent"><Digits display={this.props.timeSpent} /></div>
            </div>
        );
    }
}

class Minesweeper extends Component {
    constructor(props) {
        super(props);
        this.state = { phase: 'init', timeSpent: 0, gameNumber: 0, minesLeft: props.mines };
    }

    render() {
        return (
            <div className="minesweeper">
                <HUD phase={this.state.phase} minesLeft={this.state.minesLeft} timeSpent={this.state.timeSpent} restart={this.restart} />
                <Board key={this.state.gameNumber} phase={this.state.phase} mines={this.props.mines} cols={this.props.cols} rows={this.props.rows} changedPhase={this.changedPhase} onFlag={this.onFlag} />
            </div>
        );
    }

    restart = () => {
        this.setState(prev => ({ phase: 'init', timeSpent: 0, gameNumber: prev.gameNumber+1, minesLeft: this.props.mines }));
    }

    changedPhase = (phase) => {
        this.setState({phase: phase});
    }

    onFlag = (minesLeft) => {
        this.setState({minesLeft: minesLeft});
    }

    tick() {
        this.setState(prev => (
            prev.phase === 'play' ? { timeSpent: prev.timeSpent + 1 } : { }
        ));
    }

    componentDidMount() {
        this.timer = setInterval(
            () => this.tick(),
            1000,
        );
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
}

class App extends Component {
    render() {
        return (
            <div className="App">
                <Minesweeper mines="10" cols="10" rows="10" />
            </div>
        );
    }
}

export default App;

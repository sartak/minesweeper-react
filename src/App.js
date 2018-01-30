import React, { Component } from 'react';
import './App.css';

class Tile extends Component {
    click = () => {
        this.props.onClick(this.props.tile);
    }

    render() {
        return <span onClick={this.click} className="tile tile-new" />;
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
                    revealed: false
                });
            }
            grid.push(col);
        }

        this.state = { grid: grid, revealedAny: false };
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
        if (tile.revealed) {
            return state;
        }

        tile.revealed = true;

        if (!state.revealedAny) {
            state.revealedAny = true;
            state = this.generateBombs(state, tile);
            this.props.beganPlay();
        }

        return { grid: state.grid, revealedAny: state.revealedAny };
    }

    clickedTile = tile => {
        this.setState(prev => (this.revealTile(prev, tile)));
    }

    render () {
        return (
            <div className="board">
                {
                    this.state.grid.map(row => {
                        return (
                            <div key={row[0].y} className="row">
                                { row.map(tile => <Tile key={tile.x} tile={tile} onClick={this.clickedTile}  /> ) }
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
    render() {
        return (
            <button className="face-smile"></button>
        );
    }
}

class HUD extends Component {
    render() {
        return (
            <div className="HUD">
                <div className="mines-left"><Digits display={this.props.minesLeft} /></div>
                <ModeButton />
                <div className="time-spent"><Digits display={this.props.timeSpent} /></div>
            </div>
        );
    }
}

class Minesweeper extends Component {
    constructor(props) {
        super(props);
        this.state = { isPlaying: false, timeSpent: 0 };
    }

    render() {
        return (
            <div className="minesweeper">
                <HUD minesLeft={this.props.mines} timeSpent={this.state.timeSpent} />
                <Board mines={this.props.mines} cols={this.props.cols} rows={this.props.rows} beganPlay={this.beganPlay} />
            </div>
        );
    }

    beganPlay = () => {
        this.setState({isPlaying: true});
    }

    tick() {
        this.setState(prev => (
            prev.isPlaying ? { timeSpent: prev.timeSpent + 1 } : { }
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

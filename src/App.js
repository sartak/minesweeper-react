import React, { Component } from 'react';
import './App.css';

class Tile extends Component {
    render() {
        return <span className="tile tile-new" />;
    }
}

class Board extends Component {
    constructor(props) {
        super(props);

        var grid = [];
        for (var y = 0; y < this.props.rows; ++y) {
            var row = [];
            for (var x = 0; x < this.props.cols; ++x) {
                row.push({
                    x: x,
                    y: y,
                    value: 0,
                    revealed: false
                });
            }
            grid.push(row);
        }

        this.state = { grid: grid };
    }

    render () {
        return (
            <div className="board">
                {
                    this.state.grid.map(row => {
                        return (
                            <div key={row[0].y} className="row">
                                { row.map(tile => <Tile key={tile.x} tile={tile} /> ) }
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
        return (
            <span>{this.props.display}</span>
        );
    }
}

class ModeButton extends Component {
    render() {
        return (
            <button></button>
        );
    }
}

class HUD extends Component {
    render() {
        return (
            <div className="HUD">
                <Digits display={this.props.minesLeft} />
                <ModeButton />
                <Digits display={this.props.timeSpent} />
            </div>
        );
    }
}

class Minesweeper extends Component {
    render() {
        return (
            <div className="minesweeper">
                <HUD minesLeft={this.props.mines} />
                <Board mines={this.props.mines} cols={this.props.cols} rows={this.props.rows} />
            </div>
        );
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

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
                <Board mines={this.props.mines} cols={this.props.cols} rows={this.props.rows} />
            </div>
        );
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

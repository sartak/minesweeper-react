import React, { Component } from 'react';
import { connect } from 'react-redux';
import './App.css';

class Tile extends Component {
    rightClick = (e) => {
        e.preventDefault();
        this.props.rightClick();
    }

    render() {
        let className = "tile-new";
        if (this.props.flagged) {
            if (this.props.revealed && this.props.value !== 'mine') {
                className = "tile-mine-x";
            }
            else {
                className = "tile-flag";
            }
        }
        else if (this.props.revealed) {
            className = "tile-" + this.props.value;
        }

        return (
            <span onDoubleClick={this.props.doubleClick} onClick={this.props.onClick} onContextMenu={this.rightClick} className={"tile " + className} />
        );
    }
}

class Board extends Component {
    tileClick = (x, y) => () => {
        this.props.tileClick(x, y);
    }

    tileDoubleClick = (x, y) => () => {
        this.props.tileDoubleClick(x, y);
    }

    tileRightClick = (x, y) => () => {
        this.props.tileRightClick(x, y);
    }

    render() {
        return (
            <div className="Board">
                { this.props.grid.map( (row, y) => (
                    <div key={y} className="row">
                        { row.map( (tile, x) => (
                            <Tile key={x} onClick={this.tileClick(x, y)} rightClick={this.tileRightClick(x, y)} doubleClick={this.tileDoubleClick(x, y)} {...tile} />
                        ))}
                    </div>
                )) }
            </div>
        );
    }
}

const BoardState = connect(
    state => ({
        grid: state.grid
    }),
    dispatch => ({
        tileClick:      (x, y) => dispatch({ type: 'TILE_CLICK', x, y, time: new Date() }),
        tileRightClick: (x, y) => dispatch({ type: 'TILE_FLAG', x, y }),
        tileDoubleClick: (x, y) => dispatch({ type: 'TILE_DOUBLECLICK', x, y, time: new Date() }),
    })
)(Board);

class ClockyDisplay extends Component {
    render() {
        var digits = "000" + Math.max(0, this.props.value);
        digits = digits.substr(digits.length - 3);

        return (
            <div className={"clocky-display " + this.props.name}>
                {
                    digits.split("").map( (value, index) => (
                        <div className={"timer-digit timer-"+value} key={index} />
                    ))
                }
            </div>
        );
    }
}

class Smiley extends Component {
    render() {
        return (
            <div onClick={this.props.onClick} className={"face face-" + this.props.phase} />
        );
    }
}

class HUD extends Component {
    render() {
        return (
            <div className="HUD">
                <ClockyDisplay name="mines-left" value={this.props.minesLeft} />
                <Smiley phase={this.props.phase} onClick={this.props.restartGame} />
                <ClockyDisplay name="time-spent" value={this.props.timeSpent} />
            </div>
        );
    }

    componentDidMount() {
        this.timer = setInterval(() => this.props.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
}

const HUDState = connect(
    state => ({
        minesLeft: state.minesLeft,
        timeSpent: state.timeSpent,
        phase: state.phase,
    }),
    dispatch => ({
        tick: () => dispatch({ type : 'TICK' }),
        restartGame: () => dispatch({ type : 'RESTART' }),
    })
)(HUD);

class Minesweeper extends Component {
    render() {
        return (
            <div className="Minesweeper">
                <HUDState />
                <BoardState />
            </div>
        );
    }
}

class App extends Component {
    render() {
        return (
            <div className="App">
                <Minesweeper />
            </div>
        );
    }
}

export default App;

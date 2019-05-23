// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
// import * as mm from 'music-metadata';
// const fs = reqiure('fs');
// const util = require('util');
// const SM2 = require('soundmanager2');

// const Sound = require('react-sound').default;

export default class Home extends Component<Props> {

  state= {
    songs: [],
    songIndex: 0, 
    playing: Sound.status.PAUSED,
    position: 0,
    volume: 100,
    title: "title",
    artist: "artist",
    length: 0,
    prevSongIndex: 0
  }
 

  handlePause() {
    if(this.state.playing === Sound.status.PLAYING) {
      this.setState({
        playing : Sound.status.PAUSED,
        position: Sound.position
      })
      // console.log(this.state.position)
    }
      else {
        this.setState({
          playing : Sound.status.PLAYING,
        })
      }

  }

  handleStop() {
      this.setState({
        playing : Sound.status.STOPPED,
        position: 0
      })
  }

  componentDidMount() {
    this.parseMetadata()
    document.addEventListener("keydown", (e) => {
      e.preventDefault;
      if(e.keyCode == 32) {this.handlePause()}
      if(e.keyCode == 37) {this.handlePrevious()}
      if(e.keyCode == 39) {this.handleNext()}
      if(e.keyCode == 38) {
        e.preventDefault;
        this.state.volume < 100 ? this.setState({volume : this.state.volume + 5, position: Sound.position}) : this.state.volume
      }
      if(e.keyCode == 40) {this.state.volume > 0 ? this.setState({volume : this.state.volume - 5, position: Sound.position}) : this.state.volume}
    })
    console.log(Sound.position)

    const folderPath = "C:/Users/Robert/Music"

    fs.readdir(folderPath, (err, file) => {
      files.forEach(file => {
        this.state.songs.push(file)
      })
    })
  }
  
  parseMetadata() {
      mm.parseFile(this.state.songs[this.state.songIndex], {native: true})
      .then( metadata => {
        // console.log(util.inspect(metadata, { showHidden: false, depth: null, }));
        // console.log(this.state.songs[this.state.songIndex])
        // console.log(this.state.songIndex)

        this.setState({
          title: metadata.common.title,
          artist: metadata.common.artist,
          length: Math.floor(metadata.format.duration),
          position: 0
        })
      })
      .catch( err => {
        console.error(err.message);
      });
    }

  handleVolume(e) {
    e.preventDefault;
    this.setState({
      volume: e.target.value,
      position: Sound.position
    })
  }

  handleNext() {
      if(this.state.songIndex < this.state.songs.length - 1) {
        this.setState({songIndex: this.state.songIndex + 1})
      } else if (this.state.songIndex == this.state.songs.length - 1) {
        this.setState({songIndex: 0})
      }
  }

  handlePrevious() {
    if(this.state.songIndex > 0) {
      this.setState({songIndex: this.state.songIndex - 1})
    }
    // console.log(this.state.songIndex)
  }

  updatePosition() {
    setTimeout(() => {
      this.setState({position: Sound.position / 1000})
      console.log(this.state.position)
    }, 1000);
  }

  scrollSong(e) {
    e.preventDefault
    // console.log(SM2.position)
    this.setState({
      position: e.target.value
    })
    // console.log(this.state.position)
  }

  nextSong() {

  }


  render() {
    return (
      <div className={styles.container} data-tid="container">
          <div className="btnGroup">
            <button type="button" onClick={this.handlePrevious.bind(this)}> Previous </button>          {/* PREV */}
            <button type="button" onClick={this.handlePause.bind(this)}> Play  </button>                {/* PLAY */}
            <button type="button" onClick={this.handleStop.bind(this)}> Stop </button>                  {/* STOP */}
            <button type="button" onClick={this.handleNext.bind(this)}> Next </button>                  {/* NEXT */}
          </div>

          <input type="range" min="0" max="100" value={this.state.volume} onChange={this.handleVolume.bind(this)}></input>
          <div className="infoGroup">
            <p>{this.state.title}</p>
            <p>{this.state.artist}</p>
            <p>Song  Index: {this.state.songIndex}</p>
            <p>Current position:  {Math.floor(this.state.position / 60)}:{this.state.position % 60 < 10 ? "0" + this.state.position % 60 : this.state.position % 60}</p>
            <p>Length: {Math.floor(this.state.length / 60)}:{this.state.length % 60}</p>
          </div>
          <input className="scroller" type="range" min="0" max={this.state.length} defaultValue={this.state.position} onChange={this.scrollSong.bind(this)} />

          <Sound
            url={this.state.songs[this.state.songIndex]}
            playStatus={this.state.playing}
            playFromPosition={this.state.position * 1000}  /* ms */
            volume={this.state.volume}
            onLoading={this.parseMetadata.bind(this)}
            // onPlaying={this.updatePosition.bind(this)}  
            // playbackRate={0.1}
          />
      </div>
    );
  }
}

// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
// const util = require('util');
import path from 'path'
import ReactPlayer from 'react-player';
import fs from 'fs'
import NodeID3 from 'node-id3';
import eSettings from "electron-settings";
import os from 'os';

import {PlayArrow, Pause, SkipNext, SkipPrevious, QueueMusic, Settings, Shuffle, Repeat} from '@material-ui/icons'
import { settings } from 'cluster';

export default class Home extends Component {

  state= {
    songs: [],
    songIndex: 23, 
    playing: false,
    volume: 0.1 ,
    title: null,
    artist: null,
    length: 0,
    shuffle: null,
    played: 0,
    loop: null,
    list: [],
    seeking: false,
    hideList: false,
  }
 

  handlePause() {
    if(this.state.playing) {
      this.setState({
        playing : !this.state.playing,
      })
    }
      else {  
        this.setState({
          playing : true,
        })
      }

  }

  handleStop() {
      this.setState({
        playing : false,
        played: 0
      })
  }

  componentDidMount() {
    this.parseMetadata()
    document.addEventListener("keydown", (e) => {
      e.preventDefault;
      if(e.keyCode == 32 && e.target == document.body) {e.preventDefault(); this.handlePause()}
      if(e.keyCode == 37) {this.handlePrevious()}
      if(e.keyCode == 39) {this.handleNext()}
      if(e.keyCode == 38) {
        e.preventDefault;
        this.state.volume < 1 ? this.setState({volume : this.state.volume + 0.05}) : this.state.volume
      }
      if(e.keyCode == 40) {this.state.volume > 0 ? this.setState({volume : this.state.volume - 0.05}) : this.state.volume}
    })

    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      this.rememberSettings();
    })

    console.log(this.state)
  }

  rememberSettings() {
    eSettings.set('playerSettings', {
      pathList: this.state.songs,
      list: this.state.list,
      lastSong: this.state.songIndex,
      loop: this.state.loop,
      shuffle: this.state.shuffle,
      played: this.state.played,
      volume: this.state.volume
    })
    console.log('setted')
    window.removeEventListener("beforeunload", () => {window.close})
  }

  componentWillMount() {

    const homeDir = os.userInfo().homedir;
    const folderPath = homeDir + "/Music"

    console.log(eSettings.get('playerSettings'))

    if(!eSettings.has('playerSettings.pathList')) {
      fs.readdirSync(folderPath).forEach(file => {
        this.state.songs.push(folderPath+ "/" + file)
      });
      console.log("fetched files from: " + folderPath)
    } else {  
      this.setState({songs: eSettings.get('playerSettings.pathList')}) 
      console.log('no fetch needed')
    }

    if(!eSettings.has('playerSettings.list')) {
      fs.readdirSync(folderPath).forEach(file => {
        this.state.list.push(file)
      });
    } else {  this.setState({list: eSettings.get('playerSettings.list')})}

    if(!eSettings.has('playerSettings.shuffle')) {
      this.setState({shuffle: false})
    } else {  this.setState({shuffle: eSettings.get('playerSettings.shuffle')})}

    if(!eSettings.has('playerSettings.loop')) {
      this.setState({loop: false})
    } else {  this.setState({loop: eSettings.get('playerSettings.loop')})}
    
    if(!eSettings.has('playerSettings.lastSong')) {
      this.setState({songIndex: 0})
    } else {  this.setState({songIndex: eSettings.get('playerSettings.lastSong')})}

    // if(!eSettings.has('playerSettings.volume')) {
    //   this.setState({volume: 50})
    // } else {  this.setState({volume: eSettings.get('playerSettings.volume')})}
    
}
  
  parseMetadata() {
    NodeID3.read(this.state.songs[this.state.songIndex], (err, tags) => {
      this.setState({
        title: tags.title,
        artist: tags.artist
      })
    })
  }

  handleVolume(e) {
    e.preventDefault;
    this.setState({
      volume: e.target.value
    })

    let val = e.target.value * 100;
    e.target.style.backgroundImage = '-webkit-gradient(linear, left top, right top, color-stop(' + val + '%, #fca311), color-stop(' + val + '%, rgba(68,52,15,0.5)))';

  }

  handleNext() {
    let random = Math.floor(Math.random() * Math.floor(this.state.songs.length - 1));

      if(!this.state.shuffle) {
        if(this.state.songIndex < this.state.songs.length - 1) {
          this.setState({songIndex: this.state.songIndex + 1})
        } else if (this.state.songIndex == this.state.songs.length - 1) {
          this.setState({songIndex: 0})
        }  
      } else {
        this.setState({songIndex: random})
      }
  }

  handlePrevious() {
    if(this.state.songIndex > 0) {
      this.setState({songIndex: this.state.songIndex - 1})
    }
  }

  updatePosition() {
    setTimeout(() => {
      this.setState({position: Sound.position / 1000})
      console.log(this.state.position)
    }, 1000);
  }

  setSongIndex(id) {
    this.setState({songIndex: id, playing: true})
  }

  ref = player => {
    this.player = player
  }

  getLength = (duration) => {
    this.setState({length: duration})
  }

  getProgress = (rplayer) => {
    if(!this.state.seeking) {
      this.setState({
        played: Math.round(rplayer.playedSeconds)
      })
    }

    let target = document.getElementById("seeker")
    let val = Math.ceil(rplayer.playedSeconds) / target.max * 100;
    target.style.backgroundImage = '-webkit-gradient(linear, left top, right top, color-stop(' + val + '%, #fca311), color-stop(' + val + '%, rgba(68,52,15,0.5)))';
    console.log(this.state.played + "//" + val)
  }

  onSeekMouseDown = e => {
    this.setState({ seeking: !this.state.seeking})
  }

  onSeekChange = e => {
    this.setState({ played: Math.round(e.target.value) })
  }

  onSeekMouseUp = e => {
    this.setState({ seeking: false})
    this.player.seekTo(parseFloat(e.target.value))
    let target = document.getElementById("seeker")
    let val = Math.floor(this.state.played) / target.max * 100;
    target.style.backgroundImage = '-webkit-gradient(linear, left top, right top, color-stop(' + val + '%, #fca311), color-stop(' + val + '%, rgba(68,52,15,0.5)))'; 

  }

  toggleList() {
    this.setState({hideList: !this.state.hideList})
  }

  toggleShuffle() {
    this.setState({shuffle : !this.state.shuffle})
  }

  toggleLoop() {
    this.setState({loop : !this.state.loop})
  }

  render() {
    const songList = this.state.list.map((song, index)=>{
      return (<li key={index} onClick={this.setSongIndex.bind(this, index)} style={{color: this.state.songIndex == index ? '#fca311' : 'white'}}>{index + 1}. {song}</li>)
    })

    let list;

    if(!this.state.hideList){
      list = <div><ul className={styles.listContainer}>{songList}</ul></div>
    } else {
      list = <div></div>
    }

    return (
      <div className={styles.container} data-tid="container">

          {list}

          <div className={styles.btnGroup}>
            <div className={styles.titleSeq}>
              <p style={{backgroundColor: 'transparent', fontSize: '20px'}}>{this.state.title}</p>
              <p style={{backgroundColor: 'transparent'}}>{this.state.artist}</p>
            </div>
            <div className={styles.overlap}>
              <div className={styles.controlGroup}>
                <button 
                    style={{color: this.state.loop ? '#fca311' : 'white'}}
                    type="button" 
                    onClick={this.toggleLoop.bind(this)}> 
                    <Repeat/>  
                </button>
                <button 
                    type="button" 
                    onClick={this.handlePrevious.bind(this)}> 
                    <SkipPrevious />
                </button>
                <button 
                    type="button" 
                    onClick={this.handlePause.bind(this)}> 
                    {this.state.playing ? <Pause /> : <PlayArrow />}  
                </button>
                {/* <button 
                    type="button" 
                    onClick={this.handleStop.bind(this)}> 
                    X 
                </button> */}
                <button 
                    type="button" 
                    onClick={this.handleNext.bind(this)}> 
                    <SkipNext />
                </button>
                <button 
                    style={{color: this.state.shuffle ? '#fca311' : 'white'}}
                    type="button" 
                    onClick={this.toggleShuffle.bind(this)}> 
                    <Shuffle/>  
                </button>
              </div>
              <div className={styles.seekerGroup}>
                <p id="seekerPlayed">
                    {this.state.played / 60 < 10 ? "0" + Math.floor(this.state.played / 60) : Math.floor(this.state.length / 60) }:
                    {this.state.played % 60 < 10 ? "0" + Math.floor(this.state.played % 60) : Math.floor(this.state.played % 60)}
                </p>
                <input className={styles.seeker} 
                      id="seeker"
                      type="range"
                      // style={styles.seeker} 
                      min="0" 
                      max={this.state.length} 
                      value={this.state.played} 
                      onChange={this.onSeekChange.bind(this)} 
                      onMouseDown={this.onSeekMouseDown.bind(this)} 
                      onMouseUp={this.onSeekMouseUp.bind(this)} 
                />
                <p id="seekerTotal">
                    {this.state.length / 60 < 10 ? "0" + Math.floor(this.state.length / 60) : Math.floor(this.state.length / 60) }:
                    {Math.floor(this.state.length % 60 < 10 ? "0" + this.state.length % 60 : this.state.length % 60)}
                </p>
                {/* <p>Song Index: {this.state.songIndex}</p> */}    
              </div>  
            </div>
            <div className={styles.volumeContainer}>
              <button 
                    style={{margin: 0, padding: 5}}
                    type="button" 
                    onClick={this.toggleList.bind(this)}> 
                    <Settings />
              </button>
              <button 
                    style={{margin: 0, padding: 10}}
                    type="button" 
                    onClick={this.toggleList.bind(this)}> 
                    <QueueMusic />
              </button>
              <input 
                  id="volumeRange"
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={this.state.volume} 
                  onChange={this.handleVolume.bind(this)}>
              </input>
            </div>        
          </div>

         
          
          <ReactPlayer 
            ref={this.ref}
            height={0}
            width={0}
            url={this.state.songs[this.state.songIndex]}
            volume={this.state.volume}
            played={this.state.played}
            playing={this.state.playing}
            onReady={this.parseMetadata.bind(this)}
            onDuration={this.getLength}
            onProgress={this.getProgress}
            onEnded={this.handleNext.bind(this)}
          />
      </div>
    );
  }
}

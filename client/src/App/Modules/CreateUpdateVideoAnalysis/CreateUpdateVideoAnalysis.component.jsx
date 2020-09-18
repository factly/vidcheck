import React, {useRef, useState} from 'react'
import ReactPlayer from 'react-player'
import {Player, ReactPlayerDiv} from "./CreateUpdateVideoAnalysis.styled";
import Duration from "./Duration";

// Render a YouTube video player
function CreateUpdateVideoAnalysis() {
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=ZBU_Abt4-eQ')
    const [totalDuration, setTotalDuration] = useState(0)
    const player = useRef(null);

    function handleSeekChange(e) {
        console.log(played)
        setPlayed(e.target.value)
        const url = new URL(videoUrl)
        let urlParam = new URLSearchParams(url.search)
        urlParam.delete('t')
        urlParam.set('t', totalDuration * played)
        const currentPlayedTime = player.current.seekTo(played, 'fraction');
        const finalURL = url.origin+ url.pathname+ '?'+ urlParam.toString();
    }

    function handleProgress() {
        const currentPlayedTime = player.current.getCurrentTime()
        setPlayed(currentPlayedTime/totalDuration)
    }


    return (
        <Player>
            <ReactPlayerDiv>
                <ReactPlayer
                    url={videoUrl}
                    width='100%'
                    height='100%'
                    playing={playing}
                    ref={player}
                    volume={0}
                    onProgress={handleProgress}
                    onDuration={setTotalDuration}
                />
                <table>
                    <tbody>
                    <tr>
                        <th>Controls</th>
                        <td>
                            <button onClick={() => setPlaying(!playing)}>Play/Pause</button>
                        </td>
                    </tr>
                    <tr>
                        <th>Seek</th>
                        <td>
                            <input
                                type='range' min={0} max={0.999999} step='any'
                                value={played}
                                onChange={handleSeekChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Played</th>
                        <td>
                            <progress max={1} value={played}/>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <table>
                    <tbody>
                    {/*<tr>*/}
                    {/*    <th>url</th>*/}
                    {/*    <td className={!url ? 'faded' : ''}>*/}
                    {/*        {(url instanceof Array ? 'Multiple' : url) || 'null'}*/}
                    {/*    </td>*/}
                    {/*</tr>*/}
                    <tr>
                        <th>duration</th>
                        <td><Duration seconds={totalDuration} /></td>
                    </tr>
                    <tr>
                        <th>elapsed</th>
                        <td><Duration seconds={totalDuration * played}/></td>
                    </tr>
                    <tr>
                        <th>remaining</th>
                        <td><Duration seconds={totalDuration * (1 - played)}/></td>
                    </tr>
                    </tbody>
                </table>
            </ReactPlayerDiv>
        </Player>)
}

export default CreateUpdateVideoAnalysis;


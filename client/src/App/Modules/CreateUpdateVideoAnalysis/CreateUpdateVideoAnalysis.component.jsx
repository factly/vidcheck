import React, {useRef, useState} from 'react'
import ReactPlayer from 'react-player'
import {FactCheckReviewWrapper, PageWrapper, VideoInfoParentWrapper,} from "./CreateUpdateVideoAnalysis.styled";
import InfoDetails from "./components/InfoDetails/InfoDetails.component";
import AnalysisForm from "./components/AnalysisForm/AnalysisForm.component";
import {
    HorizontalTimelineBar,
    VerticalTimelineBar
} from "./components/AnalysisTimelineBar/AnalysisTimelineBar.components";
import {Button} from "antd";

// req = {
//     'video': {
//         url: '',
//         videoType: '',
//         summary: '',
//         title: '',
//         status: '',
//     }
//     analysis : [
//     {
//        startTime: int,
//        endTime: int,
//        rating: str
//        claimed: str
//        factCheckDetail: str,
//        endTimeFraction: str,
//     }
//     ]
// }

// Render a YouTube video player
function CreateUpdateVideoAnalysis() {
    const defaultFactCheck = [{
        startTime: "00:00",
        endTime: "0:03",
        rating: "true",
        claimed: "aa",
        factCheckDetail: "aa",
        endTimeFraction: 0.013157894736842105,
        widthPercentage: 1.3157894736842104
    }, {
        startTime: "0:03",
        endTime: "0:11",
        rating: "neutral",
        claimed: "ssdd",
        factCheckDetail: "ss",
        endTimeFraction: 0.04824561403508772,
        widthPercentage: 3.5087719298245608
    }, {
        startTime: "0:11",
        endTime: "1:55",
        rating: "partial-false",
        claimed: "ssd",
        factCheckDetail: "aa",
        endTimeFraction: 0.5043859649122807,
        widthPercentage: 45.614035087719294
    }, {
        startTime: "1:55",
        endTime: "3:15",
        rating: "partial-true",
        claimed: "sss",
        factCheckDetail: "aa",
        endTimeFraction: 0.8552631578947368,
        widthPercentage: 35.08771929824562
    }, {
        startTime: "3:15",
        endTime: "3:47",
        rating: "false",
        claimed: "ssds",
        factCheckDetail: "aa",
        endTimeFraction: 0.9956140350877193,
        widthPercentage: 14.035087719298247
    }];
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [currentStartTime, setCurrentStartTime] = useState('');
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=ZBU_Abt4-eQ')
    const [totalDuration, setTotalDuration] = useState(0)
    const [loopDetails, setLoopDetails] = useState({loopEnabled: false, startFraction: 0, endFraction: 1})
    const [factCheckReview, setfactCheckReview] = useState(defaultFactCheck);
    const player = useRef(null);
    const [currentFormdata, setCurrentFormData] = useState({})

    const updateFromState = (data) => {
        setPlayed(data.endTimeFraction);
        player.current.seekTo(data.endTimeFraction, 'fraction');
        setCurrentFormData(data);
    }
    const onDeleteFactCheckReview = (removeIndex) => {
        setfactCheckReview(factCheckReview => {
                let currentWidthSum = 0;
                let newdata = factCheckReview.filter((element, index) => index !== removeIndex)
                return newdata.map((element, index) => {
                        element['startTime'] = index > 0 ? newdata[index - 1]['endTime'] : '00:00';
                        element['widthPercentage'] = element['endTimeFraction'] * 100 - currentWidthSum;
                        currentWidthSum += element['widthPercentage'];
                        return element
                    }
                )
            }
        );
    };

    const getHostname = (url) => {
        // use URL constructor and return hostname
        return new URL(url).hostname;
    }

    const submitFactcheck = () => {
        const videoType = getHostname(videoUrl)
        const data = {
            video: {
                url: videoUrl,
                videoType,
                summary: 'abc',
                title: 'title 1'
            },
            analysis: factCheckReview
        }
        console.log(data)
    }


    function handleSeekChange(e) {
        setPlayed(e.target.value);
        player.current.seekTo(e.target.value, 'fraction');
    }

    function handleProgress() {
        const currentPlayedTime = player.current.getCurrentTime()
        const currentPlayed = currentPlayedTime / totalDuration;
        if (loopDetails.loopEnabled && (currentPlayed < loopDetails.startFraction || currentPlayed > loopDetails.endFraction)) {
            player.current.seekTo(loopDetails.startFraction, 'fraction');
            setPlaying(false)
        }
        let index;
        let currentFormStartTime;
        for (index = 0; index < factCheckReview.length; ++index) {
            if (currentPlayed < factCheckReview[index].endTimeFraction) {
                currentFormStartTime = index > 0 ? factCheckReview[index - 1].endTime : '00:00'
                break;
            }
        }
        if (typeof currentFormStartTime == 'undefined') {
            if (factCheckReview.length === 0) {
                currentFormStartTime = '00:00'
            } else {
                currentFormStartTime = factCheckReview[factCheckReview.length - 1].endTime;
            }
        }
        setCurrentStartTime(currentFormStartTime);
        setPlayed(currentPlayed)
    }

    const playOnLoop = () => {
        if (loopDetails.loopEnabled) {
            setLoopDetails({loopEnabled: false})
        } else {
            setLoopDetails({loopEnabled: true, startFraction: 0.2, endFraction: 0.3})
        }
    };

    const updateVideoUrl = (e) => {
        const newUrl = e.target.value;
        setVideoUrl(newUrl)
    };

    return (
        <PageWrapper>
            <VideoInfoParentWrapper>
                <ReactPlayer
                    url={videoUrl}
                    playing={playing}
                    controls={true}
                    ref={player}
                    volume={0}
                    onProgress={handleProgress}
                    onDuration={setTotalDuration}
                />
                <InfoDetails videoUrl={videoUrl}
                             updateVideoUrl={updateVideoUrl}
                             played={played}
                             setPlaying={setPlaying}
                             playing={playing}
                             handleSeekChange={handleSeekChange}
                             totalDuration={totalDuration}
                />
            </VideoInfoParentWrapper>
            <HorizontalTimelineBar factCheckReview={factCheckReview} setCurrentFormData={updateFromState} />

            <FactCheckReviewWrapper>
                <VerticalTimelineBar factCheckReview={factCheckReview}
                                     setCurrentFormData={updateFromState}
                                     onDeleteFactCheckReview={onDeleteFactCheckReview}/>
                <AnalysisForm factCheckReview={factCheckReview}
                              formData={currentFormdata}
                              setfactCheckReview={setfactCheckReview}
                              totalDuration={totalDuration}
                              currentStartTime={currentStartTime}
                              player={player}
                />
            </FactCheckReviewWrapper>
            <Button type="primary" onClick={submitFactcheck}> Submit Fact Check</Button>
        </PageWrapper>
    )
}

export default CreateUpdateVideoAnalysis;


import React, {useRef, useState} from 'react'
import ReactPlayer from 'react-player'
import {
    FactCheckReviewFormWrapper,
    FactCheckReviewListWrapper,
    FactCheckReviewWrapper,
    InfoHeaderWrapper,
    InfoWrapper,
    PageWrapper, VideoAnalysisTimelineBarWrapper,
    VideoInfoParentWrapper,
    VideoInfoWrapper,
    VideoLengthBar,
    VideoLengthPart,
} from "./CreateUpdateVideoAnalysis.styled";
import Duration from "./Duration";
import {Button, Form, Input, Select, Timeline, Tooltip} from "antd";
import { DeleteOutlined } from '@ant-design/icons';

const {Option} = Select;


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
    }]
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=ZBU_Abt4-eQ')
    const [totalDuration, setTotalDuration] = useState(0)
    const [loopDetails, setLoopDetails] = useState({loopEnabled: false, startFraction: 0, endFraction: 1})
    const [factCheckReview, setfactCheckReview] = useState(defaultFactCheck);
    const player = useRef(null);
    const [form] = Form.useForm();

    const layout = null;
    const tailLayout = {
        wrapperCol: {offset: 8, span: 16},
    };

    const onFinish = values => {
        const minute = values['endTime'].split(':')[0];
        const second = values['endTime'].split(':')[1];
        values['endTimeFraction'] = (parseInt(minute, 10) * 60 + parseInt(second, 10)) / totalDuration;
        if (values['endTimeFraction'] > 1) {
            alert('invalid end time')
            return
        }
        setfactCheckReview(factCheckReview => {
            return [...factCheckReview, values].sort((a, b) => {
                return a.endTimeFraction - b.endTimeFraction;
            });
        });

        setfactCheckReview(factCheckReview => {
                let currentWidthSum = 0
                return factCheckReview.map((element, index, array) => {
                        element['startTime'] = index > 0 ? factCheckReview[index - 1]['endTime'] : '00:00';
                        element['widthPercentage'] = element['endTimeFraction'] * 100 - currentWidthSum;
                        currentWidthSum += element['widthPercentage']
                        return element
                    }
                )
            }
        );
        onReset();
    };

    const onDeleteFactCheckReview = (removeIndex) => {
        setfactCheckReview(factCheckReview => {
                let currentWidthSum = 0
                return factCheckReview.filter((element, index)=> index!==removeIndex).map((element, index, array) => {
                        element['startTime'] = index > 0 ? factCheckReview[index - 1]['endTime'] : '00:00';
                        element['widthPercentage'] = element['endTimeFraction'] * 100 - currentWidthSum;
                        currentWidthSum += element['widthPercentage']
                        return element
                    }
                )
            }
        );
    }

    const onReset = () => {
        form.resetFields();
    };

    function handleSeekChange(e) {
        setPlayed(e.target.value)
        player.current.seekTo(played, 'fraction');
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
        form.setFieldsValue({...form.getFieldsValue(), startTime: currentFormStartTime})
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

    const fillCurrentTime = () => {
        const currentPlayedTime = player.current.getCurrentTime();
        const minute = Math.floor(currentPlayedTime / 60);
        const seconds = Math.floor(currentPlayedTime % 60);
        form.setFieldsValue({...form.getFieldsValue(), endTime: `${minute}:${seconds > 9 ? seconds : '0' + seconds}`})
    };

    const ratingColor = {
        'true': '#19b346',
        'partial-true': '#8bb38d',
        'neutral': '#b3b3b3',
        'partial-false': '#b36d7e',
        'false': '#b30a25'

    };

    const timeBarClick = (a) => {
        console.log(a)
    }

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
                <VideoInfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Video URL</InfoHeaderWrapper>
                        <Input
                            type="text"
                            value={videoUrl}
                            onChange={updateVideoUrl}
                        />
                    </InfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Actions</InfoHeaderWrapper>
                        <button onClick={() => setPlaying(!playing)}>Play/Pause</button>
                        <Button type="primary" onClick={playOnLoop}>
                            Loop
                        </Button>
                    </InfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Played</InfoHeaderWrapper>
                        <progress max={1} value={played}/>
                    </InfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Seek</InfoHeaderWrapper>
                        <input
                            type='range' min={0} max={0.999999} step='any'
                            value={played}
                            onChange={handleSeekChange}
                        />
                    </InfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Total Time</InfoHeaderWrapper>
                        <Duration seconds={totalDuration}/>
                    </InfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Elapsed</InfoHeaderWrapper>
                        <Duration seconds={totalDuration * played}/>
                    </InfoWrapper>
                    <InfoWrapper>
                        <InfoHeaderWrapper>Remaining</InfoHeaderWrapper>
                        <Duration seconds={totalDuration * (1 - played)}/>
                    </InfoWrapper>
                </VideoInfoWrapper>
            </VideoInfoParentWrapper>
            <VideoAnalysisTimelineBarWrapper>
                <VideoLengthBar>
                    {factCheckReview.map((review, index) =>
                        <Tooltip title={review.endTime} key={index}>
                            <VideoLengthPart width={`${review.widthPercentage}%`}
                                             backgroundColor={ratingColor[review.rating]}
                                             onClick={() => timeBarClick(review)}>
                                <p>{review.rating}</p>
                            </VideoLengthPart>
                        </Tooltip>
                    )
                    }
                </VideoLengthBar>
            </VideoAnalysisTimelineBarWrapper>
            <FactCheckReviewWrapper>
                <FactCheckReviewListWrapper>
                    <Timeline mode={'left'}>
                        {
                            factCheckReview && factCheckReview.map((factcheckElem, index) =>
                                <Timeline.Item label={`${factcheckElem.startTime} - ${factcheckElem.endTime}`}
                                               key={index}>
                                    <Button type="primary" shape="circle" icon={<DeleteOutlined />} onClick={()=>onDeleteFactCheckReview(index)}/>
                                    {`${factcheckElem.rating} - ${factcheckElem.claimed.substring(0, 40)}`}

                                </Timeline.Item>
                            )
                        }
                    </Timeline>
                </FactCheckReviewListWrapper>
                <FactCheckReviewFormWrapper>
                    <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
                        <Form.Item style={{marginBottom: 0}}>
                            <Form.Item name="startTime" label="Start time"
                                       style={{display: 'inline-block', width: 'calc(50% - 20px)'}}>
                                <Input disabled/>
                            </Form.Item>
                            <Form.Item name="endTime" label="End time" rules={[{
                                required: true,
                                pattern: new RegExp(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
                                message: "Wrong format! (mm:ss)"
                            }]} style={{display: 'inline-block', width: 'calc(50% - 20px)'}}>
                                <Input/>
                            </Form.Item>
                            <span style={{display: 'inline-block', width: '24px', textAlign: 'center'}}>
                                <Button type="link" onClick={fillCurrentTime}>
                                    now
                                </Button>
                            </span>


                        </Form.Item>
                        <Form.Item name="rating" label="Rating" rules={[{required: true}]}>
                            <Select
                                placeholder="Select a rating of the claim"
                                allowClear
                            >
                                <Option value="true">True</Option>
                                <Option value="partial-true">Partial True</Option>
                                <Option value="neutral">Neutral</Option>
                                <Option value="partial-false">Partial False</Option>
                                <Option value="false">False</Option>
                            </Select>
                        </Form.Item>


                        <Form.Item name="claimed" label="Claimed" rules={[{required: false}]}>
                            <Input.TextArea/>
                        </Form.Item>
                        <Form.Item name="factCheckDetail" label="Fact check" rules={[{required: false}]}>
                            <Input.TextArea/>
                        </Form.Item>
                        <Form.Item {...tailLayout}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                            <Button htmlType="button" onClick={onReset}>
                                Reset
                            </Button>
                        </Form.Item>
                    </Form>
                </FactCheckReviewFormWrapper>
            </FactCheckReviewWrapper>
        </PageWrapper>
    )
}

export default CreateUpdateVideoAnalysis;


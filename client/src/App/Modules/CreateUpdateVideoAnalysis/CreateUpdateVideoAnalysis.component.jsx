import React, {useRef, useState} from 'react'
import ReactPlayer from 'react-player'
import {
    FactCheckReviewFormWrapper,
    FactCheckReviewListWrapper,
    FactCheckReviewWrapper,
    InfoHeaderWrapper,
    InfoWrapper,
    PageWrapper,
    VideoInfoParentWrapper,
    VideoInfoWrapper,
    VideoLengthBar,
    VideoLengthPart,
} from "./CreateUpdateVideoAnalysis.styled";
import Duration from "./Duration";
import {Button, Form, Input, Select, TextArea, Timeline, Tooltip} from "antd";

const {Option} = Select;


// Render a YouTube video player
function CreateUpdateVideoAnalysis() {
    const [playing, setPlaying] = useState(true);
    const [played, setPlayed] = useState(0);
    const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=ZBU_Abt4-eQ')
    const [totalDuration, setTotalDuration] = useState(0)
    const [loopDetails, setLoopDetails] = useState({loopEnabled: false, startFraction: 0, endFraction: 1})
    const [factCheckReview, setfactCheckReview] = useState([]);
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
        setfactCheckReview(factCheckReview =>
            factCheckReview.map((element, index, array) => {
                    element['startTime'] = index > 0 ? factCheckReview[index - 1]['endTime'] : '00:00';
                    element['widthPercentage'] = element['endTimeFraction'] * 100 - (index > 0 ? factCheckReview[index - 1]['widthPercentage'] : 0);
                    return element
                }
            )
        );
    };

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
            <VideoLengthBar>
                {factCheckReview.map((review) =>
                    <Tooltip title={review.endTime}>
                        <VideoLengthPart width={`${review.widthPercentage}%`}
                                         backgroundColor={ratingColor[review.rating]}
                                         onClick={() => timeBarClick(review)}>
                            <p>{review.rating}</p>
                        </VideoLengthPart>
                    </Tooltip>
                )
                }
            </VideoLengthBar>
            <FactCheckReviewWrapper>
                <FactCheckReviewListWrapper>
                    <Timeline mode={'left'}>
                        <Timeline.Item label="2015-09-01">Create a services</Timeline.Item>
                        <Timeline.Item label="2015-09-01 09:12:11">Solve initial network problems</Timeline.Item>
                        <Timeline.Item>Technical testing</Timeline.Item>
                        <Timeline.Item label="2015-09-01 09:12:11">Network problems being solved</Timeline.Item>
                    </Timeline>
                </FactCheckReviewListWrapper>
                <FactCheckReviewFormWrapper>
                    <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>

                        <Form.Item name="startTime" label="Start time">
                            <Input disabled/>
                        </Form.Item>
                        <Form.Item name="endTime" label="End time" rules={[{
                            required: true,
                            pattern: new RegExp(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
                            message: "Wrong format! (mm:ss)"
                        }]}>
                            <Input/>
                        </Form.Item>
                        <Button type="link" onClick={fillCurrentTime}>
                            Current time
                        </Button>
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


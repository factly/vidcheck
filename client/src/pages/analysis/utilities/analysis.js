export function transformVideoAnalysisdetails(resp) {
  if (!resp || !resp.analysis) {
    return [];
  }

  const totalDuration = resp.video.total_duration;

  const analysis = resp.analysis.map((analysisData) => {
    return {
      id: analysisData.id,
      claimed: analysisData.claim,
      factCheckDetail: analysisData.fact,
      end_time_fraction: analysisData.end_time_fraction,
      start_time: analysisData.start_time,
      end_time: analysisData.end_time,
      description: analysisData.description,
      review_sources: analysisData.review_sources,
      rating_id:
        analysisData.rating && analysisData.rating.id
          ? analysisData.rating.id
          : analysisData.rating,

      colour: analysisData.rating && analysisData.rating.colour.hex,
    };
  });
  return {
    video: resp.video,
    analysis: recomputeAnalysisArray(analysis, totalDuration),
  };
}

export function recomputeAnalysisArray(data, totalDuration, removeId = -1) {
  let analysisData = data.sort((a, b) => {
    return a.end_time - b.end_time;
  });

  let newData = analysisData.filter((element, index) => index !== removeId);
  console.log({ newData, removeId });
  return newData.map((element, index) => {
    element.widthPercentage =
      ((element.end_time - element.start_time) / totalDuration) * 100;
    element.end_time = convertSecondsToTimeString(element.end_time);
    // element.start_time =
    //   index > 0
    //     ? convertSecondsToTimeString(newData[index - 1]["end_time"])
    //     : "00:00";
    return element;
  });
}

export function transformToServerCompatibleDate(data) {
  const videoData = {
    url: data.video.url,
    video_type: data.video.video_type,
    summary: data.video.summary,
    title: data.video.title,
  };

  const analysis = data.analysis.map((analysisData) => {
    let analysis = {
      claim: analysisData.claimed,
      rating_id: analysisData.rating,
      fact: analysisData.factCheckDetail,
      description: analysisData.description,
      review_sources: analysisData.review_sources,
      start_time: convertTimeStringToSeconds(analysisData.start_time),
      end_time: convertTimeStringToSeconds(analysisData.end_time),

      end_time_fraction: analysisData.end_time_fraction,
    };
    if (typeof analysisData.id !== "undefined") {
      analysis["id"] = analysisData.id;
    }
    return analysis;
  });
  return {
    video: videoData,
    analysis: analysis,
  };
}

export function convertTimeStringToSeconds(timeString) {
  const minute = timeString.split(":")[0];
  const second = timeString.split(":")[1];
  return parseInt(minute, 10) * 60 + parseInt(second, 10);
}

export function convertSecondsToTimeString(totalSecond) {
  const minutes = Math.floor(totalSecond / 60);
  const seconds = Math.floor(totalSecond % 60);
  return `${minutes > 9 ? minutes : "0" + minutes}:${
    seconds > 9 ? seconds : "0" + seconds
  }`;
}

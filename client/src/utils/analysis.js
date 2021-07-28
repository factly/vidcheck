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
      start_time: analysisData.start_time,
      end_time: analysisData.end_time,
      description: analysisData.description,
      review_sources: analysisData.review_sources,
      rating_id:
        analysisData.rating && analysisData.rating.id
          ? analysisData.rating.id
          : analysisData.rating,

      colour: analysisData.rating && analysisData.rating.background_colour.hex,
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

  return analysisData.filter((element, index) => index !== removeId);
}

export function convertTimeStringToSeconds(timeString) {
  const minute = timeString.split(":")[0];
  const second = timeString.split(":")[1];
  return parseInt(minute, 10) * 60 + parseInt(second, 10);
}

export function convertSecondsToTimeString(totalSecond) {
  if (typeof totalSecond === "string") {
    return totalSecond;
  }
  const minutes = Math.floor(totalSecond / 60);
  const seconds = Math.floor(totalSecond % 60);

  return `${minutes > 9 ? minutes : "0" + minutes}:${
    seconds > 9 ? seconds : "0" + seconds
  }`;
}

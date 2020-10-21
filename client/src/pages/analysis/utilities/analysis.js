export function transformVideoAnalysisdetails(resp) {
  if (!resp || !resp.analysis) {
    return {};
  }
  const video = {
    url: resp.video.Url,
    summary: resp.video.Summary,
    title: resp.video.Title,
  };
  const analysis = resp.analysis.map((analysisData) => {
    return {
      id: analysisData.id,
      claimed: analysisData.claim,
      factCheckDetail: analysisData.fact,
      end_time_fraction: analysisData.end_time_fraction,
      start_time: convertSecondsToTimeString(analysisData.start_time),
      end_time: convertSecondsToTimeString(analysisData.end_time),
      rating: analysisData.rating_id,
    };
  });
  return {
    video: video,
    analysis: recomputeAnalysisArray(analysis),
  };
}

export function recomputeAnalysisArray(data, removeId = -1) {
  let analysisData = data.sort((a, b) => {
    return a.end_time_fraction - b.end_time_fraction;
  });

  let currentWidthSum = 0;
  let newData = analysisData.filter((element, index) => index !== removeId);
  return newData.map((element, index) => {
    element.start_time = index > 0 ? newData[index - 1]["end_time"] : "00:00";
    element.widthPercentage = element.end_time_fraction * 100 - currentWidthSum;
    currentWidthSum += element.widthPercentage;
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

export function ratingStrToInt(ratingStr) {
  // return RATING_MAPPING[ratingStr];
  return 1;
}

export function ratingIntToStr(ratingInt) {
  const reverseRatingIntToStrMap = Object.entries("RATING_MAPPING").reduce(
    (obj, [key, value]) => ({ ...obj, [value]: key }),
    {}
  );
  return reverseRatingIntToStrMap[ratingInt];
}

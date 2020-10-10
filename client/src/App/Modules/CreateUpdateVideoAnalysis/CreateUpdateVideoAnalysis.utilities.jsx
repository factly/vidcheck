import { RATING_MAPPING } from "./CreateUpdateVideoAnalysis.constants";

export function transformVideoAnalysisdetails(resp) {
  if (!resp || !resp.analysis) {
    return {};
  }
  const a = {
    video: {
      url: resp.video.Url,
      summary: resp.video.Summary,
      title: resp.video.Title,
    },
    analysis: resp.analysis.map((analysisData) => {
      return {
        id: analysisData.id,
        claim: analysisData.Claim,
        factCheckDetail: analysisData.Fact,
        endTimeFraction: analysisData.EndTimeFraction,
        startTime: convertSecondsToTimeString(analysisData.StartTime),
        endTime: convertSecondsToTimeString(analysisData.EndTime),
        rating: ratingIntToStr(analysisData.RatingValue),
      };
    }),
  };
  console.log(a);
  return a;
}

export function recomputeAnalysisArray(data, removeId = -1) {
  let currentWidthSum = 0;
  let newData = data.filter((element, index) => index !== removeId);
  return newData.map((element, index) => {
    element["startTime"] = index > 0 ? newData[index - 1]["endTime"] : "00:00";
    element["widthPercentage"] =
      element["endTimeFraction"] * 100 - currentWidthSum;
    currentWidthSum += element["widthPercentage"];
    return element;
  });
}

export function transformToServerCompatibleDate(data) {
  const videoData = {
    url: data.video.url,
    video_type: data.video.videoType,
    summary: data.video.summary,
    title: data.video.title,
  };

  const analysis = data.analysis.map((analysisData) => {
    return {
      start_time: convertTimeStringToSeconds(analysisData.startTime),
      end_time: convertTimeStringToSeconds(analysisData.endTime),
      rating_value: ratingStrToInt(analysisData.rating),
      end_time_fraction: analysisData.endTimeFraction,
    };
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
  return `${minutes}:${seconds > 9 ? seconds : "0" + seconds}`;
}

export function ratingStrToInt(ratingStr) {
  return RATING_MAPPING[ratingStr];
}

export function ratingIntToStr(ratingInt) {
  const reverseRatingIntToStrMap = Object.entries(RATING_MAPPING).reduce(
    (obj, [key, value]) => ({ ...obj, [value]: key }),
    {}
  );
  return reverseRatingIntToStrMap[ratingInt];
}

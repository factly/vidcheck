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
        claimed: analysisData.Claim,
        factCheckDetail: analysisData.Fact,
        endTimeFraction: analysisData.EntTimeFraction,
        startTime: "00:00",
        endTime: "0:03",
        rating: "true",
        widthPercentage: 1.3157894736842104,
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

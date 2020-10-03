export function transformVideoAnalysisdetails(resp) {
  return {
    analysis: [
      {
        startTime: "00:00",
        endTime: "0:03",
        rating: "true",
        claimed: "aa",
        factCheckDetail: "aa",
        endTimeFraction: 0.013157894736842105,
        widthPercentage: 1.3157894736842104,
      },
      {
        startTime: "0:03",
        endTime: "0:11",
        rating: "neutral",
        claimed: "ssdd",
        factCheckDetail: "ss",
        endTimeFraction: 0.04824561403508772,
        widthPercentage: 3.5087719298245608,
      },
      {
        startTime: "0:11",
        endTime: "1:55",
        rating: "partial-false",
        claimed: "ssd",
        factCheckDetail: "aa",
        endTimeFraction: 0.5043859649122807,
        widthPercentage: 45.614035087719294,
      },
      {
        startTime: "1:55",
        endTime: "3:15",
        rating: "partial-true",
        claimed: "sss",
        factCheckDetail: "aa",
        endTimeFraction: 0.8552631578947368,
        widthPercentage: 35.08771929824562,
      },
      {
        startTime: "3:15",
        endTime: "3:47",
        rating: "false",
        claimed: "ssds",
        factCheckDetail: "aa",
        endTimeFraction: 0.9956140350877193,
        widthPercentage: 14.035087719298247,
      },
    ],
    video: {
      url: "https://www.youtube.com/watch?v=ZBU_Abt4-eQ",
    },
  };
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

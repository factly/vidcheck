export function transformVideoAnalysisInfo(resp) {
  if (!resp || !resp.videos) {
    return [];
  }
  return resp.videos.map((item) => {
    return {
      url: item.Url,
      title: item.Title,
      id: item.id,
      summary: item.Summary,
      createdAt: 'February 11, 2020',
      details: {
        totalClaims: 6,
        totalTime: 23,
        claimsData: [
          {
            id: 1,
            widthPercentage: 20,
            rating: 'False',
            startTime: '00:00',
            endTime: '00:20'
          },
          {
            id: 2,
            widthPercentage: 20,
            rating: 'Partial False',
            startTime: '00:20',
            endTime: '00:40'
          },
          {
            id: 3,
            widthPercentage: 20,
            rating: 'False',
            startTime: '00:40',
            endTime: '01:00'
          },
          {
            id: 4,
            widthPercentage: 20,
            rating: 'True',
            startTime: '01:00',
            endTime: '01:20'
          },
          {
            id: 5,
            widthPercentage: 20,
            rating: 'Neutral',
            startTime: '01:20',
            endTime: '01:40'
          }
        ]
      }
    };
  });
}

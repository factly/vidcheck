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
            rating: 'False'
          },
          {
            id: 2,
            widthPercentage: 20,
            rating: 'Partial False'
          },
          {
            id: 3,
            widthPercentage: 20,
            rating: 'False'
          },
          {
            id: 4,
            widthPercentage: 20,
            rating: 'True'
          },
          {
            id: 5,
            widthPercentage: 20,
            rating: 'Neutral'
          }
        ]
      }
    };
  });
}

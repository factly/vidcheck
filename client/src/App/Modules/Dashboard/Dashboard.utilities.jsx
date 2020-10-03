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
    };
  });
}

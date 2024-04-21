
module.exports = {
  logResponse: (data, creationTime) => {
    return (response = {
      id: data.id,
      title: data.title,
      description: data.description,
      image_url: data.image_url,
      meta_title: data.meta_title,
      meta_keywords: data.meta_keywords,
      meta_description: data.meta_description,
      createdAt: creationTime,
    });
  },
};
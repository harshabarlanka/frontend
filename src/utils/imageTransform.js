export const transformImage = (url) => {
  if (!url) return "";

  return url.replace(
    "/upload/",
    "/upload/c_crop,w_920,h_920,g_south_west,x_20,f_auto,q_auto/"
  );
};
export function buildShowroomFormData(payload) {
  const formData = new FormData();

  if (payload.name) {
    formData.append('name', payload.name);
  }

  if (payload.geolocation) {
    formData.append('geolocation', JSON.stringify(payload.geolocation));
  }

  if (payload.showroomLogo) {
    formData.append('showroom_logo', payload.showroomLogo);
  }

  if (payload.showroomBanner) {
    formData.append('showroom_banner', payload.showroomBanner);
  }

  if (payload.removeLogo !== undefined) {
    formData.append('remove_logo', String(payload.removeLogo));
  }

  if (payload.removeBanner !== undefined) {
    formData.append('remove_banner', String(payload.removeBanner));
  }

  return formData;
}

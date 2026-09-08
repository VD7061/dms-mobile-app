import { api } from '../../http';

export function addVehicleDocument(vehicleId, { documentType, file }) {
  const formData = new FormData();
  formData.append('document_type', documentType.trim().toUpperCase());
  formData.append('file', file);

  return api.post(`/api/v1/vehicle/${vehicleId}/document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

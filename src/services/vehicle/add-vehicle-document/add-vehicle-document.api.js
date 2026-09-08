/**
 * Add Vehicle Document API.
 *
 * Keep everything for uploading vehicle documents here:
 * endpoint path, required headers, request body example, curl example, and success response example.
 *
 * No backend call is made from this file.
 */
export const addVehicleDocumentEndpoint = '/api/v1/vehicle/:id/document';

export const addVehicleDocumentApi = {
  name: 'Add Vehicle Document',
  method: 'POST',
  path: addVehicleDocumentEndpoint,
  auth: 'protected',
  description:
    'Protected endpoint (requires Bearer token). Uploads a document for a vehicle. Supports multipart/form-data with document type and file.',
  headers: [
    {
      name: 'Authorization',
      example: 'Bearer <accessToken>',
      required: true,
      description: 'Bearer access token for the authenticated user.',
    },
    {
      name: 'Content-Type',
      example: 'multipart/form-data',
      required: true,
      description: 'Multipart form data for file upload.',
    },
  ],
  requestBodyExample: {
    document_type: 'RC',
    file: '<binary file data>',
  },
  curlExample: `curl --location -g -X POST '{{base_url}}/api/v1/vehicle/1/document' \\
--header 'Authorization: Bearer <accessToken>' \\
--form 'document_type="RC"' \\
--form 'file=@/path/to/document.pdf'`,
  successResponseExample: {
    status: 201,
    body: {
      success: true,
      message: 'vehicle document uploaded',
      data: {
        id: 1,
        vehicle_id: 1,
        document_type: 'RC',
        url: 'https://example.com/documents/vehicle-1-rc.pdf',
        uploaded_at: '2024-01-01T12:00:00Z',
      },
    },
  },
};

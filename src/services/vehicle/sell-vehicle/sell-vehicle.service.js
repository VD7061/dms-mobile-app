import { api } from '../../http';

export function sellVehicle(vehicleId, {
  salePrice,
  saleDate,
  paymentMode,
  remarks,
  customer,
}) {
  return api.post(`/api/v1/vehicle/${vehicleId}/sale`, {
    sale_price: Number(salePrice),
    sale_date: saleDate,
    payment_mode: paymentMode.trim().toLowerCase(),
    remarks: remarks ? remarks.trim() : undefined,
    customer: {
      first_name: customer.firstName.trim(),
      last_name: customer.lastName.trim(),
      phone_number: customer.phoneNumber,
      email: customer.email ? customer.email.trim() : undefined,
      address: customer.address.trim(),
      city: customer.city ? customer.city.trim() : undefined,
      state: customer.state ? customer.state.trim() : undefined,
      pincode: customer.pincode ? customer.pincode.trim() : undefined,
    },
  });
}

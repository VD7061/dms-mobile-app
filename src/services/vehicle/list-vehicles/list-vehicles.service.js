import { api } from '../../http';
import { listVehiclesEndpoint } from './list-vehicles.api';

/**
 * @param {{
 *   status?: string | string[],
 *   type?: string | string[],
 *   minPrice?: number,
 *   maxPrice?: number,
 *   page?: number,
 *   limit?: number,
 * }} [options]
 */
export function listVehicles({ status, type, minPrice, maxPrice, page = 1, limit = 20 } = {}) {
  return api.get(listVehiclesEndpoint, {
    params: {
      status,
      type,
      min_price: minPrice,
      max_price: maxPrice,
      page,
      limit,
    },
  });
}

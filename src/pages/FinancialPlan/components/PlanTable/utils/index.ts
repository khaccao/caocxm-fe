import { firstValueFrom } from "rxjs";

import { WareHouseDTO } from "@/services/AccountingInvoiceService";
import { ProjectService } from "@/services/ProjectService";

// -----------------------------------------------------------------

export const toNumber = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0;
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  
  const n = Number(String(v).replace(/,/g, '').trim());
  return isFinite(n) ? n : 0;
};

// find projectId based on warehouse code
export async function getProjectIdByWarehouse(
  maKho: string | undefined,
  wareHouses: WareHouseDTO[],
): Promise<number | undefined> {
  if (!maKho) return undefined;

  const wh = wareHouses.find(w => w.ma_kho === maKho);
  if (!wh?.id) return undefined;

  try {
    const res: any = await firstValueFrom(
      ProjectService.Get.getProjectWarehousesbyId(wh.id),
    );

    if (Array.isArray(res) && res.length) {
      return res[0].projectId;
    }

    return res?.projectId;

  } catch (err) {

    console.error('getProjectIdByWarehouse error:', err);
    throw err;
  }
}
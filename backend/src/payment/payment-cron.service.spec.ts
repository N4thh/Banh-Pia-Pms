import { OrderStatus } from '@prisma/client';
import {
  getBusinessDateOnly,
  toPrismaDate,
} from 'src/common/utils/date-only.util';
import { PaymentCronService } from './payment-cron.service';

describe('PaymentCronService', () => {
  const updateMany = jest.fn();
  const prisma = {
    order: { updateMany },
  };
  const availabilityService = {};

  let service: PaymentCronService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentCronService(prisma as any, availabilityService as any);
  });

  it('atomically promotes NEW CASH orders due today or earlier', async () => {
    updateMany.mockResolvedValue({ count: 2 });

    await expect(service.promoteDueCashOrders()).resolves.toBe(2);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        status: OrderStatus.NEW,
        paymentMethod: 'CASH',
        receiveDate: { lte: toPrismaDate(getBusinessDateOnly()) },
      },
      data: { status: OrderStatus.PROCESSING },
    });
  });

  it('is idempotent when no eligible CASH orders remain', async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(service.promoteDueCashOrders()).resolves.toBe(0);
    expect(updateMany).toHaveBeenCalledTimes(1);
  });

  it('runs the recovery reconciliation on application bootstrap', async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await service.onApplicationBootstrap();

    expect(updateMany).toHaveBeenCalledTimes(1);
  });
});

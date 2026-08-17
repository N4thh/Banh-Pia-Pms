import { CancelReason } from "@prisma/client";
import { IsEnum, IsString, ValidateIf } from "class-validator";

export class CancelOrderDto {

  @IsEnum(CancelReason, { message: 'cancelReason không hợp lệ' })
  cancelReason!: CancelReason;

  @ValidateIf((o) => o.cancelReason === CancelReason.OTHER)
  @IsString({ message: 'Vui lòng nhập lý do cụ thể khi chọn OTHER' })
  cancelReasonNote?: string;
}
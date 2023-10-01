import { Controller, Get } from '@nestjs/common';
import { ParamString } from '../../middleware/decorators/parameter/param';
import { Instrument } from '@gmjs/gm-trading-shared';
import { InstrumentService } from './instrument.service';

@Controller('instrument')
export class InstrumentController {
  public constructor(private readonly instrumentService: InstrumentService) {}

  @Get('all')
  public async getAll(): Promise<readonly Instrument[]> {
    return await this.instrumentService.getAll();
  }

  @Get('by-name/:name')
  public async getByName(
    @ParamString('name') name: string,
  ): Promise<Instrument> {
    return await this.instrumentService.getByName(name);
  }
}

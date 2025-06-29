import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateAttributeSetUseCase } from '../../application/use-cases/create-attribute-set.use-case';
import { UpdateAttributeSetUseCase } from '../../application/use-cases/update-attribute-set.use-case';
import { DeleteAttributeSetUseCase } from '../../application/use-cases/delete-attribute-set.use-case';
import { GetAttributeSetUseCase } from '../../application/use-cases/get-attribute-set.use-case';
import { ListAttributeSetsUseCase } from '../../application/use-cases/list-attribute-sets.use-case';
import { GetAttributeSetWithAttributesUseCase } from '../../application/use-cases/get-attribute-set-with-attributes.use-case';
import { CreateAttributeSetDto } from '../../application/dto/create-attribute-set.dto';
import { UpdateAttributeSetDto } from '../../application/dto/update-attribute-set.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Attribute Sets')
@Controller('attribute-sets')
export class AttributeSetsController {
  constructor(
    private readonly createAttributeSetUseCase: CreateAttributeSetUseCase,
    private readonly updateAttributeSetUseCase: UpdateAttributeSetUseCase,
    private readonly deleteAttributeSetUseCase: DeleteAttributeSetUseCase,
    private readonly getAttributeSetUseCase: GetAttributeSetUseCase,
    private readonly listAttributeSetsUseCase: ListAttributeSetsUseCase,
    private readonly getAttributeSetWithAttributesUseCase: GetAttributeSetWithAttributesUseCase,
  ) {}

  @Post()
  async create(@Body() data: CreateAttributeSetDto) {
    return this.createAttributeSetUseCase.execute(data);
  }

  @Get()
  async findAll() {
    return this.listAttributeSetsUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getAttributeSetUseCase.execute(id);
  }

  @Get(':id/with-attributes')
  async findOneWithAttributes(@Param('id') id: string) {
    return this.getAttributeSetWithAttributesUseCase.execute(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateAttributeSetDto) {
    return this.updateAttributeSetUseCase.execute(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.deleteAttributeSetUseCase.execute(id);
  }
} 
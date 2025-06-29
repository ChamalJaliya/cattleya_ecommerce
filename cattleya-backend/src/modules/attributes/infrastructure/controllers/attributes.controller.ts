import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateAttributeUseCase } from '../../application/use-cases/create-attribute.use-case';
import { UpdateAttributeUseCase } from '../../application/use-cases/update-attribute.use-case';
import { DeleteAttributeUseCase } from '../../application/use-cases/delete-attribute.use-case';
import { GetAttributeUseCase } from '../../application/use-cases/get-attribute.use-case';
import { ListAttributesUseCase } from '../../application/use-cases/list-attributes.use-case';
import { CreateAttributeDto } from '../../application/dto/create-attribute.dto';
import { UpdateAttributeDto } from '../../application/dto/update-attribute.dto';

@ApiTags('Attributes')
@Controller('attributes')
export class AttributesController {
  constructor(
    private readonly createAttribute: CreateAttributeUseCase,
    private readonly updateAttribute: UpdateAttributeUseCase,
    private readonly deleteAttribute: DeleteAttributeUseCase,
    private readonly getAttribute: GetAttributeUseCase,
    private readonly listAttributes: ListAttributesUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateAttributeDto) {
    return this.createAttribute.execute(dto);
  }

  @Get()
  async findAll() {
    return this.listAttributes.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getAttribute.execute(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    return this.updateAttribute.execute(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deleteAttribute.execute(id);
  }
} 
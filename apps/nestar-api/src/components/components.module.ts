import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';

@Module({
  imports: [MemberModule, PropertyModule]
})
export class ComponentsModule {} // bu ko'prik vazifasida boshqa modullarni olib asosiy app modulga beradi mantiq soddalashadi

import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/core.dto';
import { Vacation } from '../entities/vacation.entity';

@InputType()
export class CreateVacationInput extends PickType(Vacation, [
  'startDate',
  'endDate',
  'isHalf',
]) {}

@ObjectType()
export class CreateVacationOutput extends CoreOutput {
  @Field((type) => Vacation, { nullable: true })
  vacation?: Vacation;
}

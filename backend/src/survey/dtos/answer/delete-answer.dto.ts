import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/core.dto';
import { Answer } from 'src/survey/entities/answer.entity';

@InputType()
export class DeleteAnswerInput extends PickType(Answer, ['_id']) {}

@ObjectType()
export class DeleteAnswerOutput extends CoreOutput {}
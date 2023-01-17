import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/core/dtos/core.dto';
import { Answer } from 'src/survey/entities/answer.entity';

@InputType()
export class GetAnswersOfsurveyInput {
  @Field((type) => Number)
  surveyId: number;
}

@ObjectType()
export class GetAnswersOfsurveyOutput extends CoreOutput {
  @Field((type) => [Answer], { nullable: true })
  answers?: Answer[];
}

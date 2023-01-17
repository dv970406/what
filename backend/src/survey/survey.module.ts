import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomTypeOrmModule } from 'src/core/repository/custom-typeorm.module';
import { AnswerResolver } from './answer.resolver';
import { AnswerService } from './answer.service';
import { AnswerRepository } from './repositories/answer.repository';
import { SurveyRepository } from './repositories/survey.repository';
import { SurveyResolver } from './survey.resolver';
import { SurveyService } from './survey.service';

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([
      SurveyRepository,
      AnswerRepository,
    ]),
  ],
  providers: [SurveyService, SurveyResolver, AnswerResolver, AnswerService],
})
export class SurveyModule {}

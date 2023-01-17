import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from 'src/auth/auth-user.decorator';
import { ManagerGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/entities/user.entity';
import {
  CreateSurveyInput,
  CreateSurveyOutput,
} from './dtos/survey/create-survey.dto';
import {
  DeleteSurveyInput,
  DeleteSurveyOutput,
} from './dtos/survey/delete-survey.dto';
import { GetSurveyInput, GetSurveyOutput } from './dtos/survey/get-survey.dto';
import { GetSurveysOutput } from './dtos/survey/get-surveys.dto';
import { Survey } from './entities/survey.entity';
import { SurveyService } from './survey.service';

@Resolver((of) => Survey)
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}
  // Survey는 복수형이 없는데 그냥 's'를 붙여 의미상 복수형으로 생각하자
  @Query((type) => GetSurveysOutput)
  getSurveys(): Promise<GetSurveysOutput> {
    return this.surveyService.getSurveys();
  }

  @Query((type) => GetSurveyOutput)
  getSurvey(
    @Args('input') getSurveyInput: GetSurveyInput,
  ): Promise<GetSurveyOutput> {
    return this.surveyService.getSurvey(getSurveyInput);
  }

  @Mutation((type) => CreateSurveyOutput)
  @UseGuards(ManagerGuard)
  createSurvey(
    @LoggedInUser() loggedInUser: User,
    @Args('input') createSurveyInput: CreateSurveyInput,
  ): Promise<CreateSurveyOutput> {
    return this.surveyService.createSurvey(loggedInUser, createSurveyInput);
  }

  @Mutation((type) => DeleteSurveyOutput)
  @UseGuards(ManagerGuard)
  deleteSurvey(
    @LoggedInUser() loggedInUser: User,
    @Args('input') deleteSurveyInput: DeleteSurveyInput,
  ): Promise<DeleteSurveyOutput> {
    return this.surveyService.deleteSurvey(loggedInUser, deleteSurveyInput);
  }
}

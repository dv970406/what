import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { LoggedInUser } from 'src/auth/auth-user.decorator';
import { LoginGuard, ManagerGuard } from 'src/auth/auth.guard';
import { ConnectionInput } from 'src/core/dtos/pagination.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { GetAnswersOfsurveyInput } from './dtos/answer/get-answersOfSurvey.dto';
import {
  MultipleChoiceFormat,
  ResponseRate,
  ShortAnswerFormat,
} from './dtos/survey/resolve-field.dto';
import {
  CreateSurveyInput,
  CreateSurveyOutput,
} from './dtos/survey/create-survey.dto';
import {
  DeleteSurveyInput,
  DeleteSurveyOutput,
} from './dtos/survey/delete-survey.dto';
import { GetSurveyInput, GetSurveyOutput } from './dtos/survey/get-survey.dto';
import {
  GetSurveysInput,
  GetSurveysOutput,
} from './dtos/survey/get-surveys.dto';
import { Survey } from './entities/survey.entity';
import { SurveyService } from './survey.service';

@Resolver((of) => Survey)
export class SurveyResolver {
  constructor(private readonly surveyService: SurveyService) {}
  @ResolveField((type) => ResponseRate)
  responseRate(@Parent() survey: Survey): Promise<ResponseRate> {
    return this.surveyService.responseRate(survey);
  }

  @ResolveField((type) => [MultipleChoiceFormat])
  multipleChoiceFormat(
    @Parent() survey: Survey,
  ): Promise<MultipleChoiceFormat[]> {
    return this.surveyService.multipleChoiceFormat(survey);
  }

  @ResolveField((type) => [ShortAnswerFormat])
  shortAnswerFormat(@Parent() survey: Survey): Promise<ShortAnswerFormat[]> {
    return this.surveyService.shortAnswerFormat(survey);
  }
  @ResolveField((type) => Boolean)
  isMySurvey(
    @LoggedInUser() loggedInUser: User,
    @Parent() survey: Survey,
  ): Promise<boolean> {
    return this.surveyService.isMySurvey(loggedInUser, survey);
  }
  @ResolveField((type) => Boolean)
  isAnswered(
    @Parent() survey: Survey,
    @LoggedInUser() loggedInUser: User,
  ): Promise<boolean> {
    return this.surveyService.isAnswered(loggedInUser, survey);
  }

  // Survey??? ???????????? ????????? ?????? 's'??? ?????? ????????? ??????????????? ????????????
  @Query((type) => GetSurveysOutput)
  @UseGuards(LoginGuard)
  getSurveys(
    @LoggedInUser() loggedInUser: User,
    @Args() getSurveysInput: GetSurveysInput,
  ): Promise<GetSurveysOutput> {
    return this.surveyService.getSurveys(loggedInUser, getSurveysInput);
  }

  @Query((type) => GetSurveyOutput)
  @UseGuards(LoginGuard)
  getSurvey(
    @LoggedInUser() loggedInUser: User,
    @Args('input') getSurveyInput: GetSurveyInput,
  ): Promise<GetSurveyOutput> {
    return this.surveyService.getSurvey(loggedInUser, getSurveyInput);
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

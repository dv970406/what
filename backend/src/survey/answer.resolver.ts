import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from 'src/auth/auth-user.decorator';
import { LoginGuard, ManagerGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/entities/user.entity';
import { AnswerService } from './answer.service';
import {
  CreateAnswerInput,
  CreateAnswerOutput,
} from './dtos/answer/create-answer.dto';
import {
  DeleteAnswerInput,
  DeleteAnswerOutput,
} from './dtos/answer/delete-answer.dto';
import {
  GetAnswersOfsurveyInput,
  GetAnswersOfsurveyOutput,
} from './dtos/answer/get-answersOfSurvey.dto';
import { GetMyAnswersOutput } from './dtos/answer/get-myAnswers.dto';
import { Answer } from './entities/answer.entity';

@Resolver((of) => Answer)
export class AnswerResolver {
  constructor(private readonly answerService: AnswerService) {}
  @Query((type) => GetMyAnswersOutput)
  @UseGuards(LoginGuard)
  getMyAnswers(
    @LoggedInUser() loggedInUser: User,
  ): Promise<GetMyAnswersOutput> {
    return this.answerService.getMyAnswers(loggedInUser);
  }

  @Query((type) => GetAnswersOfsurveyOutput)
  @UseGuards(ManagerGuard)
  getAnswersOfSurvey(
    @LoggedInUser() loggedInUser: User,
    @Args('input') getAnswersOfSurvey: GetAnswersOfsurveyInput,
  ): Promise<GetAnswersOfsurveyOutput> {
    return this.answerService.getAnswersOfSurvey(
      loggedInUser,
      getAnswersOfSurvey,
    );
  }

  @Mutation((type) => CreateAnswerOutput)
  @UseGuards(LoginGuard)
  createAnswer(
    @LoggedInUser() loggedInUser: User,
    @Args('input') createAnswerInput: CreateAnswerInput,
  ): Promise<CreateAnswerOutput> {
    return this.answerService.createAnswer(loggedInUser, createAnswerInput);
  }

  @Mutation((type) => DeleteAnswerOutput)
  @UseGuards(LoginGuard)
  deleteAnswer(
    @LoggedInUser() loggedInUser: User,
    @Args('input') deleteAnswerInput: DeleteAnswerInput,
  ): Promise<DeleteAnswerOutput> {
    return this.answerService.deleteAnswer(loggedInUser, deleteAnswerInput);
  }
}
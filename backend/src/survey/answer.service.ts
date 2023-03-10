import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionInput } from 'src/core/dtos/pagination.dto';
import { DB_TABLE } from 'src/core/variables/constants';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { LessThan } from 'typeorm';
import { AnswersConnection } from './dtos/answer/answer-pagination.dto';
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
  GetAnswersOfSurveyOutput,
  // GetAnswersOfSurveyOutput,
} from './dtos/answer/get-answersOfSurvey.dto';
import {
  MultipleChoiceFormat,
  ResponseRate,
  ShortAnswerFormat,
} from './dtos/survey/resolve-field.dto';
import { Answer } from './entities/answer.entity';
import { AnswerRepository } from './repositories/answer.repository';
import { SurveyRepository } from './repositories/survey.repository';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(SurveyRepository)
    private readonly surveyRepo: SurveyRepository,
    @InjectRepository(AnswerRepository)
    private readonly answerRepo: AnswerRepository,
    @InjectRepository(UserRepository)
    private readonly userRepo: UserRepository,
  ) {}

  async answersConnection(
    user: User,
    { first, after }: ConnectionInput,
  ): Promise<AnswersConnection> {
    const [findMyAnswers, totalCount] = await this.answerRepo.findAndCount({
      order: { createdAt: 'DESC' },
      where: {
        user: {
          id: user.id,
        },
        ...(after && { createdAt: LessThan(after) }),
      },
      take: first,
    });

    const edges = findMyAnswers.map((answer) => ({
      cursor: answer.createdAt,
      node: answer,
    }));
    const endCursor = totalCount > 0 ? edges[edges.length - 1].cursor : null;

    return {
      edges,
      pageInfo: {
        endCursor,
        hasNextPage: totalCount > first,
      },
    };
  }

  async getAnswersOfSurvey({
    surveyId,
  }: GetAnswersOfsurveyInput): Promise<GetAnswersOfSurveyOutput> {
    try {
      const findSurvey = await this.surveyRepo.findSurvey({ surveyId });

      return {
        ok: true,
        survey: findSurvey,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '????????? ?????? ?????? ????????? ??????????????????.',
      };
    }
  }

  async createAnswer(
    loggedInUser: User,
    { surveyId, results }: CreateAnswerInput,
  ): Promise<CreateAnswerOutput> {
    try {
      const findSurvey = await this.surveyRepo.findSurvey({ surveyId });

      if (results.length < findSurvey.paragraphs.length) {
        throw new Error('????????? ???????????? ?????? ????????? ????????????.');
      } else if (results.length > findSurvey.paragraphs.length) {
        throw new Error('????????? ????????? ????????? ???????????? ????????????.');
      }

      const alreadyAnswered = await findSurvey.answers.find(
        (answer) => answer.user.id === loggedInUser.id,
      );
      if (alreadyAnswered) {
        throw new Error('?????? ????????? ???????????????.');
      }

      const newAnswer = await this.answerRepo.save({
        results,
        user: loggedInUser,
        survey: findSurvey,
      });

      return {
        ok: true,
        answer: newAnswer,
        surveyId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async deleteAnswer(
    loggedInUser: User,
    { id: answerId }: DeleteAnswerInput,
  ): Promise<DeleteAnswerOutput> {
    try {
      const findAnswer = await this.answerRepo.findOneBy({
        id: answerId,
      });

      if (!findAnswer) {
        throw new Error('???????????? ?????? ???????????????.');
      }

      if (loggedInUser.id !== findAnswer.userId) {
        throw new Error('????????? ???????????? ????????????.');
      }

      await this.answerRepo.delete({ id: answerId });

      return {
        ok: true,
        deletedAnswerId: answerId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }
}

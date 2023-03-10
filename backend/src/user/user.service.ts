import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isInt } from 'class-validator';
import { find } from 'rxjs';
import { ConnectionInput } from 'src/core/dtos/pagination.dto';
import { POSITION_CEO } from 'src/core/variables/position';
import { JwtService } from 'src/jwt/jwt.service';
import { MessageRepository } from 'src/message/repositories/message.repository';
import { NotificationRepository } from 'src/notification/notification.repository';
import { PositionRepository } from 'src/position/position.repository';
import { CommentsConnection } from 'src/post/dtos/comment/comment-pagination.dto';
import { LikesConnection } from 'src/post/dtos/like/like-pagination.dto';
import { PostsConnection } from 'src/post/dtos/post/post-pagination.dto';
import { CommentRepository } from 'src/post/repositories/comment.repository';
import { LikeRepository } from 'src/post/repositories/like.repository';
import { PostRepository } from 'src/post/repositories/post.repository';
import { AnswersConnection } from 'src/survey/dtos/answer/answer-pagination.dto';
import { AnswerRepository } from 'src/survey/repositories/answer.repository';
import { TeamRepository } from 'src/team/team.repository';
import { VacationsConnection } from 'src/vacation/dtos/vacation-pagination.dto';
import { VacationRepository } from 'src/vacation/vacation.repository';
import { In, LessThan, Like, Like as LikeSearch, Not } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { DeleteUserInput, DeleteUserOutput } from './dtos/delete-user.dto';
import { GetMyInfoInput, GetMyInfoOutput } from './dtos/get-myInfo.dto';
import { GetUserInput, GetUserOutput } from './dtos/get-user.dto';
import { GetUsersInput, GetUsersOutput } from './dtos/get-users.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UpdateUserInput, UpdateUserOutput } from './dtos/update-user.dto';
import {
  UpdateUserPasswordInput,
  UpdateUserPasswordOutput,
} from './dtos/update-userPassword.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserRepository) private readonly userRepo: UserRepository,
    @InjectRepository(PositionRepository)
    private readonly positionRepo: PositionRepository,
    @InjectRepository(TeamRepository) private readonly teamRepo: TeamRepository,
    @InjectRepository(AnswerRepository)
    private readonly answerRepo: AnswerRepository,
    @InjectRepository(VacationRepository)
    private readonly vacationRepo: VacationRepository,
    @InjectRepository(PostRepository) private readonly postRepo: PostRepository,
    @InjectRepository(CommentRepository)
    private readonly commentRepo: CommentRepository,
    @InjectRepository(LikeRepository)
    private readonly likeRepo: LikeRepository,
    @InjectRepository(NotificationRepository)
    private readonly notificationRepo: NotificationRepository,
    @InjectRepository(MessageRepository)
    private readonly messageRepo: MessageRepository,
  ) {}

  async unreadNotificationCount({ id }: User): Promise<number> {
    return this.notificationRepo.count({
      where: {
        user: {
          id,
        },
        isRead: false,
      },
    });
  }
  async myAnswersConnection(
    loggedInUser: User,
    { keyword, first, after }: ConnectionInput,
  ): Promise<AnswersConnection> {
    const [findMyAnswers, totalCount] = await this.answerRepo.findAndCount({
      order: { createdAt: 'DESC' },
      where: {
        user: {
          id: loggedInUser.id,
        },
        ...(after && { createdAt: LessThan(after) }),
      },
      ...(keyword && {
        where: {
          user: {
            id: loggedInUser.id,
          },
          survey: {
            surveyTitle: Like(`%${keyword}%`),
          },
          ...(after && { createdAt: LessThan(after) }),
        },
      }),
      relations: {
        survey: {
          user: true,
        },
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
  async myVacationsConnection(
    loggedInUser: User,
    { first, after }: ConnectionInput,
  ): Promise<VacationsConnection> {
    const [findMyVacations, totalCount] = await this.vacationRepo.findAndCount({
      order: { createdAt: 'DESC' },
      where: {
        user: {
          id: loggedInUser.id,
        },
        ...(after && { createdAt: LessThan(after) }),
      },
      relations: {
        user: true,
      },
      take: first,
    });

    const edges = findMyVacations.map((vacation) => ({
      cursor: vacation.createdAt,
      node: vacation,
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
  async myPostsConnection(
    loggedInUser: User,
    { keyword, first, after }: ConnectionInput,
  ): Promise<PostsConnection> {
    const [findMyPosts, totalCount] = await this.postRepo.findAndCount({
      order: { createdAt: 'DESC' },
      where: {
        user: {
          id: loggedInUser.id,
        },
        ...(after && { createdAt: LessThan(after) }),
      },
      ...(keyword && {
        where: [
          {
            user: {
              id: loggedInUser.id,
            },
            title: Like(`%${keyword}%`),
            ...(after && { createdAt: LessThan(after) }),
          },
          {
            user: {
              id: loggedInUser.id,
            },
            content: Like(`%${keyword}%`),
            ...(after && { createdAt: LessThan(after) }),
          },
        ],
      }),
      relations: {
        user: true,
      },
      take: first,
    });

    const edges = findMyPosts.map((post) => ({
      cursor: post.createdAt,
      node: post,
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
  async myLikesConnection(
    loggedInUser: User,
    { keyword, first, after }: ConnectionInput,
  ): Promise<LikesConnection> {
    const [findMyLikes, totalCount] = await this.likeRepo.findAndCount({
      order: { createdAt: 'DESC' },
      where: {
        user: {
          id: loggedInUser.id,
        },
        ...(after && { createdAt: LessThan(after) }),
      },
      ...(keyword && {
        where: [
          {
            user: {
              id: loggedInUser.id,
            },
            post: {
              title: Like(`%${keyword}%`),
            },
            ...(after && { createdAt: LessThan(after) }),
          },
          {
            user: {
              id: loggedInUser.id,
            },
            post: {
              content: Like(`%${keyword}%`),
            },
            ...(after && { createdAt: LessThan(after) }),
          },
        ],
      }),
      relations: {
        post: {
          user: true,
        },
      },
      take: first,
    });

    const edges = findMyLikes.map((like) => ({
      cursor: like.createdAt,
      node: like,
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
  async myCommentsConnection(
    loggedInUser: User,
    { keyword, first, after }: ConnectionInput,
  ): Promise<CommentsConnection> {
    const [findMyComments, totalCount] = await this.commentRepo.findAndCount({
      order: { createdAt: 'DESC' },
      where: {
        user: {
          id: loggedInUser.id,
        },
        ...(after && { createdAt: LessThan(after) }),
      },
      ...(keyword && {
        where: [
          {
            user: {
              id: loggedInUser.id,
            },
            post: {
              title: Like(`%${keyword}%`),
            },
            ...(after && { createdAt: LessThan(after) }),
          },
          {
            user: {
              id: loggedInUser.id,
            },
            post: {
              content: Like(`%${keyword}%`),
            },
            ...(after && { createdAt: LessThan(after) }),
          },
          {
            user: {
              id: loggedInUser.id,
            },
            content: Like(`%${keyword}%`),
            ...(after && { createdAt: LessThan(after) }),
          },
        ],
      }),
      relations: {
        post: {
          user: true,
        },
      },
      take: first,
    });

    const edges = findMyComments.map((comment) => ({
      cursor: comment.createdAt,
      node: comment,
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

  async isLeader({ id }: User): Promise<boolean> {
    return this.teamRepo.exist({
      where: {
        leader: {
          id,
        },
      },
    });
  }

  async getUsers({
    keyword,
    orders,
    first,
    after,
  }: GetUsersInput): Promise<GetUsersOutput> {
    try {
      const [findUsers, totalCount] = await this.userRepo.findAndCount({
        order: { createdAt: 'DESC' },
        where: {
          ...(after && { createdAt: LessThan(after) }),
        },
        ...(keyword && {
          where: [
            {
              name: LikeSearch(`%${keyword}%`),
              ...(after && { createdAt: LessThan(after) }),
            },
            {
              email: LikeSearch(`%${keyword}%`),
              ...(after && { createdAt: LessThan(after) }),
            },
          ],
        }),
        ...(orders && {
          where: {
            position: {
              ...(orders?.order1 &&
                orders?.order1.length > 0 && { id: In(orders.order1) }),
              ...(after && { createdAt: LessThan(after) }),
            },
            team: {
              ...(orders?.order2 &&
                orders?.order2.length > 0 && { id: In(orders.order2) }),
              ...(after && { createdAt: LessThan(after) }),
            },
          },
        }),
        relations: {
          position: true,
          team: true,
        },
        take: first,
      });

      const edges = findUsers.map((user) => ({
        cursor: user.createdAt,
        node: user,
      }));
      const endCursor = totalCount > 0 ? edges[edges.length - 1].cursor : null;

      return {
        ok: true,
        edges,
        pageInfo: {
          endCursor,
          hasNextPage: totalCount > first,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ?????? ????????? ??????????????????.',
      };
    }
  }

  async getUser({ userId }: GetUserInput): Promise<GetUserOutput> {
    try {
      const findUser = await this.userRepo.findOne({
        where: { id: userId },
        relations: {
          position: true,
          team: true,
        },
      });

      if (!findUser) {
        throw new Error('???????????? ?????? ???????????????.');
      }
      return {
        ok: true,
        user: findUser,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async getMyInfo(loggedInUser: User): Promise<GetMyInfoOutput> {
    try {
      const findUser = await this.userRepo.findOne({
        where: { id: loggedInUser.id },
        relations: {
          position: true,
          team: true,
        },
      });
      if (!findUser) {
        throw new Error('???????????? ?????? ???????????????.');
      }

      return {
        ok: true,
        user: findUser,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async createUser({
    email,
    name,
    joinDate,
    positionId,
    teamId,
  }: CreateUserInput): Promise<CreateUserOutput> {
    try {
      const isExistEmail = await this.userRepo.countBy({ email });
      if (isExistEmail) {
        throw new Error('?????? ???????????? ??????????????????.');
      }

      const findPosition = await this.positionRepo.findPosition({ positionId });
      if (findPosition.position === POSITION_CEO) {
        throw new Error('?????? ???????????? ???????????????.');
      }

      const findTeam = await this.teamRepo.findTeam({ teamId });

      const createUser = this.userRepo.create({
        email,
        password: process.env.TEMPORARY_PASSWORD,
        isManager: false,
        name,
        joinDate,
        position: findPosition,
        team: findTeam,
      });

      const newUser = await this.userRepo.save(createUser);

      const edge = {
        node: newUser,
        cursor: newUser.createdAt,
      };
      return {
        ok: true,
        edge,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const findUser = await this.userRepo.findOne({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      if (!findUser) {
        throw new Error('???????????? ?????? ??????????????????.');
      }

      const checkPassword = await findUser.checkPassword(password);
      if (!checkPassword) {
        throw new Error('??????????????? ???????????? ????????????.');
      }

      const token = this.jwtService.sign(findUser.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '???????????? ??????????????????.',
      };
    }
  }

  async updateUser(
    loggedInUser: User,
    {
      userId,
      positionId,
      teamId,
      isManager,
      availableVacation,
      ...updateUserInfo
    }: UpdateUserInput,
  ): Promise<UpdateUserOutput> {
    try {
      const findUser = await this.userRepo.findUser({ userId });

      this.userRepo.protectManagerAndCEO({
        findUser,
        loggedInUser,
        type: '??????',
      });

      if (loggedInUser.position.position !== POSITION_CEO && isManager) {
        throw new Error('????????? ????????? ????????? ??? ????????????.');
      }

      let floatAvailableVacation;
      if (availableVacation) {
        if (userId === loggedInUser.id) {
          throw new Error('????????? ????????? ????????? ??? ????????????.');
        }

        const isPointFiveUnit =
          isInt(+availableVacation) || availableVacation.includes('.5');
        if (isPointFiveUnit) floatAvailableVacation = availableVacation;
        else throw new Error('????????? 0.5????????? ??????????????????.');

        if (+availableVacation > 30 || +availableVacation < 0)
          throw new Error('????????? 0??? ?????? 30??? ?????? ????????? ???????????????.');
      }
      let findPosition;
      if (positionId) {
        findPosition = await this.positionRepo.findPosition({ positionId });
        if (findPosition.position === POSITION_CEO) {
          throw new Error('?????? ???????????? ???????????????.');
        }
      }

      let findTeam;
      if (teamId) {
        findTeam = await this.teamRepo.findTeam({ teamId });
      }

      await this.userRepo.save([
        {
          id: userId,
          ...(findPosition && { position: findPosition }),
          ...(findTeam && { team: findTeam }),
          ...(loggedInUser.position.position === POSITION_CEO && { isManager }),
          availableVacation: floatAvailableVacation,
          ...updateUserInfo,
        },
      ]);
      const updatedUser = await this.userRepo.findUser({ userId });

      return {
        ok: true,
        user: updatedUser,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async updateUserPassword(
    loggedInUser: User,
    { password }: UpdateUserPasswordInput,
  ): Promise<UpdateUserPasswordOutput> {
    try {
      const findUser = await this.userRepo.findUser({
        userId: loggedInUser.id,
      });

      // ??? ???????????? ???????????? User entity??? @BeforeUpdate??? ???????????? ??????
      if (password) {
        findUser.password = password;
      }
      await this.userRepo.save(findUser);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '???????????? ????????? ??????????????????.',
      };
    }
  }
  async deleteUser(
    loggedInUser: User,
    { id: userId }: DeleteUserInput,
  ): Promise<DeleteUserOutput> {
    try {
      const findUser = await this.userRepo.findUser({ userId });

      this.userRepo.protectManagerAndCEO({
        findUser,
        loggedInUser,
        type: '??????',
      });

      if (userId === loggedInUser.id) {
        throw new Error('????????? ????????? ??? ????????????.');
      }

      await this.userRepo.delete({ id: userId });

      return {
        ok: true,
        deletedUserId: userId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }
}

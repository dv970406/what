import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isInt } from 'class-validator';
import { DB_TABLE } from 'src/core/variables/constants';
import { POSITION_CEO } from 'src/core/variables/position';
import { JwtService } from 'src/jwt/jwt.service';
import { PositionRepository } from 'src/position/position.repository';
import { TeamRepository } from 'src/team/team.repository';
import { LessThan, Like } from 'typeorm';
import { CreateUserInput, CreateUserOutput } from './dtos/create-user.dto';
import { DeleteUserInput, DeleteUserOutput } from './dtos/delete-user.dto';
import { GetUserInput, GetUserOutput } from './dtos/get-user.dto';
import { GetUsersInput, GetUsersOutput } from './dtos/get-users.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { SearchUsersInput, SearchUsersOutput } from './dtos/search-users.dto';
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
    @InjectRepository(UserRepository) private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
    @InjectRepository(PositionRepository)
    private readonly positionRepo: PositionRepository,
    @InjectRepository(TeamRepository) private readonly teamRepo: TeamRepository,
  ) {}

  async getUsers({ first, after }: GetUsersInput): Promise<GetUsersOutput> {
    try {
      const [findUsers, totalCount] = await this.userRepo.findAndCount({
        order: { createdAt: 'DESC' },
        relations: {
          position: true,
          team: true,
        },
        where: {
          ...(after && { createdAt: LessThan(after) }),
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
          hasNextPage: totalCount > first,
          endCursor,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: '유저 리스트 조회에 실패했습니다.',
      };
    }
  }
  async searchUsers({
    keyword,
    first,
    after,
  }: SearchUsersInput): Promise<SearchUsersOutput> {
    try {
      const [findUsers, totalCount] = await this.userRepo.findAndCount({
        ...(keyword && {
          where: [
            {
              name: Like(`%${keyword}%`),
              ...(after && { createdAt: LessThan(after) }),
            },
            {
              email: Like(`%${keyword}%`),
              ...(after && { createdAt: LessThan(after) }),
            },
          ],
        }),
        take: first,
        order: { createdAt: 'DESC' },
        relations: {
          position: true,
          team: true,
        },
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
          hasNextPage: totalCount > first,
          endCursor,
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '찾을 수 없는 유저입니다.',
      };
    }
  }
  async getUser({ id: userId }: GetUserInput): Promise<GetUserOutput> {
    try {
      const findUser = await this.userRepo.findOne({
        where: { id: userId },
        relations: {
          position: true,
          team: true,
          vacations: true,
        },
      });

      if (!findUser) {
        throw new Error('존재하지 않는 유저입니다.');
      }
      return {
        ok: true,
        user: findUser,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '계정 조회에 실패했습니다.',
      };
    }
  }

  async getMyInfo({ id: userId }: GetUserInput): Promise<GetUserOutput> {
    try {
      const findUser = await this.userRepo.findOne({
        where: { id: userId },
        relations: {
          position: true,
          team: true,
          vacations: true,
          attendedMeetings: {
            attendees: true,
          },
          hostedMeetingsByMe: true,
          posts: {
            user: true,
          },
          likes: {
            post: {
              user: true,
            },
          },
          comments: {
            post: {
              user: true,
            },
          },
          answers: {
            survey: {
              user: true,
            },
          },
          surveys: true,
        },
      });
      if (!findUser) {
        throw new Error('존재하지 않는 유저입니다.');
      }

      return {
        ok: true,
        user: findUser,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '계정 조회에 실패했습니다.',
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
        throw new Error('이미 존재하는 이메일입니다.');
      }

      const findPosition = await this.positionRepo.findPosition({ positionId });
      if (findPosition.position === POSITION_CEO) {
        throw new Error('설정 불가능한 직책입니다.');
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
      console.log(error);
      return {
        ok: false,
        error: error.message || '계정 생성에 실패했습니다.',
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
        throw new Error('존재하지 않는 이메일입니다.');
      }

      const checkPassword = await findUser.checkPassword(password);
      if (!checkPassword) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      const token = this.jwtService.sign(findUser.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '로그인에 실패했습니다.',
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
        type: '수정',
      });

      if (loggedInUser.position.position !== POSITION_CEO && isManager) {
        throw new Error('관리자 권한을 부여할 수 없습니다.');
      }

      let floatAvailableVacation;
      if (availableVacation) {
        if (userId === loggedInUser.id) {
          throw new Error('본인의 연차는 수정할 수 없습니다.');
        }

        const isPointFiveUnit =
          isInt(+availableVacation) || availableVacation.includes('.5');
        if (isPointFiveUnit) floatAvailableVacation = availableVacation;
        else throw new Error('연차는 0.5단위로 설정해주세요.');

        if (+availableVacation > 30 || +availableVacation < 0)
          throw new Error('연차는 0일 이상 30일 이하 설정만 가능합니다.');
      }
      let findPosition;
      if (positionId) {
        findPosition = await this.positionRepo.findPosition({ positionId });
        if (findPosition.position === POSITION_CEO) {
          throw new Error('설정 불가능한 직책입니다.');
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
        error: error.message || '계정 수정에 실패했습니다.',
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

      // 이 방식으로 수정해야 User entity의 @BeforeUpdate의 트리거에 걸림
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
        error: error.message || '비밀번호 변경에 실패했습니다.',
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
        type: '삭제',
      });

      if (userId === loggedInUser.id) {
        throw new Error('본인을 삭제할 수 없습니다.');
      }

      await this.userRepo.delete({ id: userId });

      return {
        ok: true,
        deletedUserId: userId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '계정 삭제에 실패했습니다.',
      };
    }
  }
}

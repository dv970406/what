import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DB_TABLE } from 'src/core/variables/constants';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { CreateTeamInput, CreateTeamOutput } from './dtos/create-team.dto';
import { DeleteTeamInput, DeleteTeamOutput } from './dtos/delete-team.dto';
import { GetTeamInput, GetTeamOutput } from './dtos/get-team.dto';
import { GetTeamsInput, GetTeamsOutput } from './dtos/get-teams.dto';
import {
  NominateLeaderInput,
  NominateLeaderOutput,
} from './dtos/nominate-leader.dto';
import { UpdateTeamInput, UpdateTeamOutput } from './dtos/update-team.dto';
import { TeamRepository } from './team.repository';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamRepository)
    private readonly teamRepo: TeamRepository,
    @InjectRepository(UserRepository)
    private readonly userRepo: UserRepository,
  ) {}
  async getTeams(): Promise<GetTeamsOutput> {
    try {
      const findTeams = await this.teamRepo.find({
        order: { createdAt: 'DESC' },
        relations: {
          leader: true,
        },
      });

      return {
        ok: true,
        teams: findTeams,
      };
    } catch (error) {
      return {
        ok: false,
        error: '팀 리스트 조회에 실패했습니다.',
      };
    }
  }
  async getTeam({ id: teamId }: GetTeamInput): Promise<GetTeamOutput> {
    try {
      const team = await this.teamRepo.findTeam({ teamId });

      return {
        ok: true,
        team,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '팀 조회에 실패했습니다.',
      };
    }
  }
  async createTeam({ team }: CreateTeamInput): Promise<CreateTeamOutput> {
    try {
      await this.teamRepo.checkExistTeamName({ team });

      const newTeam = await this.teamRepo.save({ team });

      return {
        ok: true,
        team: newTeam,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '팀 생성에 실패했습니다.',
      };
    }
  }

  // async nominateLeader({
  //   id: teamId,
  //   userId,
  // }: NominateLeaderInput): Promise<NominateLeaderOutput> {
  //   try {
  //     const findTeam = await this.teamRepo.findTeam({ teamId });
  //     const findUser = await this.userRepo.findUser({ userId });

  //     if (findUser.team.id !== findTeam.id) {
  //       throw new Error('팀에 속하지 않는 유저를 팀장으로 지명할 수 없습니다.');
  //     }

  //     await this.teamRepo.save([{ id: teamId, leader: findUser }]);

  //     return {
  //       ok: true,
  //     };
  //   } catch (error) {
  //     return {
  //       ok: false,
  //       error: error.message || '팀장 지명에 실패했습니다.',
  //     };
  //   }
  // }

  async updateTeam({
    teamId,
    team,
    leaderId,
  }: UpdateTeamInput): Promise<UpdateTeamOutput> {
    try {
      const findTeam = await this.teamRepo.findTeam({
        teamId,
      });

      // 현재 팀명과 같을 경우는 유니크값인지 체크 안함
      if (findTeam.team !== team) {
        await this.teamRepo.checkExistTeamName({ team });
      }

      const findUser = await this.userRepo.findUser({ userId: leaderId });

      if (findUser.team.id !== findTeam.id) {
        throw new Error('팀에 속하지 않는 유저를 팀장으로 지명할 수 없습니다.');
      }

      if (findUser.team.leaderId !== findUser.id) {
        const isAnotherTeamLeader = await this.teamRepo.exist({
          where: {
            leader: {
              id: leaderId,
            },
          },
        });
        if (isAnotherTeamLeader) throw new Error('이미 다른 팀의 리더입니다.');
      }

      await this.teamRepo.save([{ id: teamId, team, leader: findUser }]);

      const updatedTeam = await this.teamRepo.findTeam({ teamId });

      return {
        ok: true,
        team: updatedTeam,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '팀 수정에 실패했습니다.',
      };
    }
  }
  async deleteTeam({ id: teamId }: DeleteTeamInput): Promise<DeleteTeamOutput> {
    try {
      const findTeam = await this.teamRepo.findTeam({
        teamId,
      });

      if (findTeam.users.length > 0) {
        throw new Error(
          '팀원이 없어야 삭제가 가능합니다. 다른 팀으로 옮겨주세요.',
        );
      }

      await this.teamRepo.delete({ id: teamId });
      return {
        ok: true,
        deletedTeamId: teamId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '팀 삭제에 실패했습니다.',
      };
    }
  }
}

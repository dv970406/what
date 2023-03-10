import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectionInput } from 'src/core/dtos/pagination.dto';
import { DB_TABLE } from 'src/core/variables/constants';
import { POSITION_CEO } from 'src/core/variables/position';
import { NotificationRepository } from 'src/notification/notification.repository';
import { User } from 'src/user/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { pubsub, TRIGGER_RECEIVE_NOTIFICATION } from 'src/utils/subscription';
import { LessThan, MoreThan } from 'typeorm';
import {
  ConfirmVacationInput,
  ConfirmVacationOutput,
} from './dtos/confirm-vacation.dto';
import {
  CreateVacationInput,
  CreateVacationOutput,
} from './dtos/create-vacation.dto';
import {
  DeleteVacationInput,
  DeleteVacationOutput,
} from './dtos/delete-vacation.dto';
import { GetUnConfirmedByMeVacationsOutput } from './dtos/get-unConfirmedByMeVacations.dto';
import { GetVacationInput, GetVacationOutput } from './dtos/get-vacation.dto';
import { GetVacationsOutput } from './dtos/get-vacations.dto';
import {
  UpdateVacationInput,
  UpdateVacationOutput,
} from './dtos/update-vacation.dto';
import { VacationsConnection } from './dtos/vacation-pagination.dto';
import { VacationRepository } from './vacation.repository';

@Injectable()
export class VacationService {
  constructor(
    @InjectRepository(VacationRepository)
    private readonly vacationRepo: VacationRepository,
    @InjectRepository(UserRepository)
    private readonly userRepo: UserRepository,
    @InjectRepository(NotificationRepository)
    private readonly notificationRepo: NotificationRepository,
  ) {}

  async getVacations(): Promise<GetVacationsOutput> {
    try {
      const todayMonth = new Date().getMonth();

      const beforeTwoMonth = new Date(new Date().setMonth(todayMonth - 2));
      const afterTwoMonth = new Date(new Date().setMonth(todayMonth + 2));

      const findVacations = await this.vacationRepo.find({
        order: { startDate: 'ASC' },
        relations: {
          user: {
            team: true,
            position: true,
          },
        },
        where: {
          startDate: MoreThan(beforeTwoMonth),
          endDate: LessThan(afterTwoMonth),
        },
      });

      return {
        ok: true,
        vacations: findVacations,
      };
    } catch (error) {
      return {
        ok: false,
        error: '?????? ????????? ????????? ??????????????????.',
      };
    }
  }
  async getUnConfirmedByMeVacations(
    loggedInUser: User,
  ): Promise<GetUnConfirmedByMeVacationsOutput> {
    try {
      let unConfirmedByMeVacations = await this.vacationRepo.find({
        // where: {
        //   startDate: MoreThan(new Date()),
        // },
        order: {
          createdAt: 'DESC',
        },
        relations: {
          user: {
            team: true,
            position: true,
          },
        },
      });

      //confirmed??? column??? ???????????? DB?????? ????????? ????????? ?????? ?????????
      // if (loggedInUser.position.position === POSITION_CEO) {
      //   unConfirmedByMeVacations = await this.vacationRepo.find({
      //     where: {
      //       startDate: MoreThan(new Date()),
      //       // confirmed: {
      //       //   byCeo: false,
      //       // },
      //     },
      //     order: {
      //       createdAt: 'ASC',
      //     },
      //   });
      // }

      const amICeo = loggedInUser.position.position === POSITION_CEO;
      if (amICeo) {
        unConfirmedByMeVacations = unConfirmedByMeVacations.filter(
          (vacation) => !vacation.confirmed.byCeo,
        );
      }
      // ?????? ?????? ???????????? ?????? manager????????? leader??? ?????? leader??? ?????? ???????????? ??? ??? ??????
      else if (loggedInUser.team.leaderId === loggedInUser.id && !amICeo) {
        // ????????? ?????? ?????? ?????? ???????????? ????????? ????????? ????????? ??? ?????????
        unConfirmedByMeVacations = unConfirmedByMeVacations.filter(
          (vacation) =>
            vacation.user.team.leaderId === loggedInUser.id &&
            !vacation.confirmed.byLeader,
        );
      } else if (loggedInUser.isManager && !amICeo) {
        unConfirmedByMeVacations = unConfirmedByMeVacations.filter(
          (vacation) => !vacation.confirmed.byManager,
        );
      }
      // unConfirmedByMeVacations=await this.vacationRepo.find({
      // ????????? ????????? ?????? ????????? ?????? ???????????? ?????? ???????????? ????????? ?????? ?????????. ?????? ??????????????? ?????? ????????? ????????? ????????????
      //   where: {
      //     startDate: MoreThan(new Date()),
      //     user: {
      //       team: {
      //         leaderId: loggedInUser.id,
      //       },
      //     },
      //     confirmed: {
      //       byLeader: false,
      //     },
      //   },
      //   order: {
      //     createdAt: 'ASC',
      //   },
      // });

      return {
        ok: true,
        vacations: unConfirmedByMeVacations,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '????????? ????????? ????????? ??? ????????????.',
      };
    }
  }
  async getVacation({
    id: vacationId,
  }: GetVacationInput): Promise<GetVacationOutput> {
    try {
      const vacation = await this.vacationRepo.findVacation({ vacationId });

      return {
        ok: true,
        vacation,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async createVacation(
    loggedInUser: User,
    { startDate, endDate, isHalf }: CreateVacationInput,
  ): Promise<CreateVacationOutput> {
    try {
      if (!startDate || !endDate) {
        throw new Error('????????? ??????????????????.');
      }
      if (startDate > endDate) {
        throw new Error('????????? ????????? ??????????????????.');
      }

      const duration = await this.vacationRepo.getDuration({
        startDate,
        endDate,
        isHalf,
      });

      const remainingVacation = +loggedInUser.availableVacation - +duration;

      if (remainingVacation < 0) {
        throw new Error('?????? ????????? ????????????.');
      }

      let confirmed = {
        byManager: false,
        byCeo: false,
        byLeader: false,
      };
      if (loggedInUser.position.position === POSITION_CEO) {
        confirmed.byCeo = true;
      } else if (loggedInUser.team.leaderId === loggedInUser.id) {
        confirmed.byLeader = true;
      } else if (loggedInUser.isManager) {
        confirmed.byManager = true;
      }
      const newVacation = await this.vacationRepo.save({
        startDate,
        endDate,
        duration,
        user: loggedInUser,
        isHalf,
        confirmed,
      });

      await this.userRepo.save([
        {
          id: loggedInUser.id,
          availableVacation: remainingVacation,
        },
      ]);

      return {
        ok: true,
        vacation: newVacation,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async confirmVacation(
    loggedInUser: User,
    { id: vacationId }: ConfirmVacationInput,
  ): Promise<ConfirmVacationOutput> {
    try {
      const findVacation = await this.vacationRepo.findVacation({ vacationId });

      if (
        !loggedInUser.isManager &&
        findVacation.user.team.leaderId !== loggedInUser.id &&
        loggedInUser.position.position !== POSITION_CEO
      ) {
        throw new Error('????????? ????????? ????????? ????????????.');
      }

      if (loggedInUser.position.position === POSITION_CEO) {
        findVacation.confirmed.byCeo = true;
      } else if (findVacation.user.team.leaderId === loggedInUser.id) {
        findVacation.confirmed.byLeader = true;
      } else if (loggedInUser.isManager) {
        findVacation.confirmed.byManager = true;
      }

      const confirmedVacation = await this.vacationRepo.save(findVacation);

      const newNotification = await this.notificationRepo.save({
        user: confirmedVacation.user,
        confirmedByWho: loggedInUser,
        confirmedVacation: confirmedVacation,
      });
      pubsub.publish(TRIGGER_RECEIVE_NOTIFICATION, {
        receiveNotification: {
          ok: true,
          edge: {
            node: {
              ...newNotification,
            },
            cursor: confirmedVacation.createdAt,
          },
        }, //confirmedVacation,
      });

      return {
        ok: true,
        vacation: confirmedVacation,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async updateVacation(
    loggedInUser: User,
    { vacationId, startDate, endDate, isHalf }: UpdateVacationInput,
  ): Promise<UpdateVacationOutput> {
    try {
      const findVacation = await this.vacationRepo.findVacation({
        vacationId,
      });

      if (loggedInUser.id !== findVacation.userId) {
        throw new Error('????????? ???????????? ????????????.');
      }

      const duration = await this.vacationRepo.getDuration({
        startDate,
        endDate,
        isHalf,
      });

      let recoveryVacation = 0;
      if (duration < findVacation.duration) {
        recoveryVacation += findVacation.duration - duration;
      } else if (duration > findVacation.duration) {
        recoveryVacation = findVacation.duration - duration;
      }

      // ?????? ??????????????? ??????????????? ?????? ????????? ?????? ??? ??????????????? ??????????????? ?????? ????????? ???????????? ??????.
      await this.userRepo.save([
        {
          id: loggedInUser.id,
          availableVacation: +loggedInUser.availableVacation + recoveryVacation,
        },
      ]);

      if (startDate) {
        findVacation.startDate = startDate;
      }
      if (endDate) {
        findVacation.endDate = endDate;
      }
      // ?????? isHalf??? false??? ?????? ??????
      if (isHalf === false) {
        findVacation.isHalf = isHalf;
      }
      if (startDate && endDate) {
        findVacation.duration = duration;
      }

      const targetUser = await this.userRepo.findUser({
        userId: loggedInUser.id,
      });
      findVacation.user = targetUser;

      // ????????? ?????? ?????? ??????
      findVacation.confirmed.byCeo = false;
      findVacation.confirmed.byLeader = false;
      findVacation.confirmed.byManager = false;

      const updatedVacation = await this.vacationRepo.save(findVacation);

      const notificationsIdOfVacation = await this.notificationRepo.find({
        where: {
          confirmedVacation: {
            id: updatedVacation.id,
          },
        },
        select: {
          id: true,
        },
      });

      // ?????? ??? ??? ????????? ???????????? ?????? Notifications ??????
      await this.notificationRepo.delete({
        confirmedVacation: { id: updatedVacation.id },
      });
      return {
        ok: true,
        vacation: updatedVacation,
        notificationsIdOfVacation: notificationsIdOfVacation.map(
          (notification) => notification.id,
        ),
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }

  async deleteVacation(
    loggedInUser: User,
    { id: vacationId }: DeleteVacationInput,
  ): Promise<DeleteVacationOutput> {
    try {
      const findVacation = await this.vacationRepo.findVacation({
        vacationId,
      });

      if (loggedInUser.id !== findVacation.userId) {
        throw new Error('????????? ???????????? ????????????.');
      }

      const remaniningVacation =
        +loggedInUser.availableVacation + +findVacation.duration;

      await this.vacationRepo.delete({ id: vacationId });
      await this.userRepo.save([
        {
          id: loggedInUser.id,
          availableVacation: remaniningVacation,
        },
      ]);
      return {
        ok: true,
        deletedVacationId: vacationId,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message || '?????? ????????? ??????????????????.',
      };
    }
  }
}

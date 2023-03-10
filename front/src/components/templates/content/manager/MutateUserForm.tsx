import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Section } from "../../../atomics/sections/sections";
import { SectionTitle, SubTitle } from "../../../atomics/typographys/titles";
import { theme } from "../../../../css/theme";
import { ColumnBox } from "../../../atomics/boxes/Boxes";
import { TextInput } from "../../../molecules/inputs/TextInput";
import { SubmitHandler, useForm } from "react-hook-form";
import { SubmitButton } from "../../../atomics/buttons/buttons";
import {
  faCalendar,
  faMailbox,
  faTag,
  faUsers,
  faWaffle,
} from "@fortawesome/pro-solid-svg-icons";
import { Form } from "../../../atomics/form/Form";
import { useGetPositions } from "../../../../client/position/GetPositions.client";
import { useGetTeams } from "../../../../client/team/GetTeams.client";
import Select from "../../../molecules/inputs/Select";
import { useGetManagerUser } from "../../../../client/manager/GetManagerUser.client";
import { Radio } from "../../../molecules/inputs/Radio";
import { isInt } from "@fullcalendar/core/internal";
import { useDeleteUser } from "../../../../client/manager/DeleteUser.client";
import { useUpdateUser } from "../../../../client/manager/UpdateUser.client";
import { Checkbox } from "../../../molecules/inputs/Checkbox";
import FormTitle from "../../../molecules/form/FormTitle";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";
import { POSITION } from "../../../../utils/constants/user.constant";

interface IMutateUserFormValue {
  name: string;
  email: string;
  joinDate: string;
  position: string;
  team: string;
  availableVacation: string;
}
interface IMutateUserForm {
  clickedUserId: string;
  setClickedUserId: Dispatch<SetStateAction<string>>;
  myPosition?: string;
  myId?: string;
}
const MutateUserForm = ({
  clickedUserId,
  setClickedUserId,
  myPosition,
  myId,
}: IMutateUserForm) => {
  const { user } = useGetManagerUser(clickedUserId);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<IMutateUserFormValue>({
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      setValue("name", user?.name);
      setValue("email", user?.email);
      setValue("position", user?.position.position);
      setValue("team", user?.team.team);
      setValue("joinDate", user?.joinDate.substring(0, 10));
      setValue("availableVacation", user?.availableVacation);
    } else {
      setClickedUserId("");
      reset();
    }
  }, [user]);

  const {
    name: watchName,
    email: watchEmail,
    joinDate: watchJoinDate,
    position: watchPosition,
    team: watchTeam,
  } = watch();

  const { positionsExceptCeo: positions } = useGetPositions();
  const { teams } = useGetTeams();
  const { updateUserMutation, updateUserLoading } = useUpdateUser();

  const [isManager, setIsManager] = useState<boolean>();

  const isSubmitDisabled =
    !!errors.email ||
    !!errors.name ||
    !watchEmail ||
    !watchName ||
    !watchJoinDate ||
    !watchPosition ||
    !watchTeam;

  useEffect(() => {
    setIsManager(user?.isManager);
  }, [user]);
  const onSubmit: SubmitHandler<IMutateUserFormValue> = ({
    name,
    email,
    joinDate,
    position,
    team,
    availableVacation,
  }) => {
    if (updateUserLoading) return;
    const positionId = positions?.find(
      (existPosition) => existPosition.position === position
    )?.id;
    const teamId = teams?.find((existTeam) => existTeam?.team === team)?.id;

    if (!positionId || !teamId) return;

    updateUserMutation({
      userId: clickedUserId,
      name,
      email,
      joinDate,
      positionId,
      teamId,
      availableVacation,
      ...(myPosition === POSITION["??????"] && { isManager }),
    });
  };
  const { deleteUserMutation, deleteUserLoading } = useDeleteUser();

  const handleDeleteUser = () => {
    if (deleteUserLoading) return;
    deleteUserMutation({ id: clickedUserId });
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        ...(!clickedUserId && {
          opacity: theme.disabled.opacity,
          pointerEvents: "none",
        }),
      }}
    >
      <FormTitle formTitle="?????? ??????" />
      <TextInput
        icon={faTag}
        label="??????"
        placeholder="??????"
        register={register("name", {
          required: {
            value: true,
            message: "????????? ???????????????.",
          },
          minLength: {
            value: 2,
            message: "????????? 2?????? ???????????????.",
          },
          maxLength: {
            value: 6,
            message: "????????? 6?????? ???????????????.",
          },
        })}
        errorMessage={errors?.name && errors?.name.message}
      />
      <TextInput
        icon={faMailbox}
        label="?????????"
        type="email"
        placeholder="email@timmanage.com"
        register={register("email", {
          required: {
            value: true,
            message: "???????????? ???????????????.",
          },
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: "????????? ????????? ????????????.",
          },
        })}
        errorMessage={errors?.email && errors?.email.message}
      />

      <Select
        icon={faWaffle}
        errorMessage={errors.position && errors.position.message}
        label="??????"
        placeholder="??????"
        listName="positions"
        list={positions?.map((position) => (
          <option key={position?.id} value={position?.position} />
        ))}
        register={register("position", {
          required: {
            value: true,
            message: "?????? ????????? ???????????????.",
          },
        })}
      />

      <Select
        icon={faUsers}
        errorMessage={errors.team && errors.team.message}
        label="???"
        placeholder="???"
        listName="teams"
        list={teams?.map((team) => (
          <option key={team?.id} value={team?.team} />
        ))}
        register={register("team", {
          required: {
            value: true,
            message: "??? ????????? ???????????????.",
          },
        })}
      />

      <TextInput
        icon={faCalendar}
        label="?????????"
        type="date"
        placeholder="YYYY-MM-DD"
        register={register("joinDate", {
          required: { value: true, message: "???????????? ??????????????????." },
        })}
        errorMessage={errors.joinDate && errors.joinDate.message}
      />

      <TextInput
        icon={faCalendar}
        label="?????? ??????"
        type="number"
        step={0.5}
        placeholder="????????????"
        register={register("availableVacation", {
          required: {
            value: true,
            message: "?????? ????????? ???????????????.",
          },
          min: {
            value: 0,
            message: "????????? 0??? ???????????????.",
          },
          max: {
            value: 30,
            message: "????????? 30??? ???????????????.",
          },
        })}
        errorMessage={
          errors?.availableVacation && errors?.availableVacation.message
        }
      />

      {myPosition === POSITION["??????"] && (
        <Checkbox
          id="isManager"
          defaultChecked={isManager}
          text="????????? ??????"
          onClick={() => setIsManager((prev) => !prev)}
        />
      )}
      <div
        style={{ display: "flex", gap: theme.spacing.sm, marginTop: "auto" }}
      >
        <EndSubmitButton
          onClick={handleSubmit(onSubmit)}
          disabled={updateUserLoading || isSubmitDisabled}
          text="??????"
        />

        <EndSubmitButton
          onClick={handleDeleteUser}
          disabled={deleteUserLoading || !clickedUserId || user?.id === myId}
          text="??????"
        />
      </div>
    </Form>
  );
};

export default MutateUserForm;

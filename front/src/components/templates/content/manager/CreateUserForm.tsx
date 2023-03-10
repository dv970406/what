import { SubTitle } from "../../../atomics/typographys/titles";
import { theme } from "../../../../css/theme";
import { ColumnBox } from "../../../atomics/boxes/Boxes";
import { TextInput } from "../../../molecules/inputs/TextInput";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  faCalendar,
  faMailbox,
  faMailBulk,
  faTag,
  faUsers,
  faWaffle,
} from "@fortawesome/pro-solid-svg-icons";
import { Form } from "../../../atomics/form/Form";
import { useCreateUser } from "../../../../client/manager/CreateUser.client";
import { useGetPositions } from "../../../../client/position/GetPositions.client";
import { useGetTeams } from "../../../../client/team/GetTeams.client";
import Select from "../../../molecules/inputs/Select";
import FormTitle from "../../../molecules/form/FormTitle";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";
import { closeModal } from "../../../../utils/modal/controlModal";

interface ICreateUserFormValue {
  name: string;
  email: string;
  joinDate: Date;
  position: string;
  team: string;
}
interface ICreateUserForm {}
const CreateUserForm = ({}: ICreateUserForm) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<ICreateUserFormValue>({ mode: "onChange" });

  const {
    name: watchName,
    email: watchEmail,
    joinDate: watchJoinDate,
    position: watchPosition,
    team: watchTeam,
  } = watch();
  const { positionsExceptCeo: positions } = useGetPositions();
  const { teams } = useGetTeams();
  const { createUserMutation, createUserLoading } = useCreateUser();

  const onSubmit: SubmitHandler<ICreateUserFormValue> = ({
    name,
    email,
    joinDate,
    position,
    team,
  }) => {
    if (createUserLoading) return;
    const positionId = positions?.find(
      (existPosition) => existPosition.position === position
    )?.id;
    const teamId = teams?.find((existTeam) => existTeam.team === team)?.id;

    if (!positionId || !teamId) return;
    createUserMutation({
      name,
      email,
      joinDate,
      positionId,
      teamId,
    });

    closeModal(`create-user`);
  };

  const isSubmitDisabled =
    !!errors.email ||
    !!errors.name ||
    !watchEmail ||
    !watchName ||
    !watchJoinDate ||
    !watchPosition ||
    !watchTeam;

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormTitle formTitle="??? ??????" />
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

        <EndSubmitButton
          onClick={handleSubmit(onSubmit)}
          disabled={createUserLoading || isSubmitDisabled}
          text={"?????? ??????"}
        />
      </Form>
    </>
  );
};

export default CreateUserForm;

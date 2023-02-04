import React from "react";
import { Section } from "../../../atomics/sections/sections";
import {
  LabelTitle,
  SectionTitle,
  SubTitle,
} from "../../../atomics/typographys/titles";
import { theme } from "../../../../css/theme";
import { GapBox } from "../../../molecules/boxes/Boxes";
import { TextInput } from "../../../molecules/inputs/Inputs";
import { SubmitHandler, useForm } from "react-hook-form";
import { SubmitButton } from "../../../atomics/buttons/buttons";
import {
  faCalendar,
  faMailbox,
  faMailBulk,
  faTag,
  faUsers,
  faWaffle,
} from "@fortawesome/pro-solid-svg-icons";
import { Form } from "../../../atomics/form/Form";
import { useCreateUser } from "../../../../client/user/CreateUser.client";
import { useGetPositions } from "../../../../client/position/GetPositions.client";
import { useGetTeams } from "../../../../client/team/GetTeams.client";
import Select from "../../../molecules/inputs/Select";

interface ICreateUserForm {
  name: string;
  email: string;
  joinDate: Date;
  position: string;
  team: string;
}
const CreateUser = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<ICreateUserForm>({ mode: "onChange" });

  const {
    name: watchName,
    email: watchEmail,
    joinDate: watchJoinDate,
    position: watchPosition,
    team: watchTeam,
  } = watch();
  const { positions } = useGetPositions();
  const { teams } = useGetTeams();
  const { createUserMutation, createUserLoading } = useCreateUser();

  const onSubmit: SubmitHandler<ICreateUserForm> = ({
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
  };

  const isSubmitAvailable =
    !!errors.email ||
    !!errors.name ||
    !watchEmail ||
    !watchName ||
    !watchJoinDate ||
    !watchPosition ||
    !watchTeam;

  return (
    <Section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.xl,
        background: theme.bgColors.gradient,
        width: 500,
        borderRadius: theme.borderRadius.md,
      }}
    >
      <GapBox>
        <SectionTitle>New User</SectionTitle>
        <SubTitle>필수</SubTitle>
      </GapBox>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          icon={faTag}
          label="이름"
          placeholder="이름"
          register={register("name", {
            required: {
              value: true,
              message: "이름은 필수입니다.",
            },
            minLength: {
              value: 2,
              message: "이름은 2글자 이상입니다.",
            },
            maxLength: {
              value: 6,
              message: "이름은 6글자 이하입니다.",
            },
          })}
          errorMessage={errors?.name && errors?.name.message}
        />
        <TextInput
          icon={faMailbox}
          label="이메일"
          type="email"
          placeholder="email@timmanage.com"
          register={register("email", {
            required: {
              value: true,
              message: "이메일은 필수입니다.",
            },
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "이메일 형식이 아닙니다.",
            },
          })}
          errorMessage={errors?.email && errors?.email.message}
        />

        <Select
          icon={faWaffle}
          errorMessage={errors.position && errors.position.message}
          label="직책"
          listName="positions"
          list={positions?.map((position) => (
            <option key={position.id} value={position.position} />
          ))}
          register={register("position", {
            required: {
              value: true,
              message: "직책 선택은 필수입니다.",
            },
          })}
        />

        <Select
          icon={faUsers}
          errorMessage={errors.team && errors.team.message}
          label="팀"
          listName="teams"
          list={teams?.map((team) => (
            <option key={team.id} value={team.team} />
          ))}
          register={register("team", {
            required: {
              value: true,
              message: "팀 선택은 필수입니다.",
            },
          })}
        />

        <TextInput
          icon={faCalendar}
          label="입사일"
          type="date"
          placeholder="YYYY-MM-DD"
          register={register("joinDate", {
            required: { value: true, message: "입사일을 선택해주세요." },
          })}
          errorMessage={errors.joinDate && errors.joinDate.message}
        />

        <SubmitButton
          onClick={handleSubmit(onSubmit)}
          disabled={createUserLoading || isSubmitAvailable}
        >
          직원 추가
        </SubmitButton>
      </Form>
    </Section>
  );
};

export default CreateUser;
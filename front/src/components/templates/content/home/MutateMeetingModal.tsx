import { faRocket } from "@fortawesome/pro-solid-svg-icons";
import React, { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDeleteMeeting } from "../../../../client/meeting/DeleteMeeting.client";
import { useGetMeeting } from "../../../../client/meeting/GetMeeting.client";
import { useUpdateMeeting } from "../../../../client/meeting/UpdateMeeting.client";
import { theme } from "../../../../css/theme";
import { Form } from "../../../atomics/form/Form";
import { ColumnBox } from "../../../atomics/boxes/Boxes";
import { TextInput } from "../../../molecules/inputs/TextInput";
import { IMeetingFormValue } from "./CreateScheduleModal";
import SelectUsers from "../../../organisms/content/home/SelectUsers";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";
import { closeModal } from "../../../../utils/modal/controlModal";
import { MODAL_NAME } from "../../../../utils/constants/modal.constant";
import { useSelectUsers } from "../../../../client/user/SelectUsers.client";
import PortalModal from "../../../../utils/modal/PortalModal";

interface IMutateMeetingModal {
  scheduleId: string;
}

const MutateMeetingModal = ({ scheduleId }: IMutateMeetingModal) => {
  const { meeting } = useGetMeeting(scheduleId);

  const prevAttendeesIds =
    meeting?.attendees.map((attendee) => attendee.id) || [];
  const [attendeesIds, setAttendeesId] = useState<string[]>(prevAttendeesIds);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
  } = useForm<IMeetingFormValue>({
    mode: "onChange",
  });

  useEffect(() => {
    if (!meeting?.title) return;
    setValue("title", meeting?.title);
  }, [meeting]);

  const { updateMeetingMutation, updateMeetingLoading } = useUpdateMeeting();
  const { deleteMeetingMutation, deleteMeetingLoading } = useDeleteMeeting();

  const onSubmit: SubmitHandler<IMeetingFormValue> = ({ title }) => {
    if (updateMeetingLoading || !scheduleId) return;
    updateMeetingMutation({
      meetingId: scheduleId,
      title,
      attendeesIds,
    });

    closeModal(MODAL_NAME.MUTATE_MEETING);
  };

  const handleDeleteVacation = () => {
    if (deleteMeetingLoading || !scheduleId) return;
    deleteMeetingMutation({ id: scheduleId });

    closeModal(MODAL_NAME.MUTATE_MEETING);
  };

  return (
    <PortalModal modalName={MODAL_NAME.MUTATE_MEETING}>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          justifyContent: "space-between",
          height: 400,
        }}
        method="dialog"
      >
        <ColumnBox>
          <div>
            <TextInput
              label="??????"
              register={register("title", {
                required: {
                  value: true,
                  message: "????????? ???????????????.",
                },
                minLength: {
                  value: 2,
                  message: "????????? 2?????? ???????????????.",
                },
                maxLength: {
                  value: 15,
                  message: "????????? 15?????? ???????????????.",
                },
              })}
              defaultValue={meeting?.title}
              type="text"
              icon={faRocket}
              placeholder="???????????? ???????????????."
              errorMessage={errors?.title && errors?.title.message}
            />
          </div>

          <SelectUsers
            prevAttendees={meeting?.attendees as any}
            setAttendeesId={setAttendeesId}
          />
        </ColumnBox>
        <div style={{ display: "flex", gap: theme.spacing.sm }}>
          <EndSubmitButton
            onClick={handleSubmit(onSubmit)}
            disabled={updateMeetingLoading}
            text="??????"
          />

          <EndSubmitButton
            onClick={handleDeleteVacation}
            disabled={deleteMeetingLoading}
            text="??????"
          />
        </div>
      </Form>
    </PortalModal>
  );
};

export default MutateMeetingModal;

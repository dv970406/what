import { faRocket } from "@fortawesome/pro-solid-svg-icons";
import { DateRangeInput, DateSelectArg } from "@fullcalendar/core";
import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useCreateMeeting } from "../../../../client/meeting/CreateMeeting.client";
import { useCreateVacation } from "../../../../client/vacation/CreateVacation.client";
import { theme } from "../../../../css/theme";
import { SCHEDULES } from "../../../../utils/constants/schedule.constant";
import { ModalContext } from "../../../../utils/contexts/modal.context";
import { endDateFormatForDb } from "../../../../utils/time/time";
import { SubmitButton } from "../../../atomics/buttons/buttons";
import { Form } from "../../../atomics/form/Form";
import { GapBox } from "../../../atomics/boxes/Boxes";
import { TextInput } from "../../../molecules/inputs/TextInput";
import { Radio } from "../../../molecules/inputs/Radio";
import Modal from "../../../templates/Modal";
import SelectUsers from "../../../organisms/content/home/SelectUsers";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";

interface ICreateScheduleModal {
  selectedDate: DateRangeInput;
}
export interface IMeetingFormValue {
  title: string;
}

const CreateScheduleModal = ({
  selectedDate: { start, end },
}: ICreateScheduleModal) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IMeetingFormValue>({
    mode: "onChange",
  });
  const { createVacationMutation, createVacationLoading } = useCreateVacation();
  const { createMeetingMutation, createMeetingLoading } = useCreateMeeting();
  const { setCurrentModal } = useContext(ModalContext);

  const [kindOfSchedule, setKindOfSchedule] = useState(SCHEDULES.VACATION);

  const [attendeesIds, setAttendeesId] = useState<string[]>([]);

  const onSubmit: SubmitHandler<IMeetingFormValue> = ({ title }) => {
    if (!start || !end) return;
    if (kindOfSchedule === SCHEDULES.VACATION) {
      if (createVacationLoading) return;
      const isHalf = window.confirm("반차입니까?");

      createVacationMutation({
        startDate: start,
        endDate: end,
        isHalf,
      });
    } else if (kindOfSchedule === SCHEDULES.MEETING) {
      if (createMeetingLoading) return;
      createMeetingMutation({
        title,
        startTime: start,
        endTime: end,
        attendeesIds,
      });
    }
    setCurrentModal("");
  };

  return (
    <Modal>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <GapBox>
          <fieldset
            style={{
              display: "flex",
              justifyContent: "center",
              border: "none",
              gap: theme.spacing.xl,
            }}
          >
            <Radio
              name="schedule"
              value={SCHEDULES.VACATION}
              onClick={() => setKindOfSchedule(SCHEDULES.VACATION)}
              text="휴가"
              defaultChecked={true}
            />
            <Radio
              name="schedule"
              value={SCHEDULES.MEETING}
              onClick={() => setKindOfSchedule(SCHEDULES.MEETING)}
              text={"회의"}
            />
          </fieldset>

          {kindOfSchedule === SCHEDULES.MEETING && (
            <>
              <div>
                <TextInput
                  label="제목"
                  register={register("title", {
                    required: {
                      value: true,
                      message: "제목은 필수입니다.",
                    },
                    minLength: {
                      value: 2,
                      message: "제목은 2글자 이상입니다.",
                    },
                    maxLength: {
                      value: 15,
                      message: "제목은 15글자 이하입니다.",
                    },
                  })}
                  type="text"
                  icon={faRocket}
                  placeholder="회의명을 입력하세요."
                  errorMessage={errors?.title && errors?.title.message}
                />
              </div>
              <div>
                <SelectUsers setAttendeesId={setAttendeesId} />
              </div>
            </>
          )}
        </GapBox>

        <EndSubmitButton onClick={handleSubmit(onSubmit)} text="신청" />
      </Form>
    </Modal>
  );
};

export default CreateScheduleModal;

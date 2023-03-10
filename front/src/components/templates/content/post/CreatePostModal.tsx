import { faRocket } from "@fortawesome/pro-solid-svg-icons";
import React, { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useDeleteMeeting } from "../../../../client/meeting/DeleteMeeting.client";
import { useGetMeeting } from "../../../../client/meeting/GetMeeting.client";
import { useUpdateMeeting } from "../../../../client/meeting/UpdateMeeting.client";
import { theme } from "../../../../css/theme";
import { ModalContext } from "../../../../utils/contexts/modal.context";
import { SubmitButton } from "../../../atomics/buttons/buttons";
import { Form } from "../../../atomics/form/Form";
import { ColumnBox } from "../../../atomics/boxes/Boxes";
import { TextInput } from "../../../molecules/inputs/TextInput";
import SelectUsers from "../../../organisms/content/home/SelectUsers";
import { EndSubmitButton } from "../../../molecules/buttons/Buttons";
import CreatePostForm from "./CreatePostForm";
import { MODAL_NAME } from "../../../../utils/constants/modal.constant";
import PortalModal from "../../../../utils/modal/PortalModal";

interface ICreatePostModal {}

const CreatePostModal = ({}: ICreatePostModal) => {
  return (
    <PortalModal modalName={MODAL_NAME.CREATE_POST}>
      <CreatePostForm />
    </PortalModal>
  );
};

export default CreatePostModal;

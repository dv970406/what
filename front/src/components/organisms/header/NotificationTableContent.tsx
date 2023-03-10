import {
  faBackpack,
  faCrown,
  faEllipsisVertical,
  faRocket,
} from "@fortawesome/pro-solid-svg-icons";
import { graphql } from "babel-plugin-relay/macro";
import React, { useState } from "react";
import { useFragment, usePaginationFragment } from "react-relay";
import { useNavigate } from "react-router-dom";
import { ReadNotificationMutation$variables } from "../../../client/notification/__generated__/ReadNotificationMutation.graphql";
import { theme } from "../../../css/theme";
import {
  getElaspedDay,
  getKoreanDateFormat,
  vacationDateFormat,
} from "../../../utils/time/time";
import { ColumnBox, RowBox } from "../../atomics/boxes/Boxes";

import { ListItem } from "../../atomics/sections/sections";
import {
  AccentText,
  DateText,
  SectionText,
} from "../../atomics/typographys/texts";
import { SubTitle } from "../../atomics/typographys/titles";
import { BoxIcon } from "../../molecules/icons/Icons";
import { NotificationTableContent_notification$key } from "./__generated__/NotificationTableContent_notification.graphql";

interface INotificationTableContent {
  notification: NotificationTableContent_notification$key;
  readNotificationLoading: boolean;
  readNotificationMutation: (
    variables: ReadNotificationMutation$variables
  ) => void;
}

const notificationTableContentFragment = graphql`
  fragment NotificationTableContent_notification on Notification {
    id
    confirmedVacation {
      id
      startDate
      endDate
      duration
      confirmed {
        byCeo
        byLeader
        byManager
      }
      createdAt
    }
    confirmedByWho {
      id
      name
    }
    isRead
  }
`;
const NotificationTableContent = ({
  notification,
  readNotificationLoading,
  readNotificationMutation,
}: INotificationTableContent) => {
  const {
    id: notificationId,
    confirmedByWho,
    confirmedVacation,
    isRead,
  } = useFragment(notificationTableContentFragment, notification);
  const confirmedDate = getElaspedDay(confirmedVacation.createdAt);

  const handleReadNotification = () => {
    if (readNotificationLoading) return;

    readNotificationMutation({
      notificationId,
    });
  };

  console.log(notificationId);
  return (
    <ListItem
      style={{
        cursor: "pointer",
        opacity: isRead ? theme.disabled.opacity : 1,
      }}
      onClick={handleReadNotification}
    >
      <div
        style={{
          display: "flex",
          gap: theme.spacing.lg,
          justifyContent: "space-between",
        }}
      >
        <BoxIcon icon={faRocket} size="lg" bgColor={theme.bgColors.purple} />

        <ColumnBox style={{ placeSelf: "flex-end" }} gap={theme.spacing.sm}>
          <DateText style={{ textAlign: "right" }}>
            {vacationDateFormat(confirmedVacation?.startDate as Date)}
            {` ~ `}
            {vacationDateFormat(confirmedVacation?.endDate as Date)}(
            <AccentText style={{ textAlign: "right" }}>
              {confirmedVacation?.duration}???
            </AccentText>
            )
          </DateText>

          <SectionText style={{ textAlign: "right" }}>
            {confirmedByWho?.name}?????? ??????????????????!
          </SectionText>

          <RowBox style={{ placeSelf: "flex-end", width: "auto" }}>
            {confirmedVacation?.confirmed.byCeo ? (
              <SubTitle style={{ color: theme.colors.green }}>??????</SubTitle>
            ) : (
              <SubTitle style={{ textDecoration: "line-through" }}>
                ??????
              </SubTitle>
            )}
            {confirmedVacation?.confirmed.byManager ? (
              <SubTitle style={{ color: theme.colors.green }}>?????????</SubTitle>
            ) : (
              <SubTitle style={{ textDecoration: "line-through" }}>
                ?????????
              </SubTitle>
            )}
            {confirmedVacation?.confirmed.byLeader ? (
              <SubTitle style={{ color: theme.colors.green }}>??????</SubTitle>
            ) : (
              <SubTitle style={{ textDecoration: "line-through" }}>
                ??????
              </SubTitle>
            )}
          </RowBox>
          <SubTitle style={{ textAlign: "right" }}>{confirmedDate}</SubTitle>
        </ColumnBox>
      </div>
    </ListItem>
  );
};

export default React.memo(NotificationTableContent);

import styled from "@emotion/styled";

export const MainText = styled.p(({ theme, color }) => ({
  color: color ?? theme.colors.white,
  fontSize: theme.fonts.md,
  fontWeight: theme.bold.sm,
}));

export const SubText = styled.span(({ theme }) => ({
  color: theme.colors.white,
  fontSize: theme.fonts.md,
  fontWeight: theme.bold.sm,
}));

export const SectionText = styled.span(({ theme }) => ({
  color: theme.colors.white,
  fontSize: theme.fonts.sm,
  fontWeight: theme.bold.md,
}));

export const ErrorText = styled.span(({ theme }) => ({
  color: theme.colors.red,
  fontSize: theme.fonts.md,
  fontWeight: theme.bold.md,
}));

export const DateText = styled.span(({ theme }) => ({
  color: theme.colors.blue,
  fontSize: theme.fonts.sm,
  fontWeight: theme.bold.md,
}));
export const AccentText = styled.span(({ theme }) => ({
  color: theme.colors.green,
  fontSize: theme.fonts.sm,
  fontWeight: theme.bold.lg,
}));

import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTooltip = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

export const BillingChartTooltip = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <StyledTooltip>
    <strong>{label}</strong>: {value}
  </StyledTooltip>
);

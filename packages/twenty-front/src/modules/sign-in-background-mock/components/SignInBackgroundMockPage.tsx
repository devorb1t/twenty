import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

const MOCK_COMPANIES = [
  { name: 'Anthropic', domain: 'anthropic.com', employees: 1100, city: 'San Francisco' },
  { name: 'Google', domain: 'google.com', employees: 72000, city: 'Mountain View' },
  { name: 'Facebook', domain: 'facebook.com', employees: 87000, city: 'Menlo Park' },
  { name: 'Netflix', domain: 'netflix.com', employees: 3000, city: 'Paris' },
  { name: 'Microsoft', domain: 'microsoft.com', employees: 221000, city: 'Redmond' },
  { name: 'Libeo', domain: 'libeo.io', employees: 50, city: 'Paris' },
  { name: 'Airbnb', domain: 'airbnb.com', employees: 6000, city: 'San Francisco' },
  { name: 'Claap', domain: 'claap.io', employees: 7, city: 'Seattle' },
  { name: 'Algolia', domain: 'algolia.com', employees: 250, city: 'Palo Alto' },
  { name: 'Samsung', domain: 'samsung.com', employees: 400000, city: 'Gyeonggi-do' },
  { name: 'Hasura', domain: 'hasura.io', employees: 17000, city: 'San Francisco' },
  { name: 'Wework', domain: 'wework.com', employees: 2000, city: 'New York' },
  { name: 'Linkedin', domain: 'linkedin.com', employees: 20000, city: 'San Francisco' },
];

const COLUMNS = ['Name', 'Domain', 'Employees', 'Address'];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  height: 40px;
  padding: 0 ${themeCssVariables.spacing(2)};
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
`;

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const StyledTableHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-shrink: 0;
  height: 32px;
`;

const StyledColumnHeader = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: 0 ${themeCssVariables.spacing(2)};
  width: 180px;
  flex-shrink: 0;
`;

const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  height: 32px;
  flex-shrink: 0;
`;

const StyledCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing(2)};
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 180px;
  flex-shrink: 0;
`;

const StyledCheckboxCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: center;
  width: 32px;
  flex-shrink: 0;
`;

const StyledCheckbox = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 14px;
  width: 14px;
`;

export const SignInBackgroundMockPage = () => {
  return (
    <StyledContainer>
      <StyledHeader>Companies</StyledHeader>
      <StyledTable>
        <StyledTableHeader>
          <StyledCheckboxCell>
            <StyledCheckbox />
          </StyledCheckboxCell>
          {COLUMNS.map((column) => (
            <StyledColumnHeader key={column}>{column}</StyledColumnHeader>
          ))}
        </StyledTableHeader>
        {MOCK_COMPANIES.map((company) => (
          <StyledRow key={company.name}>
            <StyledCheckboxCell>
              <StyledCheckbox />
            </StyledCheckboxCell>
            <StyledCell>{company.name}</StyledCell>
            <StyledCell>{company.domain}</StyledCell>
            <StyledCell>{company.employees.toLocaleString()}</StyledCell>
            <StyledCell>{company.city}</StyledCell>
          </StyledRow>
        ))}
      </StyledTable>
    </StyledContainer>
  );
};

import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'next/router';
import { setOrganization, setKeys } from 'lib/store';
import { EVENT_TYPES } from 'lib/event-types';
import { useNotification } from 'utils/hooks/useNotification';
import { useGetOrgsQuery } from 'rtk-query/organization';
import OrgIcon from 'assets/icons/OrgIcon';
import { Provider } from 'react-redux';
import { store } from '../../../store';
import { ErrorBoundary, FormControl, FormGroup, MenuItem, useTheme, NoSsr } from '@layer5/sistent';
import {
  OrgName,
  StyledSelect,
  StyledFormControlLabel,
  StyledTextField,
  ErrorSectionContent,
  StyledTypography,
  StyledFormButton,
} from './styles';
import { useGetCurrentAbilities } from 'rtk-query/ability';
import CustomErrorFallback from '../ErrorBoundary';

const RequestForm = (props) => {
  const {
    data: orgsResponse,
    isSuccess: isOrgsSuccess,
    isError: isOrgsError,
    error: orgsError,
  } = useGetOrgsQuery({});
  const theme = useTheme();
  let orgs = orgsResponse?.organizations || [];
  const { organization, setOrganization, setKeys } = props;
  const [skip, setSkip] = React.useState(true);

  const { notify } = useNotification();

  useGetCurrentAbilities(organization, setKeys, skip);

  useEffect(() => {
    if (isOrgsError) {
      notify({
        message: `There was an error fetching available data ${orgsError?.data}`,
        event_type: EVENT_TYPES.ERROR,
      });
    }
  }, [orgsError]);

  const handleOrgSelect = (e) => {
    const id = e.target.value;
    const selected = orgs.find((org) => org.id === id);
    setOrganization({ organization: selected });
    setSkip(false);
  };

  return (
    <NoSsr>
      <form>
        <ErrorSectionContent>
          <div>
            <StyledTypography variant="h6" component="h6">
              Request More Role(s)
            </StyledTypography>
            <StyledTextField id="request-message" minRows={3} maxRows={4} fullWidth multiline />
          </div>
          <FormControl fullWidth component="fieldset">
            <StyledTypography variant="h6" component="h6">
              Select Recipient
            </StyledTypography>
            <FormGroup>
              <StyledFormControlLabel
                key="SelectRecipient"
                control={
                  <StyledSelect
                    fullWidth
                    value={organization?.id ? organization.id : ''}
                    onChange={handleOrgSelect}
                    SelectDisplayProps={{
                      style: { display: 'flex' },
                    }}
                  >
                    {isOrgsSuccess &&
                      orgs &&
                      orgs?.map((org) => {
                        return (
                          <MenuItem key={org.id} value={org.id}>
                            <OrgIcon
                              width="24"
                              height="24"
                              secondaryFill={theme.palette.icon.secondary}
                            />
                            <OrgName>{org.name}</OrgName>
                          </MenuItem>
                        );
                      })}
                  </StyledSelect>
                }
              />
            </FormGroup>
          </FormControl>
          <StyledFormButton variant="outlined">Request Role(s)</StyledFormButton>
        </ErrorSectionContent>
      </form>
    </NoSsr>
  );
};

const mapDispatchToProps = (dispatch) => ({
  setOrganization: bindActionCreators(setOrganization, dispatch),
  setKeys: bindActionCreators(setKeys, dispatch),
});

const mapStateToProps = (state) => {
  const organization = state.get('organization');
  return {
    organization,
  };
};

const RequestFormWithErrorBoundary = (props) => {
  return (
    <NoSsr>
      <ErrorBoundary customFallback={CustomErrorFallback}>
        <Provider store={store}>
          <RequestForm {...props} />
        </Provider>
      </ErrorBoundary>
    </NoSsr>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(RequestFormWithErrorBoundary));

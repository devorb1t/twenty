import { aiModelsState } from '@/client-config/states/aiModelsState';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ModelConfiguration } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconBrandX, IconCode, IconWorld } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AgentCapabilityKey = keyof Pick<
  ModelConfiguration,
  'webSearch' | 'twitterSearch' | 'codeInterpreter'
>;

const StyledCapabilitiesContainer = styled.div`
  gap: ${themeCssVariables.spacing[2]};
`;
type SettingsAgentModelCapabilitiesProps = {
  selectedModelId: string;
  modelConfiguration: ModelConfiguration;
  onConfigurationChange: (configuration: ModelConfiguration) => void;
  disabled?: boolean;
};

export const SettingsAgentModelCapabilities = ({
  selectedModelId,
  modelConfiguration,
  onConfigurationChange,
  disabled = false,
}: SettingsAgentModelCapabilitiesProps) => {
  const aiModels = useAtomStateValue(aiModelsState);

  const selectedModel = aiModels.find((m) => m.modelId === selectedModelId);
  const capabilities = selectedModel?.capabilities;

  if (!isDefined(capabilities)) {
    return null;
  }

  if (
    !capabilities.webSearch &&
    !capabilities.twitterSearch &&
    !capabilities.codeInterpreter
  ) {
    return null;
  }

  const handleCapabilityToggle = (
    capability: AgentCapabilityKey,
    enabled: boolean,
  ) => {
    if (disabled) {
      return;
    }

    onConfigurationChange({
      ...modelConfiguration,
      [capability]: {
        enabled,
        configuration: modelConfiguration[capability]?.configuration || {},
      },
    });
  };

  const isCapabilityEnabled = (capability: AgentCapabilityKey) => {
    if (capability === 'webSearch' || capability === 'codeInterpreter') {
      return modelConfiguration[capability]?.enabled !== false;
    }

    return modelConfiguration[capability]?.enabled || false;
  };

  const capabilityItems = [
    ...(capabilities.webSearch
      ? [
          {
            key: 'webSearch' as const,
            label: t`Web Search`,
            Icon: IconWorld,
            enabled: isCapabilityEnabled('webSearch'),
          },
        ]
      : []),
    ...(capabilities.twitterSearch
      ? [
          {
            key: 'twitterSearch' as const,
            label: t`Twitter/X Search`,
            Icon: IconBrandX,
            enabled: isCapabilityEnabled('twitterSearch'),
          },
        ]
      : []),
    ...(capabilities.codeInterpreter
      ? [
          {
            key: 'codeInterpreter' as const,
            label: t`Code Interpreter`,
            Icon: IconCode,
            enabled: isCapabilityEnabled('codeInterpreter'),
          },
        ]
      : []),
  ];

  return (
    <Section>
      <InputLabel>{t`Capabilities`}</InputLabel>
      <StyledCapabilitiesContainer>
        {capabilityItems.map((capability) => (
          <MenuItemToggle
            key={capability.key}
            LeftIcon={capability.Icon}
            text={capability.label}
            toggled={capability.enabled}
            onToggleChange={(toggled) =>
              handleCapabilityToggle(capability.key, toggled)
            }
            disabled={disabled}
          />
        ))}
      </StyledCapabilitiesContainer>
    </Section>
  );
};

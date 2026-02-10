import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/utils/recordIdentifierToObjectRecordIdentifier';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

jest.mock('@/object-metadata/utils/getAvatarType', () => ({
  getAvatarType: jest.fn(() => 'rounded'),
}));

jest.mock('@/object-metadata/utils/getBasePathToShowPage', () => ({
  getBasePathToShowPage: jest.fn(
    ({ objectNameSingular }: { objectNameSingular: string }) =>
      `/object/${objectNameSingular}/`,
  ),
}));

describe('recordIdentifierToObjectRecordIdentifier', () => {
  const baseRecordIdentifier = {
    id: 'record-123',
    labelIdentifier: 'John Doe',
    imageIdentifier: 'https://example.com/avatar.jpg',
  };

  const baseObjectMetadataItem: ObjectMetadataItem = {
    nameSingular: 'person',
  } as ObjectMetadataItem;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ObjectRecordIdentifier with id, name, avatarUrl, avatarType, and linkToShowPage', () => {
    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: baseRecordIdentifier,
      objectMetadataItem: baseObjectMetadataItem,
    });

    expect(result).toEqual({
      id: 'record-123',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      avatarType: 'rounded',
      linkToShowPage: '/object/person/record-123',
    });
  });

  it('should use undefined for avatarUrl when imageIdentifier is null', () => {
    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: { ...baseRecordIdentifier, imageIdentifier: null },
      objectMetadataItem: baseObjectMetadataItem,
    });

    expect(result.avatarUrl).toBeUndefined();
  });

  it('should return empty linkToShowPage for NoteTarget', () => {
    const objectMetadataItem: ObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.NoteTarget,
    } as ObjectMetadataItem;

    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: baseRecordIdentifier,
      objectMetadataItem,
    });

    expect(result.linkToShowPage).toBe('');
  });

  it('should return empty linkToShowPage for TaskTarget', () => {
    const objectMetadataItem: ObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.TaskTarget,
    } as ObjectMetadataItem;

    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: baseRecordIdentifier,
      objectMetadataItem,
    });

    expect(result.linkToShowPage).toBe('');
  });

  it('should return empty linkToShowPage for WorkspaceMember', () => {
    const objectMetadataItem: ObjectMetadataItem = {
      nameSingular: CoreObjectNameSingular.WorkspaceMember,
    } as ObjectMetadataItem;

    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: baseRecordIdentifier,
      objectMetadataItem,
    });

    expect(result.linkToShowPage).toBe('');
  });

  it('should return empty linkToShowPage when record id is undefined', () => {
    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: {
        ...baseRecordIdentifier,
        id: undefined as unknown as string,
      },
      objectMetadataItem: baseObjectMetadataItem,
    });

    expect(result.linkToShowPage).toBe('');
  });
});
